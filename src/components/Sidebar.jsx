import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Package, 
  ShoppingBag,
  LogOut, 
  Layers
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
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin Profile & Logout - Always pinned at bottom */}
      <div className="p-4 border-t border-white/10 bg-[#161324] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#3b3356] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ring-2 ring-white/10">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate max-w-[120px]">
              {user?.name || user?.email || 'Admin'}
            </span>
            <span className="text-[10px] text-[#b388dc] font-medium tracking-wide uppercase">Administrator</span>
          </div>
        </div>
        <button 
          onClick={logout} 
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
