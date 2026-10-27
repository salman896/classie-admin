import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Percent,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Tag,
  Filter,
} from 'lucide-react';
import { influencerService } from '../services/influencerService';

export default function Influencers() {
  const [influencers, setInfluencers] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    influencer: null,
    reason: '',
  });

  // Commission edit state
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [customCommission, setCustomCommission] = useState(10);

  useEffect(() => {
    fetchInfluencers();
  }, [selectedStatus]);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await influencerService.getInfluencers(params);
      const isSuccess = res.result === 'success' || res.status === 'success';
      if (isSuccess) {
        // Handle pagination data format: res.data (array) or res.data.results
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setInfluencers(list);
        if (res.metrics) {
          setMetrics(res.metrics);
        } else if (res.data?.metrics) {
          setMetrics(res.data.metrics);
        }
      } else {
        setError(res.message || 'Failed to fetch influencers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading influencer applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInfluencers();
  };

  const handleApprove = async (inf) => {
    try {
      setActionLoadingId(inf.uid);
      await influencerService.updateApproval(inf.uid, {
        action: 'approve',
        commission_percentage: customCommission || 10,
      });
      fetchInfluencers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve influencer');
    } finally {
      setActionLoadingId(null);
      setEditingCommissionId(null);
    }
  };

  const handleOpenReject = (inf) => {
    setRejectModal({
      isOpen: true,
      influencer: inf,
      reason: '',
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.influencer) return;
    try {
      setActionLoadingId(rejectModal.influencer.uid);
      await influencerService.updateApproval(rejectModal.influencer.uid, {
        action: 'reject',
        rejection_reason: rejectModal.reason,
      });
      setRejectModal({ isOpen: false, influencer: null, reason: '' });
      fetchInfluencers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending Approval
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.pending}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Active Partners
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.approved}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Rejected / Closed
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.rejected}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === ''
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Creators ({metrics.total})
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({metrics.pending})
          </button>
          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({metrics.approved})
          </button>
          <button
            onClick={() => setSelectedStatus('rejected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({metrics.rejected})
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, mobile, code..."
              className="w-64 pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>
          <button
            onClick={fetchInfluencers}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Influencer Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading influencer partners...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No influencer applications found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              New signups from the customer portal will automatically appear here for review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Creator / Contact</th>
                  <th className="py-3.5 px-4">Platform & Profile</th>
                  <th className="py-3.5 px-4">10% Promo Code</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {influencers.map((inf) => {
                  const isPending = inf.status === 'pending';
                  const isApproved = inf.status === 'approved';
                  const isRejected = inf.status === 'rejected';
                  const isLoading = actionLoadingId === inf.uid;

                  return (
                    <tr key={inf.uid} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold flex items-center justify-center shrink-0 uppercase">
                            {(inf.name || inf.user?.name || 'I')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{inf.name || inf.user?.name || 'Unknown'}</p>
                            <p className="text-[11px] text-slate-500">{inf.mobile_number || inf.user?.mobile || inf.user?.mobile_number}</p>
                            {(inf.email || inf.user?.email) && (
                              <p className="text-[11px] text-slate-400">{inf.email || inf.user?.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Platform & Profile Link */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">{inf.platform}</span>
                        {inf.platform_link ? (
                          <div className="mt-0.5">
                            <a
                              href={inf.platform_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 underline max-w-[150px] truncate"
                            >
                              Open Profile <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No link</span>
                        )}
                      </td>

                      {/* Promo Code */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200/60 text-pink-700 font-mono font-bold tracking-wide">
                          <Tag className="w-3 h-3" />
                          {inf.referral_code}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">10% Follower Discount</p>
                      </td>

                      {/* Commission % */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{inf.commission_percentage}%</span>
                        <p className="text-[10px] text-slate-400">Share per sale</p>
                      </td>

                      {/* Performance */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-600">
                            <strong>{inf.metrics?.total_followers || 0}</strong> followers
                          </p>
                          <p className="text-[11px] text-slate-600">
                            <strong>{inf.metrics?.total_orders || 0}</strong> orders
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-600">
                            ₹{Number(inf.metrics?.total_commission_earned || 0).toLocaleString('en-IN')} earned
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                disabled={isLoading}
                                onClick={() => handleApprove(inf)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => handleOpenReject(inf)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleOpenReject(inf)}
                              className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              Revoke Access
                            </button>
                          )}

                          {isRejected && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleApprove(inf)}
                              className="px-2.5 py-1 text-[11px] text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-semibold"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Reject Influencer Application
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to reject the application for{' '}
              <strong>{rejectModal.influencer?.user?.name}</strong>? They will not be able to log
              into the influencer dashboard.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
                placeholder="e.g. Incomplete profile details, low follower relevance..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() =>
                  setRejectModal({ isOpen: false, influencer: null, reason: '' })
                }
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
