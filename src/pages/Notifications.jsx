import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import { Bell, Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Eye } from 'lucide-react';

const PRESET_MESSAGES = [
  {
    name: "🌸 Weekend Care Sale (15% OFF)",
    title: "weekend comfort drop is live! 🌸",
    body: "hey bestie! treat yourself to 15% off on all soothing pads & bloom kits this weekend. your comfort era starts now ✨",
    screen: "shop_pads"
  },
  {
    name: "🩸 Period Hydration & Rest Nudge",
    title: "bestie check: have you hydrated today? 💧",
    body: "take three sips of water right now. you're doing amazing today, even if you just rested. be gentle with yourself 🫂",
    screen: "daily_checkin"
  },
  {
    name: "👜 Emergency Pad Reminder",
    title: "put an emergency pad in your bag right now 👜",
    body: "literally stop what you're doing and slip a classie pad into your college or office tote. future you will thank present you! ✨",
    screen: "shop_pads"
  },
  {
    name: "✨ New Comfort Feature Alert",
    title: "new in classie: your pookie care streak ✨",
    body: "check out the new self-care tracker! log your morning mood and build your comfort streak today 💖",
    screen: "daily_checkin"
  }
];

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [screen, setScreen] = useState('daily_checkin');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState(null);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setBody(preset.body);
    setScreen(preset.screen);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ text: 'Please provide both title and body text.', type: 'error' });
      return;
    }

    try {
      setSending(true);
      setStatusMessage({ text: '', type: '' });

      const payload = {
        title: title.trim(),
        body: body.trim(),
        target,
        screen,
        image_url: imageUrl.trim() || undefined
      };

      const res = await apiClient.post('/api/admin/notifications/broadcast/', payload);
      const data = res.data?.data || res.data;

      setStats(data);
      setStatusMessage({
        text: `Push notification sent successfully to ${data.sent_count || 0} device(s)!`,
        type: 'success'
      });
    } catch (err) {
      const errMsg = err.response?.data?.errors || err.response?.data?.message || 'Failed to send broadcast notification.';
      setStatusMessage({ text: errMsg, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#9d71c7]/15 via-purple-50 to-pink-50 border border-[#9d71c7]/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#6f4798] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Customer Push Messaging</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Broadcast Push Notifications</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Send real-time instant notifications directly to all customer phones using Firebase Cloud Messaging (FCM).
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Preset Quick Starters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
          Quick Gen-Z "Pookie Bestie" Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESET_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 text-left bg-slate-50 hover:bg-[#9d71c7]/10 hover:border-[#9d71c7]/40 border border-slate-200 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-slate-800 group-hover:text-[#6f4798] mb-1">{preset.name}</div>
              <div className="text-[11px] text-slate-500 line-clamp-2">{preset.body}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast Form & Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Notification Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. weekend comfort drop is live! 🌸"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                required
                placeholder="e.g. hey bestie! treat yourself to 15% off on all soothing pads & bloom kits this weekend ✨"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Audience Target</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7] bg-white font-medium"
                >
                  <option value="all">All Customer Devices (Full Broadcast)</option>
                  <option value="active_cycles">Active Cycle Trackers Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">In-App Target Screen</label>
                <select
                  value={screen}
                  onChange={(e) => setScreen(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7] bg-white font-medium"
                >
                  <option value="daily_checkin">Daily Self-Care Check-In</option>
                  <option value="shop_pads">Shop Pads & Products</option>
                  <option value="cycle_calendar">Period Calendar</option>
                  <option value="product_panty_liners">Panty Liners Page</option>
                  <option value="product_fabric_wash">Fabric Wash Page</option>
                  <option value="order_tracking">Order Tracking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Image URL (Optional Rich Push Banner)
              </label>
              <input
                type="url"
                placeholder="https://classie.care/banner.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !title.trim() || !body.trim()}
                className="w-full py-3 bg-[#9d71c7] hover:bg-[#855cb0] text-white rounded-xl font-bold text-xs shadow-md shadow-[#9d71c7]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? 'Broadcasting via Firebase...' : 'Send Broadcast Notification Now'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Phone Lock-screen Preview Column */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Customer Lock Screen Preview</span>
            </div>

            {/* Mock Android / iOS Notification Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#9d71c7] flex items-center justify-center text-[9px] font-bold">C</div>
                  <span className="font-bold text-white">Classie Care</span>
                </div>
                <span>Just now</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {title || 'your uterus chose violence today 🩸'}
                </h4>
                <p className="text-[11px] text-white/80 leading-relaxed mt-1">
                  {body || 'hey pookie, the red era is officially here. cancel plans if you can, grab a hot water bag, and put on your comfiest tee. your classie pads got you 🫂'}
                </p>
              </div>

              {imageUrl && (
                <div className="pt-1">
                  <img src={imageUrl} alt="Banner" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                </div>
              )}
            </div>
          </div>

          {stats && (
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400 font-medium space-y-1">
              <div>✓ Delivered to: <span className="font-bold text-white">{stats.sent_count} device(s)</span></div>
              <div className="text-white/60">Target segment: {stats.target}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
