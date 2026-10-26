import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Logged in as:</span>
          <strong className="text-slate-800 font-semibold">{user?.email}</strong>
        </div>
      </div>
    </header>
  );
};

export default Header;
