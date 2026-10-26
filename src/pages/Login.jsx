import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(typeof res.error === 'string' ? res.error : 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1430] via-[#2f2244] to-[#412f5e] p-6 select-none">
      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9d71c7] to-[#6b4c9a] p-2.5 inline-flex items-center justify-center mb-4 shadow-xl shadow-[#9d71c7]/40 ring-4 ring-[#9d71c7]/20">
            <img src="/logo.png" alt="Classie Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Classie Admin Portal
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Enter your credentials to access system control
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold mb-6">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-[#9d71c7]/20 transition-all"
                placeholder="admin@classie.care"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-[#9d71c7]/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#9d71c7] to-[#7f51b0] hover:from-[#8a5bb8] hover:to-[#6f4798] shadow-md shadow-[#9d71c7]/30 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
