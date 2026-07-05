import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Container {
  id: number;
  containerNumber: string;
  type: string;
  status: string;
  createdAT?: string; 
  createdAt?: string; 
}

interface ContainersProps {
  searchQuery?: string;
}

const Containers = ({ searchQuery = '' }: ContainersProps) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formContainer, setFormContainer] = useState({
    containerNumber: '',
    type: 'STANDARD_20FT',
    status: 'AVAILABLE'
  });

  const fetchContainers = async () => {
    try {
      const response = await apiClient.get('/containers');
      setContainers(response.data);
    } catch (err) {
      console.error("Error fetching containers:", err);
      setError("Failed to load container data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  // 🔥 Null-Safe Robust Universal Filter
  const filteredContainers = containers.filter(container => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const containerNum = (container.containerNumber || '').toLowerCase();
    const containerStatus = (container.status || '').toLowerCase();
    const containerType = (container.type || '').toLowerCase();

    return (
      containerNum.includes(cleanQuery) || 
      containerStatus.includes(cleanQuery) || 
      containerType.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await apiClient.put(`/containers/${editingId}`, formContainer);
      } else {
        await apiClient.post('/containers', formContainer);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchContainers();
    } catch (err) {
      console.error("Error saving container:", err);
      alert("Failed to save container. Verify format rules (e.g., MSCU1234567).");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/containers/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormContainer({
        containerNumber: freshData.containerNumber,
        type: freshData.type,
        status: freshData.status
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching container by ID:", err);
      alert("Could not fetch the latest container details from the server.");
    }
  };

  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await apiClient.patch(`/containers/${id}/status?status=${nextStatus}`);
      fetchContainers(); 
    } catch (err) {
      console.error("Error updating container status:", err);
      alert("Failed to update status on backend.");
    }
  };

  const handleDeleteContainer = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this container from records?")) return;
    try {
      await apiClient.delete(`/containers/${id}`);
      fetchContainers();
    } catch (err) {
      console.error("Error deleting container:", err);
      alert("Failed to delete container record.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormContainer({ containerNumber: '', type: 'STANDARD_20FT', status: 'AVAILABLE' });
  };

  const renderDate = (container: Container) => {
    const dateString = container.createdAT || container.createdAt;
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Container Tracking</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Container
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Container #</th>
                <th className="p-4 font-semibold">Type/Size</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Added On</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading containers...</td></tr>
              ) : filteredContainers.length === 0 ? ( // 🎯 Checked against filtered array
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No containers found.</td></tr>
              ) : (
                filteredContainers.map((container) => ( // 🎯 Mapped from filtered array
                  <tr key={container.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 font-mono">{container.containerNumber}</td>
                    <td className="p-4 text-gray-600">{container.type}</td>
                    <td className="p-4">
                      <select
                        value={container.status}
                        onChange={(e) => handleStatusChange(container.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer outline-none transition-colors ${
                          container.status === 'IN_TRANSIT' ? 'bg-blue-50 border-blue-200 text-blue-800' : 
                          container.status === 'MAINTENANCE' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                          container.status === 'RETIRED' ? 'bg-red-50 border-red-200 text-red-800' :
                          'bg-green-50 border-green-200 text-green-800'
                        }`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </td>
                    
                    <td className="p-4 text-gray-500 text-sm">
                      {renderDate(container)}
                    </td>
                    
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(container.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteContainer(container.id)}
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
        title={editingId !== null ? "Edit Container Details" : "Add New Container"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container Number</label>
            <input 
              type="text" 
              required
              pattern="^[A-Z]{4}\d{7}$"
              title="Must be 4 letters followed by 7 digits (e.g., MSCU1234567)"
              placeholder="e.g., MSCU1234567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
              value={formContainer.containerNumber}
              onChange={e => setFormContainer({...formContainer, containerNumber: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type/Size</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={formContainer.type}
                onChange={e => setFormContainer({...formContainer, type: e.target.value})}
              >
                <option value="STANDARD_20FT">20ft Standard</option>
                <option value="STANDARD_40FT">40ft Standard</option>
                <option value="REFRIGERATED">Refrigerated</option>
                <option value="FLAT_RACK">Flat Rack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={formContainer.status}
                onChange={e => setFormContainer({...formContainer, status: e.target.value})}
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingId !== null ? "Update Container" : "Save Container"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Containers;