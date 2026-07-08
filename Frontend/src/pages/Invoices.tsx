import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  tripId: number;
  baseFreightCharge: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: string; // Maps directly to InvoiceStatus enum
}

interface InvoicesProps {
  searchQuery?: string;
}

const Invoices = ({ searchQuery = '' }: InvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formInvoice, setFormInvoice] = useState({
    customerId: '',
    tripId: '',
    baseFreightCharge: '',
    taxAmount: '',
    dueDate: '',
    status: 'ISSUED'
  });

  // Compute validation lock status flag 
  const isFinancialLocked = editingId !== null && formInvoice.status !== 'DRAFT';

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/invoices');
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to load operational invoice ledger entries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Universal Filter matching invoice numbers, names, or status
  const filteredInvoices = invoices.filter(invoice => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const num = (invoice.invoiceNumber || '').toLowerCase();
    const cust = (invoice.customerName || '').toLowerCase();
    const stat = (invoice.status || '').toLowerCase();
    const trip = invoice.tripId?.toString() || '';

    return (
      num.includes(cleanQuery) || 
      cust.includes(cleanQuery) || 
      stat.includes(cleanQuery) ||
      trip.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customerId: parseInt(formInvoice.customerId),
        tripId: parseInt(formInvoice.tripId),
        baseFreightCharge: parseFloat(formInvoice.baseFreightCharge),
        taxAmount: parseFloat(formInvoice.taxAmount),
        dueDate: formInvoice.dueDate
      };

      if (editingId !== null) {
        await apiClient.put(`/invoices/${editingId}`, payload);
      } else {
        await apiClient.post('/invoices', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchInvoices();
    } catch (err) {
      console.error("Error committing invoice payload:", err);
      alert("Failed to save operational invoice ledger entry. Check structural mapping IDs.");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormInvoice({
        customerId: freshData.customerId?.toString() || '',
        tripId: freshData.tripId?.toString() || '',
        baseFreightCharge: freshData.baseFreightCharge?.toString() || '',
        taxAmount: freshData.taxAmount?.toString() || '',
        dueDate: freshData.dueDate || '',
        status: freshData.status || 'ISSUED'
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error pulling individual invoice profile:", err);
      alert("Could not pull up latest record values from database.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormInvoice({ customerId: '', tripId: '', baseFreightCharge: '', taxAmount: '', dueDate: '', status: 'ISSUED' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financials & Invoices</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Generate Invoice
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount Summary</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading billing registry ledger streams...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-gray-900">
                      {inv.invoiceNumber}
                      <div className="text-xs text-gray-400 font-sans mt-0.5">
                        Trip Context ID: #{inv.tripId || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {inv.customerName || (inv.customerId ? `Customer ID: ${inv.customerId}` : 'Walk-in Client')}
                    </td>
                    <td className="p-4 text-sm text-gray-600 space-y-0.5">
                      <div className="font-semibold text-gray-900">₹{inv.totalAmount?.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Base: ₹{inv.baseFreightCharge} | Tax: ₹{inv.taxAmount}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        inv.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {inv.status || 'ISSUED'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{inv.dueDate}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(inv.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Overlay Panel Context Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId !== null ? "Modify Invoice Calculations Structure" : "Generate Fleet Operations Invoice"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formInvoice.customerId}
                onChange={e => setFormInvoice({...formInvoice, customerId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip ID</label>
              <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formInvoice.tripId}
                onChange={e => setFormInvoice({...formInvoice, tripId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Freight Charge (INR)</label>
              <input 
                type="number" 
                min="1.0"
                step="0.01"
                required
                placeholder="₹ Base cost"
                readOnly={isFinancialLocked}
                className={`w-full border rounded-lg px-3 py-2 outline-none font-medium ${
                  isFinancialLocked ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                value={formInvoice.baseFreightCharge}
                onChange={e => setFormInvoice({...formInvoice, baseFreightCharge: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (INR)</label>
              <input 
                type="number" 
                min="0.0"
                step="0.01"
                required
                placeholder="₹ Tax component"
                readOnly={isFinancialLocked}
                className={`w-full border rounded-lg px-3 py-2 outline-none font-medium ${
                  isFinancialLocked ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                value={formInvoice.taxAmount}
                onChange={e => setFormInvoice({...formInvoice, taxAmount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Due Date</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formInvoice.dueDate}
                onChange={e => setFormInvoice({...formInvoice, dueDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Collection Status</label>
              <div className="pt-2">
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg uppercase tracking-wider ${
                  formInvoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  formInvoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                  formInvoice.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {formInvoice.status}
                </span>
              </div>
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
              {editingId !== null ? "Update Ledger Invoice" : "Generate Log Invoice"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;