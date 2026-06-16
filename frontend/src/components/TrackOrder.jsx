import { useState, useEffect, useCallback } from 'react';
import { getOrdersByPhone } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { showNotification, requestNotificationPermission } from '../utils/notifications';

const TRACK_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'pending', label: 'Packing Groceries', icon: '🥬' },
  { key: 'delivered', label: 'Ready / Delivered', icon: '✅' },
];

function OrderTimeline({ status }) {
  const currentStep = status === 'delivered' ? 2 : status === 'pending' ? 1 : 0;

  return (
    <div className="order-timeline">
      {TRACK_STEPS.map((step, i) => (
        <div key={step.key} className={`timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
          <div className="timeline-dot">{step.icon}</div>
          <span className="timeline-label">{step.label}</span>
          {i < TRACK_STEPS.length - 1 && <div className={`timeline-line ${i < currentStep ? 'filled' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

export default function TrackOrder() {
  const [phone, setPhone] = useState(localStorage.getItem('customerPhone') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = useCallback(async (ph) => {
    if (!ph || ph.length < 10) return;
    setLoading(true);
    try {
      const data = await getOrdersByPhone(ph);
      setOrders(data);
      setSearched(true);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    if (phone.length === 10) fetchOrders(phone);
  }, []);

  const onOrderDelivered = useCallback((order) => {
    if (order.customerPhone?.includes(phone.slice(-10)) || order.customerPhone === phone) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      showNotification(
        '🎉 Order Delivered!',
        `Your order #${order.id} has been delivered. Thank you for shopping with us!`
      );
    }
  }, [phone]);

  useSocket(null, onOrderDelivered);

  function handleSearch(e) {
    e.preventDefault();
    localStorage.setItem('customerPhone', phone);
    fetchOrders(phone);
  }

  return (
    <div className="track-page">
      <div className="page-header">
        <span className="page-icon">📦</span>
        <div>
          <h1>Track Your Order</h1>
          <p className="page-sub">See real-time status of your grocery orders</p>
        </div>
      </div>

      <div className="how-track-works">
        <h3>How Tracking Works</h3>
        <ol>
          <li><strong>Enter your phone number</strong> — the same one you used when placing the order</li>
          <li><strong>See all your orders</strong> — with status: Packing Groceries or Delivered</li>
          <li><strong>Get notified automatically</strong> — when we mark your order as delivered, you&apos;ll hear a sound & get a notification (allow notifications when asked)</li>
        </ol>
      </div>

      <form onSubmit={handleSearch} className="track-form">
        <div className="track-input-wrap">
          <span className="input-icon">📞</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your 10-digit phone number"
            pattern="[0-9]{10}"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Searching...' : '🔍 Track Orders'}
        </button>
      </form>

      {searched && orders.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No orders found for this number.</p>
          <small>Make sure you entered the same phone number used when ordering.</small>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className={`order-card status-${order.status}`}>
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className={`status-badge ${order.status}`}>
                {order.status === 'delivered'
                  ? (order.orderType === 'delivery' ? '✅ Delivered' : '✅ Ready for Pickup')
                  : '🥬 Packing Groceries'}
              </span>
            </div>

            <OrderTimeline status={order.status} />

            <div className="order-meta">
              <p>{order.orderType === 'delivery' ? '🚚 Home Delivery' : '🏪 Pick up at Store'}</p>
              <p>📅 Placed: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
              {order.estimatedAmount > 0 && <p>💰 ₹{order.estimatedAmount}</p>}
              {order.freeDelivery && <p className="free-tag">🚚 Free Delivery</p>}
              {order.deliveredAt && (
                <p className="delivered-time">
                  ✅ {order.orderType === 'delivery' ? 'Delivered' : 'Ready for pickup'}: {new Date(order.deliveredAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <div className="order-images">
              {order.images.map((img, i) => (
                <img key={i} src={img} alt={`Item ${i + 1}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
