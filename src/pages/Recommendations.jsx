import React, { useEffect, useState } from 'react';
import { recommendationService } from '../services/recommendationService';
import { catalogueService } from '../services/catalogueService';
import { Plus, Trash2, Edit3, Sparkles, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const Recommendations = () => {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    event: 'period',
    days_offset: -5,
    description: '',
    notification_title: 'Time to prep for your cycle!',
    notification_body: "We've curated your cycle essentials. Tap to view.",
    preferred_send_hour: 11,
    is_active: true,
    items: [],
  });

  const [editingUid, setEditingUid] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [pRes, prodRes] = await Promise.all([
        recommendationService.getPlans(),
        catalogueService.getAdminProducts(),
      ]);
      setPlans(pRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingUid(null);
    setForm({
      name: '',
      event: 'period',
      days_offset: -5,
      description: '',
      notification_title: 'Time to prep for your cycle!',
      notification_body: "We've curated your cycle essentials. Tap to view.",
      preferred_send_hour: 11,
      is_active: true,
      items: products.length > 0 ? [{ product_uid: products[0].uid, rule_type: 'universal', symptom: '', custom_description: '' }] : [],
    });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingUid(plan.uid);
    setForm({
      name: plan.name,
      event: plan.event,
      days_offset: plan.days_offset,
      description: plan.description || '',
      notification_title: plan.notification_title || '',
      notification_body: plan.notification_body || '',
      preferred_send_hour: plan.preferred_send_hour || 11,
      is_active: plan.is_active,
      items: plan.items.map((it) => ({
        product_uid: it.product.uid,
        rule_type: it.rule_type,
        symptom: it.symptom || '',
        custom_description: it.custom_description || '',
      })),
    });
    setModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_uid: products[0].uid, rule_type: 'universal', symptom: '', custom_description: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Plan name is required');
      return;
    }

    try {
      if (editingUid) {
        await recommendationService.updatePlan(editingUid, form);
        showToast('Recommendation plan updated successfully');
      } else {
        await recommendationService.createPlan(form);
        showToast('Recommendation plan created successfully');
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.errors || 'Failed to save plan', true);
    }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm('Are you sure you want to delete this recommendation plan?')) return;
    try {
      await recommendationService.deletePlan(uid);
      showToast('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      showToast('Failed to delete plan', true);
    }
  };

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const symptomOptions = [
    { value: 'cramps', label: 'Cramps' },
    { value: 'period_cramps', label: 'Period Cramps' },
    { value: 'bloating', label: 'Bloating' },
    { value: 'mood_swings', label: 'Mood Swings' },
    { value: 'headache', label: 'Headache' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'acne', label: 'Acne' },
    { value: 'body_pain', label: 'Body Pain' },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Recommendation Plans
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Automate personalized product recommendations and peak-hour push notifications based on cycle stages
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#9d71c7] hover:bg-[#8a5bb8] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus size={18} />
          <span>New Recommendation Plan</span>
        </button>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-400 font-medium">
            Loading recommendation plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 font-medium">
            No recommendation plans setup yet. Click "New Recommendation Plan" to start.
          </div>
        ) : (
          plans.map((p) => (
            <div
              key={p.uid}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{p.name}</h4>
                    <span className="text-xs text-slate-500">
                      Event: <strong className="text-[#9d71c7]">{p.event_display}</strong>
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Calendar size={13} />
                    {p.days_offset === 0 ? 'On Event Day' : `${p.days_offset > 0 ? '+' : ''}${p.days_offset} days`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    <Clock size={13} />
                    Push at {p.preferred_send_hour}:00
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                  {p.description || 'No description added.'}
                </p>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Connected Products ({p.items?.length || 0})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {p.items?.map((it) => (
                      <div
                        key={it.uid}
                        className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg"
                      >
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                          {it.product.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                          {it.rule_type === 'universal' ? 'Universal' : `Symptom: ${it.symptom}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  onClick={() => openEditModal(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p.uid)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  {editingUid ? 'Edit Recommendation Plan' : 'Create Recommendation Plan'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Define target timing event and product rules
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Plan Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    PLAN NAME
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-[#9d71c7]/20 transition-all"
                    placeholder="e.g. Pre-Period Comfort & Cramp Kit"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Target Event & Timing Offset */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      TARGET EVENT
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-[#9d71c7]/20 transition-all"
                      value={form.event}
                      onChange={(e) => setForm({ ...form, event: e.target.value })}
                    >
                      <option value="period">Period Start</option>
                      <option value="follicular">Follicular Phase</option>
                      <option value="ovulation">Ovulation Date</option>
                      <option value="luteal">Luteal / PMS Phase</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                        TIMING OFFSET{' '}
                        <span className="text-[#9d71c7] font-bold">
                          {Number(form.days_offset) < 0
                            ? `(${Math.abs(Number(form.days_offset))} DAYS BEFORE)`
                            : Number(form.days_offset) > 0
                            ? `(${Number(form.days_offset)} DAYS AFTER)`
                            : '(ON EVENT DAY)'}
                        </span>
                      </label>
                    </div>

                    <div className="mt-2">
                      <input
                        type="range"
                        min="-15"
                        max="15"
                        step="1"
                        value={form.days_offset}
                        onChange={(e) => setForm({ ...form, days_offset: parseInt(e.target.value, 10) })}
                        className="w-full accent-[#9d71c7] cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {Number(form.days_offset) < 0
                        ? `Triggers ${Math.abs(Number(form.days_offset))} days BEFORE the predicted event`
                        : Number(form.days_offset) > 0
                        ? `Triggers ${Number(form.days_offset)} days AFTER the predicted event`
                        : `Triggers on the exact day of the predicted event`}
                    </p>
                  </div>
                </div>

                {/* Connected Products */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Connected Products</h4>
                      <p className="text-xs text-slate-500">
                        Select parent products and specify trigger condition rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#9d71c7] bg-[#f6effc] hover:bg-[#ede0f7] transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {form.items.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No products connected yet. Click "+ Add Product" to add recommendations.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                PRODUCT
                              </label>
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                                value={it.product_uid}
                                onChange={(e) => handleItemChange(idx, 'product_uid', e.target.value)}
                              >
                                {products.map((prod) => (
                                  <option key={prod.uid} value={prod.uid}>
                                    {prod.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="w-full sm:w-44">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                RULE TYPE
                              </label>
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                                value={it.rule_type}
                                onChange={(e) => handleItemChange(idx, 'rule_type', e.target.value)}
                              >
                                <option value="universal">Universal (Always)</option>
                                <option value="symptom_based">Symptom-Based</option>
                              </select>
                            </div>

                            {it.rule_type === 'symptom_based' && (
                              <div className="w-full sm:w-44">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  IF SYMPTOM EQUALS
                                </label>
                                <select
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                                  value={it.symptom}
                                  onChange={(e) => handleItemChange(idx, 'symptom', e.target.value)}
                                >
                                  <option value="">-- Choose Symptom --</option>
                                  {symptomOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end cursor-pointer"
                              title="Remove Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <input
                            type="text"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#9d71c7]"
                            placeholder="Why we recommend this (e.g. Stock up early on your favorite soothing pad)"
                            value={it.custom_description}
                            onChange={(e) => handleItemChange(idx, 'custom_description', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Push Notification & Timing Settings */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#9d71c7]" />
                      <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Push Notification & Peak Send Time
                      </h5>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Hour:</span>
                      <select
                        value={form.preferred_send_hour}
                        onChange={(e) => setForm({ ...form, preferred_send_hour: parseInt(e.target.value, 10) })}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h}>
                            {h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                        value={form.notification_title}
                        onChange={(e) => setForm({ ...form, notification_title: e.target.value })}
                        placeholder="e.g. Time to prep for your cycle!"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Notification Body Message
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                        value={form.notification_body}
                        onChange={(e) => setForm({ ...form, notification_body: e.target.value })}
                        placeholder="e.g. We've curated your cycle essentials. Tap to view."
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Description (Internal) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1">
                    Plan Description (Internal)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="Internal notes about this recommendation trigger..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Footer - Fixed at bottom, always fully visible */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#9d71c7] to-[#7f51b0] hover:from-[#8a5bb8] hover:to-[#6f4798] shadow-md shadow-[#9d71c7]/30 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Save Plan Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
