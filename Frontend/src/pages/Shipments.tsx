import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

// Matches ShipmentResponseDto.java exactly
interface Shipment {
  id: number;
  shipmentNumber?: string;
  customerId: number;
  customerName?: string;
  containerId: number;
  containerNumber?: string;
  shippingLine: string;
  blNumber: string;
  direction: string;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  status: string;
  linkedTripId?: number | null;
}

interface ShipmentsProps {
  searchQuery?: string;
}

const Shipments = ({ searchQuery = '' }: ShipmentsProps) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Matches ShipmentRequestDto.java exactly
  const [formShipment, setFormShipment] = useState({
    customerId: '',
    containerId: '',
    shippingLine: '',
    blNumber: '',
    direction: 'EXPORT',
    origin: '',
    destination: '',
    etd: '',
    eta: ''
  });

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/shipments');
      setShipments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching shipments:", err);
      setError("Failed to load shipments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter(shipment => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const bl = (shipment.blNumber || '').toLowerCase();
    const orig = (shipment.origin || '').toLowerCase();
    const dest = (shipment.destination || '').toLowerCase();
    const stat = (shipment.status || '').toLowerCase();
    const cust = (shipment.customerName || '').toLowerCase();
    const cont = (shipment.containerNumber || '').toLowerCase();

    return (
      bl.includes(cleanQuery) || 
      orig.includes(cleanQuery) || 
      dest.includes(cleanQuery) ||
      stat.includes(cleanQuery) ||
      cust.includes(cleanQuery) ||
      cont.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Ensure IDs are sent as numbers to satisfy @NotNull Long in Java
      const payload = {
        ...formShipment,
        customerId: parseInt(formShipment.customerId),
        containerId: parseInt(formShipment.containerId)
      };

      if (editingId !== null) {
        await apiClient.put(`/shipments/${editingId}`, payload);
      } else {
        await apiClient.post('/shipments', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchShipments();
    } catch (err) {
      console.error("Error saving shipment:", err);
      alert("Failed to save shipment. Ensure Customer ID and Container ID exist in DB.");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/shipments/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormShipment({
        customerId: freshData.customerId?.toString() || '',
        containerId: freshData.containerId?.toString() || '',
        shippingLine: freshData.shippingLine || '',
        blNumber: freshData.blNumber || '',
        direction: freshData.direction || 'EXPORT',
        origin: freshData.origin || '',
        destination: freshData.destination || '',
        etd: freshData.etd ? freshData.etd.substring(0, 16) : '', 
        eta: freshData.eta ? freshData.eta.substring(0, 16) : ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching shipment by ID:", err);
      alert("Could not fetch details.");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/shipments/${id}/status?status=${newStatus}`);
      fetchShipments();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleDeleteShipment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await apiClient.delete(`/shipments/${id}`);
      fetchShipments();
    } catch (err) {
      console.error("Error deleting shipment:", err);
      alert("Failed to delete shipment.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormShipment({
      customerId: '', containerId: '', shippingLine: '', blNumber: '',
      direction: 'EXPORT', origin: '', destination: '', etd: '', eta: ''
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(); 
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">EXIM Shipments</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + New Shipment
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">BL Number</th>
                <th className="p-4 font-semibold">Customer & Container</th>
                <th className="p-4 font-semibold">Origin → Dest</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">ETD / ETA</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading shipments...</td></tr>
              ) : filteredShipments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No shipments found.</td></tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-gray-900">
                      {s.blNumber}<br/>
                      <span className="text-xs text-gray-500 font-sans">{s.shippingLine}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      <span className="font-medium">{s.customerName || `ID: ${s.customerId}`}</span><br/>
                      <span className="font-mono text-gray-500">{s.containerNumber || `ID: ${s.containerId}`}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{s.origin} →<br/>{s.destination}</td>
                    <td className="p-4">
                      <select 
                        value={s.status} 
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer outline-none transition-colors ${
                          s.status === 'DELIVERED' ? 'bg-green-50 border-green-200 text-green-800' : 
                          s.status === 'BOOKED' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                          'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}
                      >
                        <option value="BOOKED">BOOKED</option>
                        <option value="AT_ORIGIN_PORT">AT ORIGIN PORT</option>
                        <option value="ON_VESSEL">ON VESSEL</option>
                        <option value="DISCHARGED_AT_DESTINATION">DISCHARGED</option>
                        <option value="INLAND_TRANSIT">INLAND TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      <span className="font-medium">D:</span> {formatDateTime(s.etd)}<br/>
                      <span className="font-medium">A:</span> {formatDateTime(s.eta)}
                    </td>
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(s.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteShipment(s.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId !== null ? "Edit Shipment" : "Create New Shipment"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input 
                type="number" 
                required
                placeholder="Database ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.customerId}
                onChange={e => setFormShipment({...formShipment, customerId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Container ID</label>
              <input 
                type="number" 
                required
                placeholder="Database ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.containerId}
                onChange={e => setFormShipment({...formShipment, containerId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BL Number</label>
              <input 
                type="text" 
                required
                placeholder="e.g., MSKU987654321"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                value={formShipment.blNumber}
                onChange={e => setFormShipment({...formShipment, blNumber: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Line</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Maersk"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.shippingLine}
                onChange={e => setFormShipment({...formShipment, shippingLine: e.target.value})}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formShipment.direction}
                onChange={e => setFormShipment({...formShipment, direction: e.target.value})}
              >
                <option value="IMPORT">Import</option>
                <option value="EXPORT">Export</option>
              </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Port/Location</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.origin}
                onChange={e => setFormShipment({...formShipment, origin: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Port/Location</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.destination}
                onChange={e => setFormShipment({...formShipment, destination: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Departure (ETD)</label>
              <input 
                type="datetime-local" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.etd}
                onChange={e => setFormShipment({...formShipment, etd: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival (ETA)</label>
              <input 
                type="datetime-local" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formShipment.eta}
                onChange={e => setFormShipment({...formShipment, eta: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {editingId !== null ? "Update Shipment" : "Save Shipment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shipments;