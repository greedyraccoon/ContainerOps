import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal';

interface Expense {
  id: number;
  tripId: number;
  expenseType: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptUrl: string;
  status: string;
}

interface ExpensesProps {
  searchQuery?: string;
}

const Expenses = ({ searchQuery = '' }: ExpensesProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formExpense, setFormExpense] = useState({
    tripId: '',
    expenseType: 'FUEL', // Standard default item matching common ExpenseType Enums
    amount: '',
    expenseDate: '',
    description: '',
    receiptUrl: ''
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/expenses');
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load operational expenses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Universal Filter
  const filteredExpenses = expenses.filter(expense => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    const type = (expense.expenseType || '').toLowerCase();
    const desc = (expense.description || '').toLowerCase();
    const trip = expense.tripId?.toString() || '';
    const status = (expense.status || '').toLowerCase();

    return (
      type.includes(cleanQuery) || 
      desc.includes(cleanQuery) || 
      trip.includes(cleanQuery) ||
      status.includes(cleanQuery)
    );
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formExpense,
        tripId: parseInt(formExpense.tripId),
        amount: parseFloat(formExpense.amount)
      };

      if (editingId !== null) {
        await apiClient.put(`/expenses/${editingId}`, payload);
      } else {
        await apiClient.post('/expenses', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Failed to save operational expense. Verify Trip ID exists in database.");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await apiClient.get(`/expenses/${id}`);
      const freshData = response.data;
      
      setEditingId(freshData.id);
      setFormExpense({
        tripId: freshData.tripId?.toString() || '',
        expenseType: freshData.expenseType || 'FUEL',
        amount: freshData.amount?.toString() || '',
        expenseDate: freshData.expenseDate || '',
        description: freshData.description || '',
        receiptUrl: freshData.receiptUrl || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error retrieving individual expense log:", err);
      alert("Could not pull up latest log detail values.");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Permanently erase this operational expense entry log?")) return;
    try {
      await apiClient.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Error destroying target log:", err);
      alert("Failed to delete the selected entry record.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormExpense({ tripId: '', expenseType: 'FUEL', amount: '', expenseDate: '', description: '', receiptUrl: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Operational Expenses</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Log Expense
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Trip Context ID</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Reference / Details</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading expense streams...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No operational expenses found.</td></tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-700 font-medium">{exp.expenseDate}</td>
                    <td className="p-4"><span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 border rounded-md text-gray-800 uppercase tracking-wider">{exp.expenseType}</span></td>
                    <td className="p-4 text-sm font-mono text-gray-600">Trip #{exp.tripId}</td>
                    <td className="p-4 text-red-600 font-semibold">₹{exp.amount?.toFixed(2)}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {exp.description || '-' }
                      {exp.receiptUrl && (
                        <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="block text-xs text-blue-500 underline mt-0.5">View Receipt Link</a>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-4">
                      <button 
                        onClick={() => handleEditClick(exp.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
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
        title={editingId !== null ? "Modify Expense Logs Record" : "Log New Operations Expense"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip ID Ref</label>
              <input 
                type="number" 
                required
                placeholder="Linked Target database entry ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formExpense.tripId}
                onChange={e => setFormExpense({...formExpense, tripId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Stream Type</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={formExpense.expenseType}
                onChange={e => setFormExpense({...formExpense, expenseType: e.target.value})}
              >
                {/* Adjust items here to map exactly to your project's backend Java ExpenseType Enum strings! */}
                <option value="FUEL">Fuel</option>
                <option value="TOLL">Toll Charges</option>
                <option value="MAINTENANCE">Maintenance / Repairs</option>
                <option value="DRIVER_ALLOWANCE">Driver Allowance</option>
                <option value="MISCELLANEOUS">Miscellaneous / Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (INR)</label>
              <input 
                type="number" 
                min="0.1"
                step="0.01"
                required
                placeholder="₹ Amount"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-red-600"
                value={formExpense.amount}
                onChange={e => setFormExpense({...formExpense, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Charging Date</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formExpense.expenseDate}
                onChange={e => setFormExpense({...formExpense, expenseDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Description / Core Details</label>
            <input 
              type="text" 
              placeholder="e.g., Highway toll tax payment info, fuel voucher receipts reference notes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formExpense.description}
              onChange={e => setFormExpense({...formExpense, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Attachment URL Path</label>
            <input 
              type="text" 
              placeholder="e.g., https://storage.googleapis.com/receipts/rec-0912.pdf"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs text-blue-600"
              value={formExpense.receiptUrl}
              onChange={e => setFormExpense({...formExpense, receiptUrl: e.target.value})}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {editingId !== null ? "Update Log Entry" : "Save Log Entry"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;

