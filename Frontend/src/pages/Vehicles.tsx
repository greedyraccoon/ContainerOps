import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  type: string;
  capacityTons: number | null;
  status: string;
  createdAt?: string;
}

interface VehiclesProps {
  searchQuery?: string;
}

const Vehicles = ({ searchQuery = '' }: VehiclesProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formVehicle, setFormVehicle] = useState({
    make: '',
    model: '',
    licensePlate: '',
    type: 'PRIME_MOVER', 
    capacityTons: '',
    status: 'AVAILABLE' 
  });

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicle fleet data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Universal Filter
  const filteredVehicles = vehicles.filter(vehicle => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const makeModel = `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase();
    const plate = (vehicle.licensePlate || '').toLowerCase();
    const status = (vehicle.status || '').toLowerCase();
    const type = (vehicle.type || '').toLowerCase();

    return (
      makeModel.includes(cleanQuery) || 
      plate.includes(cleanQuery) || 
      status.includes(cleanQuery) ||
      type.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formVehicle,
        capacityTons: formVehicle.capacityTons ? parseFloat(formVehicle.capacityTons) : null
      };

      if (editingId !== null) {
        await apiClient.put(`/vehicles/${editingId}`, payload);
      } else {
        await apiClient.post('/vehicles', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      alert("Failed to save vehicle. Make sure the license plate matches the exact format (e.g., MH-12-AB-1234).");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/vehicles/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormVehicle({
        make: freshData.make,
        model: freshData.model,
        licensePlate: freshData.licensePlate,
        type: freshData.type || 'PRIME_MOVER',
        capacityTons: freshData.capacityTons ? freshData.capacityTons.toString() : '',
        status: freshData.status
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching vehicle by ID:", err);
      alert("Could not fetch the latest vehicle details from the server.");
    }
  };

  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await apiClient.patch(`/vehicles/${id}/status?status=${nextStatus}`);
      fetchVehicles();
    } catch (err) {
      console.error("Error updating vehicle status:", err);
      alert("Failed to update status on backend.");
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from the fleet?")) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      alert("Failed to delete vehicle record.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormVehicle({ make: '', model: '', licensePlate: '', type: 'PRIME_MOVER', capacityTons: '', status: 'AVAILABLE' });
  };

  const renderDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Vehicle
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Make / Model</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">License Plate</th>
                <th className="p-4 font-semibold">Capacity (Tons)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading fleet...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No vehicles found.</td></tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{vehicle.make} {vehicle.model}</td>
                    <td className="p-4 text-gray-600 text-sm">{vehicle.type}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{vehicle.licensePlate}</td>
                    <td className="p-4 text-gray-600">{vehicle.capacityTons ? `${vehicle.capacityTons} t` : '-'}</td>
                    <td className="p-4">
                      <select
                        value={vehicle.status}
                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer outline-none transition-colors ${
                          vehicle.status === 'IN_TRANSIT' ? 'bg-blue-50 border-blue-200 text-blue-800' : 
                          vehicle.status === 'MAINTENANCE' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                          vehicle.status === 'RETIRED' ? 'bg-red-50 border-red-200 text-red-800' :
                          'bg-green-50 border-green-200 text-green-800'
                        }`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </td>
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(vehicle.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteVehicle(vehicle.id)}
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
        title={editingId !== null ? "Edit Vehicle Details" : "Add New Vehicle"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Tata"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formVehicle.make}
                onChange={e => setFormVehicle({...formVehicle, make: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Prima"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formVehicle.model}
                onChange={e => setFormVehicle({...formVehicle, model: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={formVehicle.type}
                onChange={e => setFormVehicle({...formVehicle, type: e.target.value})}
              >
                <option value="PRIME_MOVER">Prime Mover</option>
                <option value="CONTAINER_CHASSIS">Container Chassis</option>
                <option value="FLATBED">Flatbed</option>
                <option value="LIGHT_COMMERCIAL">Light Commercial</option>
                <option value="TRUCK">Truck</option>
                <option value="TRAILER">Trailer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Tons)</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="e.g., 10.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formVehicle.capacityTons}
                onChange={e => setFormVehicle({...formVehicle, capacityTons: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
            <input 
              type="text" 
              required
              pattern="^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$"
              title="Must follow standard RTO format (e.g., MH-12-AB-1234)"
              placeholder="e.g., MH-12-AB-1234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
              value={formVehicle.licensePlate}
              onChange={e => setFormVehicle({...formVehicle, licensePlate: e.target.value.toUpperCase()})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              value={formVehicle.status}
              onChange={e => setFormVehicle({...formVehicle, status: e.target.value})}
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
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
              {editingId !== null ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;