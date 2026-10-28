import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  XCircle, 
  Eye, 
  X,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { orderService } from '../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    placed: 0,
    processing: 0,
    in_transit: 0,
    delivered: 0,
  });

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail drawer / modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allowedTransitions, setAllowedTransitions] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Shipping & Tracking Modal state
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [courierPartnerInput, setCourierPartnerInput] = useState('Delhivery');
  const [shippingNotesInput, setShippingNotesInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({
        order_status: statusFilter,
        payment_status: paymentFilter,
        search: searchQuery,
      });

      let orderData = [];
      if (Array.isArray(res?.data)) {
        orderData = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        orderData = res.data.data;
      } else if (Array.isArray(res?.results)) {
        orderData = res.results;
      } else if (Array.isArray(res)) {
        orderData = res;
      }

      setOrders(orderData);
      const metricsObj = res?.metrics || res?.data?.metrics;
      if (metricsObj) {
        setMetrics(metricsObj);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const [loadingDetail, setLoadingDetail] = useState(false);

  const openOrderDetail = async (orderOrIdentifier) => {
    try {
      setStatusMessage({ text: '', type: '' });
      // If full order object passed, set immediately for instantaneous UI feedback
      let identifier = orderOrIdentifier;
      if (typeof orderOrIdentifier === 'object' && orderOrIdentifier !== null) {
        setSelectedOrder(orderOrIdentifier);
        identifier = orderOrIdentifier.order_number || orderOrIdentifier.uid;
      } else {
        const found = orders.find(o => (o.order_number === orderOrIdentifier || o.uid === orderOrIdentifier));
        if (found) setSelectedOrder(found);
      }

      setLoadingDetail(true);
      const res = await orderService.getOrderDetail(identifier);
      const detail = res?.data || res;
      if (detail && typeof detail === 'object') {
        setSelectedOrder(detail);
        setAllowedTransitions(res?.allowed_next_statuses || detail.allowed_next_statuses || []);
      }
    } catch (err) {
      console.error('Failed to get order details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusTransition = async (nextStatus) => {
    if (!selectedOrder) return;

    // If advancing to SHIPPED, open tracking ID modal instead of immediate update
    if (nextStatus === 'shipped') {
      setTrackingIdInput(selectedOrder.tracking_id || '');
      setCourierPartnerInput(selectedOrder.courier_partner || 'Delhivery');
      setShippingNotesInput('');
      setShippingModalOpen(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMessage({ text: '', type: '' });

      const res = await orderService.updateOrderStatus(selectedOrder.order_number || selectedOrder.uid, {
        order_status: nextStatus,
      });

      const updated = res?.data || res;
      setSelectedOrder(updated);
      setAllowedTransitions(res?.allowed_next_statuses || []);
      setStatusMessage({ text: `Order status moved to "${nextStatus.toUpperCase()}"`, type: 'success' });

      // Refresh background list
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.errors || 'Failed to update order status.';
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmShipment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage({ text: '', type: '' });

      const payload = {
        order_status: 'shipped',
        tracking_id: trackingIdInput.trim(),
        courier_partner: courierPartnerInput.trim(),
      };
      if (shippingNotesInput.trim()) {
        payload.notes = shippingNotesInput.trim();
      }

      const res = await orderService.updateOrderStatus(selectedOrder.order_number || selectedOrder.uid, payload);
      const updated = res?.data || res;
      setSelectedOrder(updated);
      setAllowedTransitions(res?.allowed_next_statuses || []);
      setStatusMessage({ text: `Order marked as SHIPPED with Tracking ID: ${trackingIdInput.trim()}`, type: 'success' });
      setShippingModalOpen(false);

      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.errors || 'Failed to update shipment tracking.';
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3 h-3" /> Placed</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-teal-600" /> Confirmed (Paid)</span>;
      case 'processing':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><Truck className="w-3 h-3" /> Out for Delivery</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Cancelled</span>;
      case 'returned':
        return <span className="px-2.5 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-full text-xs font-semibold flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Returned</span>;
      default:
        return <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.total_orders}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-amber-600">New Placed</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.placed}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{metrics.processing}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-purple-600">In Transit</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{metrics.in_transit}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-emerald-600">Delivered</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{metrics.delivered}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Phone, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#9d71c7] focus:bg-white"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-[#9d71c7]"
          >
            <option value="">All Order Statuses</option>
            <option value="placed">Placed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-[#9d71c7]"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No customer orders found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord.uid} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{ord.item_count || ord.items?.length || 1}</span> items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{ord.pricing?.grand_total || ord.grand_total}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold uppercase text-[11px] text-slate-700">
                        {ord.payment_method}
                      </div>
                      <div className={`text-[10px] font-bold capitalize ${
                        ord.payment_status === 'success' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {ord.payment_status}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.order_status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="px-3 py-1.5 bg-[#9d71c7]/10 hover:bg-[#9d71c7]/20 text-[#6f4798] rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Management Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div>
                <span className="text-[11px] font-mono text-slate-400">Order Management</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {statusMessage.text && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Status Transition Control (Constraints Guarded) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Current State:</span>
                  <div>{getStatusBadge(selectedOrder.order_status)}</div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wide">
                    Allowed Next Status Transitions:
                  </span>
                  {allowedTransitions.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">
                      This order is in terminal state ({selectedOrder.order_status}). No further transitions allowed.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allowedTransitions.map((nextSt) => (
                        <button
                          key={nextSt}
                          disabled={updatingStatus}
                          onClick={() => handleStatusTransition(nextSt)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all shadow-xs ${
                            nextSt === 'cancelled'
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                              : nextSt === 'delivered'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-[#9d71c7] hover:bg-[#855cb0] text-white'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Advance to {nextSt.replace(/_/g, ' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping / Tracking Details if available */}
              {(selectedOrder.tracking_id || selectedOrder.courier_partner || selectedOrder.order_status === 'shipped' || selectedOrder.order_status === 'out_for_delivery' || selectedOrder.order_status === 'delivered') && (
                <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-sky-600" />
                      Shipment & Tracking Information
                    </h4>
                    <button
                      onClick={() => {
                        setTrackingIdInput(selectedOrder.tracking_id || '');
                        setCourierPartnerInput(selectedOrder.courier_partner || 'Delhivery');
                        setShippingNotesInput('');
                        setShippingModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline"
                    >
                      {selectedOrder.tracking_id ? 'Update Tracking' : 'Add Tracking'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Courier Partner</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.courier_partner || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tracking / AWB Number</span>
                      <span className="font-mono font-bold text-sky-800">{selectedOrder.tracking_id || 'Pending generation'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Contact & Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#9d71c7]" />
                    Customer Details
                  </h4>
                  <p className="text-slate-800 font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedOrder.customer_phone}
                  </p>
                  {selectedOrder.customer_email && (
                    <p className="text-slate-500 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {selectedOrder.customer_email}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9d71c7]" />
                    Delivery Address
                  </h4>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {selectedOrder.shipping_address?.address_line}
                    {selectedOrder.shipping_address?.locality ? `, ${selectedOrder.shipping_address.locality}` : ''}
                  </p>
                  <p className="text-slate-600 font-semibold">
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.uid} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{item.product_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                          {item.attributes && Array.isArray(item.attributes) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.attributes.map((attr, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                  {attr.name}: {attr.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">₹{item.total_price}</p>
                        <p className="text-[11px] text-slate-400">{item.quantity} x ₹{item.unit_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.pricing?.subtotal || selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span>₹{selectedOrder.pricing?.delivery_fee || selectedOrder.delivery_fee}</span>
                </div>
                {Number(selectedOrder.pricing?.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.pricing.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-[#6f4798]">₹{selectedOrder.pricing?.grand_total || selectedOrder.grand_total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Shipment & Tracking Modal */}
      {shippingModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Ship Order & Add Tracking</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedOrder?.order_number}</p>
                </div>
              </div>
              <button
                onClick={() => setShippingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShipment} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Courier / Logistics Partner
                </label>
                <select
                  value={courierPartnerInput}
                  onChange={(e) => setCourierPartnerInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7] bg-white font-medium"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                  <option value="Shiprocket">Shiprocket</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Xpressbees">Xpressbees</option>
                  <option value="Other">Other / Local Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tracking ID / AWB Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEL123456789IN"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This tracking code will be shared directly with the customer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal / Dispatch Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Any parcel notes or package details..."
                  value={shippingNotesInput}
                  onChange={(e) => setShippingNotesInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9d71c7]"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus || !trackingIdInput.trim()}
                  className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
