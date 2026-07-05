import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  customerType: string;
  active: boolean; 
}

interface CustomersProps {
  searchQuery?: string;
}

const Customers = ({ searchQuery = '' }: CustomersProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle between viewing active list or archived list
  const [viewMode, setViewMode] = useState<'active' | 'inactive'>('active');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formCustomer, setFormCustomer] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    billingAddress: '',
    customerType: 'DIRECT_SHIPPER',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // 🎯 Prefix removed: apiClient already handles /api/v1
      const response = await apiClient.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customer directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [viewMode]);

  // Universal Filter + Status Check
  const filteredCustomers = customers.filter(customer => {
    const matchStatus = viewMode === 'active' ? customer.active !== false : customer.active === false;
    if (!matchStatus) return false;

    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const company = (customer.companyName || '').toLowerCase();
    const contact = (customer.contactPerson || '').toLowerCase();
    const gst = (customer.gstNumber || '').toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    const type = (customer.customerType || '').toLowerCase();

    return (
      company.includes(cleanQuery) || 
      contact.includes(cleanQuery) || 
      gst.includes(cleanQuery) ||
      phone.includes(cleanQuery) ||
      type.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await apiClient.put(`/customers/${editingId}`, formCustomer);
      } else {
        await apiClient.post('/customers', formCustomer);
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      alert("Failed to save customer. Please check entry rules (GST/Phone format).");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormCustomer({
        companyName: freshData.companyName,
        contactPerson: freshData.contactPerson,
        email: freshData.email,
        phone: freshData.phone,
        gstNumber: freshData.gstNumber,
        billingAddress: freshData.billingAddress,
        customerType: freshData.customerType || 'DIRECT_SHIPPER'
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching customer by ID:", err);
      alert("Could not fetch details.");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";
    
    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;
    
    try {
      await apiClient.patch(`/customers/${id}/status?isActive=${newStatus}`);
      fetchCustomers(); 
    } catch (err) {
      console.error("Error updating customer status:", err);
      alert("Failed to update status on backend.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormCustomer({ 
      companyName: '', contactPerson: '', email: '', phone: '', 
      gstNumber: '', billingAddress: '', customerType: 'DIRECT_SHIPPER' 
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Customer Directory</h1>
          
          <div className="flex bg-gray-200 p-1 rounded-lg text-sm">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('inactive')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${viewMode === 'inactive' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Archived 📦
            </button>
          </div>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Customer
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Company Name</th>
                <th className="p-4 font-semibold">Contact Person</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">GST Number</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No {viewMode} customers found.</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{customer.companyName}</td>
                    <td className="p-4 text-gray-600">{customer.contactPerson}</td>
                    <td className="p-4 text-gray-600 text-sm">{customer.customerType}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm uppercase">{customer.gstNumber}</td>
                    <td className="p-4 text-gray-600">{customer.phone}</td>
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(customer.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleToggleStatus(customer.id, customer.active !== false)} 
                        className={`text-sm font-medium hover:underline ${viewMode === 'active' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {viewMode === 'active' ? 'Deactivate' : 'Activate ✨'}
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
        title={editingId !== null ? "Edit Customer Details" : "Add New Customer"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formCustomer.companyName}
                onChange={e => setFormCustomer({...formCustomer, companyName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={formCustomer.customerType}
                onChange={e => setFormCustomer({...formCustomer, customerType: e.target.value})}
              >
                <option value="DIRECT_SHIPPER">Direct Shipper</option>
                <option value="FREIGHT_FORWARDER">Freight Forwarder</option>
                <option value="CUSTOMS_BROKER">Customs Broker</option>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formCustomer.contactPerson}
                onChange={e => setFormCustomer({...formCustomer, contactPerson: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                required
                pattern="^[6-9]\d{9}$" 
                title="Must be a valid 10-digit Indian mobile number starting with 6-9"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formCustomer.phone}
                onChange={e => setFormCustomer({...formCustomer, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formCustomer.email}
                onChange={e => setFormCustomer({...formCustomer, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input 
                type="text" 
                required
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" 
                title="Must be a standard 15-character Indian GSTIN"
                placeholder="27ABCDE1234F2Z5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                value={formCustomer.gstNumber}
                onChange={e => setFormCustomer({...formCustomer, gstNumber: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
            <textarea 
              required
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formCustomer.billingAddress}
              onChange={e => setFormCustomer({...formCustomer, billingAddress: e.target.value})}
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
              {editingId !== null ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;