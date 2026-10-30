import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Package, 
  ShoppingBag,
  LogOut, 
  Layers,
  Bell
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'influencers', label: 'Influencers', icon: Sparkles },
    { id: 'recommendations', label: 'Recommendations', icon: Layers },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1e1b2e] text-slate-300 flex flex-col flex-shrink-0 z-40 select-none border-r border-slate-800/80 shadow-lg">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9d71c7] to-[#6f4798] p-1.5 flex items-center justify-center shadow-md shadow-[#9d71c7]/20 border border-white/10">
          <img src="/logo.png" alt="Classie" className="w-full h-full object-contain filter brightness-100" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none">Classie Admin</h1>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">Care Management</span>
        </div>
      </div>

      {/* Nav Items - independently scrollable */}
      <nav className="p-3 flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#9d71c7] to-[#7f51b0] text-white shadow-md shadow-[#9d71c7]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#9d71c7]/30 flex items-center justify-center text-[#9d71c7] font-bold text-xs uppercase flex-shrink-0">
              {user?.email?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name || user?.email?.split('@')[0] || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {user?.email || 'admin@classie.com'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
