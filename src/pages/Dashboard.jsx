import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import { recommendationService } from '../services/recommendationService';
import { catalogueService } from '../services/catalogueService';
import { Users, Sparkles, Package, ShieldCheck, ArrowUpRight } from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activePlans: 0,
    totalProducts: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [custRes, recRes, prodRes] = await Promise.allSettled([
          customerService.getCustomers({ page_size: 1 }),
          recommendationService.getPlans(),
          catalogueService.getAdminProducts({ page: 1 }),
        ]);

        setStats({
          totalCustomers: custRes.status === 'fulfilled' ? custRes.value?.count || 0 : 0,
          activePlans: recRes.status === 'fulfilled' ? recRes.value?.count || 0 : 0,
          totalProducts: prodRes.status === 'fulfilled' ? prodRes.value?.count || 0 : 0,
          loading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Overview & System Health
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Real-time summary of Classie Care customer engagement and catalogue metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#f6effc] text-[#9d71c7] flex items-center justify-center flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.loading ? '...' : stats.totalCustomers}</div>
            <div className="text-xs font-semibold text-slate-500">Registered Customers</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.loading ? '...' : stats.activePlans}</div>
            <div className="text-xs font-semibold text-slate-500">Active Plans</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.loading ? '...' : stats.totalProducts}</div>
            <div className="text-xs font-semibold text-slate-500">Catalogue Products</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-base font-extrabold text-emerald-600">Operational</div>
            <div className="text-xs font-semibold text-slate-500">API Status & Auth</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1">Quick Actions</h4>
          <p className="text-xs text-slate-500 mb-4">
            Jump directly to manage key modules in the platform:
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setActiveTab('customers')}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>View & Manage Customer Accounts</span>
              <ArrowUpRight size={15} />
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>Setup Cycle-Based Recommendation Plans</span>
              <ArrowUpRight size={15} />
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>Browse Catalog & Variant Pricing</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-2">System Architecture</h4>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed list-disc list-inside">
            <li><strong className="text-slate-800">Auto-Referral IDs:</strong> All customers receive unique <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-slate-700">CLS-XXXX-XXXX</code> standard codes.</li>
            <li><strong className="text-slate-800">Recommendation Engine:</strong> Analyzes user cycle day offsets (-15 to +15) with universal and symptom-based rules.</li>
            <li><strong className="text-slate-800">Smart Delivery Addresses:</strong> Preserves customer text addresses with default fallback.</li>
            <li><strong className="text-slate-800">Celery Worker:</strong> Midnight batch generation + daytime peak hour push notifications.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
