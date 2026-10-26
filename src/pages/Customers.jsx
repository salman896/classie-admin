import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import { Search, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers({ search: searchQuery });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.is_active;
    setActionLoading(true);
    try {
      const res = await customerService.toggleCustomerStatus(customer.uid, newStatus);
      if (res.result === 'success') {
        setCustomers((prev) =>
          prev.map((c) => (c.uid === customer.uid ? { ...c, is_active: newStatus, status_display: newStatus ? 'Active' : 'Inactive' } : c))
        );
        showToast(res.message);
      }
    } catch (err) {
      showToast('Failed to update status', true);
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Customer Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Inspect customer profiles, referral IDs, order history, and toggle account access
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-[#9d71c7]/20 transition-all"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9d71c7] hover:bg-[#8a5bb8] transition-all cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl text-sm font-semibold border ${
            toastMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Referral ID</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Orders</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                    No customer records found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.uid} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-xs">{c.name || 'Anonymous User'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Joined: {c.date_joined?.split(' ')[0]}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-800">{c.mobile_number}</div>
                      <div className="text-[11px] text-slate-500">{c.email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200/60">
                        {c.referral_id || '—'}
                      </code>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-800 font-medium">{c.city || '—'}</div>
                      <div className="text-[11px] text-slate-400">{c.state || ''}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {c.orders_count} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                          title="View profile details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            c.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                          }`}
                        >
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Customer Profile Details</h4>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Full Name
                  </span>
                  <div className="font-bold text-slate-900">{selectedCustomer.name || 'Not provided'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Mobile Number
                  </span>
                  <div className="font-bold text-slate-900">{selectedCustomer.mobile_number}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Email
                  </span>
                  <div className="text-slate-700">{selectedCustomer.email || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Date of Birth
                  </span>
                  <div className="text-slate-700">{selectedCustomer.dob || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Referral Code
                  </span>
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                    {selectedCustomer.referral_id || '—'}
                  </code>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Location
                  </span>
                  <div className="text-slate-700">
                    {selectedCustomer.city ? `${selectedCustomer.city}, ${selectedCustomer.state}` : '—'}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Account UID
                </span>
                <div className="text-[11px] text-slate-500 font-mono break-all">{selectedCustomer.uid}</div>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
