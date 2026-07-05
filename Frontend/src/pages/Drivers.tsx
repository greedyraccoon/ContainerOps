import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  status: string;
  createdAt?: string;
}

interface DriversProps {
  searchQuery?: string;
}

const Drivers = ({ searchQuery = '' }: DriversProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formDriver, setFormDriver] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    phoneNumber: '',
    status: 'AVAILABLE'
  });

  const fetchDrivers = async () => {
    try {
      const response = await apiClient.get('/drivers');
      setDrivers(response.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load driver data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Universal Filter
  const filteredDrivers = drivers.filter(driver => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.toLowerCase();
    const license = (driver.licenseNumber || '').toLowerCase();
    const phone = (driver.phoneNumber || '').toLowerCase();
    const status = (driver.status || '').toLowerCase();

    return (
      fullName.includes(cleanQuery) || 
      license.includes(cleanQuery) || 
      phone.includes(cleanQuery) ||
      status.includes(cleanQuery)
    );
  });

  // Handle Add (POST) and Edit (PUT)
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await apiClient.put(`/drivers/${editingId}`, formDriver);
      } else {
        await apiClient.post('/drivers', formDriver);
      }
      setIsModalOpen(false); 
      resetForm();
      fetchDrivers(); 
    } catch (err) {
      console.error("Error saving driver:", err);
      alert("Failed to save driver. Check console for details.");
    }
  };

  // Fetch fresh data by ID and open modal in Edit mode
  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/drivers/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormDriver({
        firstName: freshData.firstName,
        lastName: freshData.lastName,
        licenseNumber: freshData.licenseNumber,
        phoneNumber: freshData.phoneNumber,
        status: freshData.status
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching driver by ID:", err);
      alert("Could not fetch the latest driver details from the server.");
    }
  };

  // Inline status updates
  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await apiClient.patch(`/drivers/${id}/status?status=${nextStatus}`);
      fetchDrivers(); 
    } catch (err) {
      console.error("Error updating driver status:", err);
      alert("Failed to update status on backend.");
    }
  };

  // Delete Driver
  const handleDeleteDriver = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this driver?")) return;
    try {
      await apiClient.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      console.error("Error deleting driver:", err);
      alert("Failed to delete driver record.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormDriver({ firstName: '', lastName: '', licenseNumber: '', phoneNumber: '', status: 'AVAILABLE' });
  };

  const renderDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Driver Directory</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Driver
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">License #</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Added On</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No drivers found.</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{driver.firstName} {driver.lastName}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{driver.licenseNumber}</td>
                    <td className="p-4 text-gray-600">{driver.phoneNumber}</td>
                    <td className="p-4">
                      <select
                        value={driver.status}
                        onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer outline-none transition-colors ${
                          driver.status === 'ON_ROUTE' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
                          driver.status === 'OFF_DUTY' ? 'bg-gray-50 border-gray-200 text-gray-800' :
                          'bg-green-50 border-green-200 text-green-800'
                        }`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ON_ROUTE">ON_ROUTE</option>
                        <option value="OFF_DUTY">OFF_DUTY</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {renderDate(driver.createdAt)}
                    </td>
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(driver.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteDriver(driver.id)}
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
        title={editingId !== null ? "Edit Driver Details" : "Add New Driver"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formDriver.firstName}
                onChange={e => setFormDriver({...formDriver, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formDriver.lastName}
                onChange={e => setFormDriver({...formDriver, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
              value={formDriver.licenseNumber}
              onChange={e => setFormDriver({...formDriver, licenseNumber: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formDriver.phoneNumber}
              onChange={e => setFormDriver({...formDriver, phoneNumber: e.target.value})}
            />
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingId !== null ? "Update Driver" : "Save Driver"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Drivers;