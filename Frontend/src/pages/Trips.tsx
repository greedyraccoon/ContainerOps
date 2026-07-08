import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Trip {
  id: number;
  tripManifestNumber: string;
  vehicleId: number;
  vehicleRegistrationNumber: string;
  containerId: number;
  containerNumber: string;
  driverId: number;
  driverName: string;
  sourceLocation: string;
  destinationLocation: string;
  status: string;
  dispatchedAt: string | null;
  estimatedDeliveryAt: string;
  actualDeliveryAt: string | null;
  startingOdometer: number;
  endingOdometer: number | null;
}

interface TripsProps {
  searchQuery?: string;
}

const Trips = ({ searchQuery = '' }: TripsProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formTrip, setFormTrip] = useState({
    vehicleId: '',
    containerId: '',
    driverId: '',
    sourceLocation: '',
    destinationLocation: '',
    estimatedDeliveryAt: '',
    startingOdometer: ''
  });

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/trips');
      setTrips(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading dispatches:", err);
      setError("Failed to load vehicle trip manifests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Universal Filter matching Manifest #, Driver, or Routes
  const filteredTrips = trips.filter(trip => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const manifest = (trip.tripManifestNumber || '').toLowerCase();
    const source = (trip.sourceLocation || '').toLowerCase();
    const dest = (trip.destinationLocation || '').toLowerCase();
    const driver = (trip.driverName || '').toLowerCase();
    const vehicle = (trip.vehicleRegistrationNumber || '').toLowerCase();

    return (
      manifest.includes(cleanQuery) || 
      source.includes(cleanQuery) || 
      dest.includes(cleanQuery) ||
      driver.includes(cleanQuery) ||
      vehicle.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        vehicleId: parseInt(formTrip.vehicleId),
        containerId: parseInt(formTrip.containerId),
        driverId: parseInt(formTrip.driverId),
        sourceLocation: formTrip.sourceLocation,
        destinationLocation: formTrip.destinationLocation,
        estimatedDeliveryAt: formTrip.estimatedDeliveryAt,
        startingOdometer: parseFloat(formTrip.startingOdometer)
      };

      if (editingId !== null) {
        await apiClient.put(`/trips/${editingId}`, payload);
      } else {
        await apiClient.post('/trips', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchTrips();
    } catch (err) {
      console.error("Error creating/updating trip entry:", err);
      alert("Failed to commit trip assignment layout. Verify Vehicle, Container, and Driver IDs are valid.");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/trips/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormTrip({
        vehicleId: freshData.vehicleId?.toString() || '',
        containerId: freshData.containerId?.toString() || '',
        driverId: freshData.driverId?.toString() || '',
        sourceLocation: freshData.sourceLocation || '',
        destinationLocation: freshData.destinationLocation || '',
        estimatedDeliveryAt: freshData.estimatedDeliveryAt ? freshData.estimatedDeliveryAt.substring(0, 16) : '',
        startingOdometer: freshData.startingOdometer?.toString() || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching unique manifest context records:", err);
      alert("Could not load fresh context details.");
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm("Are you sure you want to completely void this fleet run manifest record?")) return;
    try {
      await apiClient.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Error archiving manifest row:", err);
      alert("Failed to drop operational manifest registry tracking row.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTrip({
      vehicleId: '', containerId: '', driverId: '',
      sourceLocation: '', destinationLocation: '', estimatedDeliveryAt: '', startingOdometer: ''
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trip Management</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Create New Trip
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Manifest #</th>
                <th className="p-4 font-semibold">Route</th>
                <th className="p-4 font-semibold">Fleet Deployment (IDs)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Dispatch / ETA Date</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading tracking manifests...</td></tr>
              ) : filteredTrips.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active trips currently logged.</td></tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-900 font-mono font-medium">{trip.tripManifestNumber}</td>
                    <td className="p-4 text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{trip.sourceLocation}</span><br/>
                      <span className="text-gray-400">➔</span> {trip.destinationLocation}
                    </td>
                    <td className="p-4 text-xs text-gray-600 space-y-0.5">
                      <div><span className="font-semibold text-gray-700">Driver:</span> {trip.driverName || `ID: ${trip.driverId}`}</div>
                      <div><span className="font-semibold text-gray-700">Vehicle:</span> {trip.vehicleRegistrationNumber || `ID: ${trip.vehicleId}`}</div>
                      <div><span className="font-semibold text-gray-700">Container:</span> {trip.containerNumber || `ID: ${trip.containerId}`}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        trip.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        trip.status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      <div><span className="font-semibold">Start:</span> {formatTime(trip.dispatchedAt)}</div>
                      <div><span className="font-semibold">Est. End:</span> {formatTime(trip.estimatedDeliveryAt)}</div>
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <button 
                        onClick={() => handleEditClick(trip.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900 hover:underline"
                      >
                        Void
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
        title={editingId !== null ? "Modify Route Assignment Plan" : "Dispatch New Run Setup"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver ID</label>
              <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.driverId}
                onChange={e => setFormTrip({...formTrip, driverId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
              <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.vehicleId}
                onChange={e => setFormTrip({...formTrip, vehicleId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Container ID</label>
              <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.containerId}
                onChange={e => setFormTrip({...formTrip, containerId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Nhava Sheva, Mumbai"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.sourceLocation}
                onChange={e => setFormTrip({...formTrip, sourceLocation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Location</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Wagholi, Pune"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.destinationLocation}
                onChange={e => setFormTrip({...formTrip, destinationLocation: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Odometer (km)</label>
              <input 
                type="number" 
                required
                step="0.1"
                placeholder="Initial metric count"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formTrip.startingOdometer}
                onChange={e => setFormTrip({...formTrip, startingOdometer: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Time</label>
              <input 
                type="datetime-local" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formTrip.estimatedDeliveryAt}
                onChange={e => setFormTrip({...formTrip, estimatedDeliveryAt: e.target.value})}
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
              {editingId !== null ? "Update Manifest" : "Dispatch Manifest"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Trips;