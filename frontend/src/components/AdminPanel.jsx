import { useState, useEffect, useCallback } from 'react';
import { getAdminOrders, markDelivered } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { requestNotificationPermission, showNotification } from '../utils/notifications';
import Analytics from './Analytics';

export default function AdminPanel() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  const fetchOrders = useCallback(async (loginPin) => {
    const pinToUse = (loginPin ?? pin).trim();
    if (!pinToUse) return;
    setLoading(true);
    try {
      const data = await getAdminOrders(pinToUse);
      setOrders(data);
      setAuthenticated(true);
      sessionStorage.setItem('adminPin', pinToUse);
    } catch {
      sessionStorage.removeItem('adminPin');
      setError('Invalid PIN');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    requestNotificationPermission();
    const saved = sessionStorage.getItem('adminPin');
    if (saved) {
      setPin(saved);
      getAdminOrders(saved).then((data) => {
        setOrders(data);
        setAuthenticated(true);
      }).catch(() => sessionStorage.removeItem('adminPin'));
    }
  }, []);

  const onNewOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    setNewOrderAlert(order);
    showNotification(
      '🔔 New Order!',
      `Order #${order.id} from ${order.customerName} - ${order.customerPhone}`,
      () => window.focus()
    );
    setTimeout(() => setNewOrderAlert(null), 5000);
  }, []);

  const onOrderDelivered = useCallback((order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  }, []);

  useSocket(onNewOrder, onOrderDelivered);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    await fetchOrders(pin.trim());
  }

  async function handleDeliver(orderId) {
    const savedPin = sessionStorage.getItem('adminPin') || pin;
    try {
      const updated = await markDelivered(orderId, savedPin);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showNotification('Order Updated', `Order #${orderId} marked as complete. Customer notified in app.`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <h1>🔐 Admin Panel</h1>
        <p className="page-sub">Enter PIN to manage orders</p>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value.trim())}
            placeholder="Admin PIN"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === 'pending');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const savedPin = sessionStorage.getItem('adminPin') || pin;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📋 Store Dashboard</h1>
        <button className="btn btn-outline btn-sm" onClick={() => { sessionStorage.removeItem('adminPin'); setAuthenticated(false); }}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button type="button" className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📦 Orders
        </button>
        <button type="button" className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
          📊 Analytics
        </button>
      </div>

      {newOrderAlert && activeTab === 'orders' && (
        <div className="new-order-alert">
          🔔 NEW ORDER: #{newOrderAlert.id} from {newOrderAlert.customerName}!
        </div>
      )}

      {activeTab === 'analytics' ? (
        <Analytics pin={savedPin} />
      ) : (
        <>
          <div className="admin-stats">
            <div className="stat-card pending-stat">
              <span className="stat-num">{pending.length}</span>
              <span>Packing</span>
            </div>
            <div className="stat-card delivered-stat">
              <span className="stat-num">{delivered.length}</span>
              <span>Completed</span>
            </div>
          </div>

          {pending.length > 0 && (
            <section className="admin-section">
              <h2>🥬 Packing Orders ({pending.length})</h2>
              {pending.map((order) => (
                <OrderCard key={order.id} order={order} onDeliver={handleDeliver} />
              ))}
            </section>
          )}

          {delivered.length > 0 && (
            <section className="admin-section">
              <h2>✅ Completed Orders ({delivered.length})</h2>
              {delivered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </section>
          )}

          {orders.length === 0 && <p className="no-orders">No orders yet. Waiting for customers...</p>}
        </>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function OrderCard({ order, onDeliver }) {
  return (
    <div className={`admin-order-card status-${order.status}`}>
      <div className="order-header">
        <span className="order-id">#{order.id}</span>
        <span className={`status-badge ${order.status}`}>
          {order.status === 'delivered' ? '✅ Done' : '🥬 Packing'}
        </span>
      </div>
      <div className="order-details">
        <p>
          <strong>{order.orderType === 'delivery' ? '🚚' : '🏪'}</strong>
          {order.orderType === 'delivery' ? ' Home Delivery' : ' Pick up at Store'}
        </p>
        <p><strong>👤</strong> {order.customerName}</p>
        <p><strong>📞</strong> <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
        {order.address && order.orderType === 'delivery' && <p><strong>📍</strong> {order.address}</p>}
        {order.estimatedAmount > 0 && <p><strong>💰</strong> ₹{order.estimatedAmount}</p>}
        {order.freeDelivery && <p className="free-tag">🚚 FREE Delivery (₹500+)</p>}
        <p><strong>📅</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
      </div>
      <div className="order-images">
        {order.images.map((img, i) => (
          <a key={i} href={img} target="_blank" rel="noreferrer">
            <img src={img} alt={`Grocery ${i + 1}`} />
          </a>
        ))}
      </div>
      {order.status === 'pending' && onDeliver && (
        <button className="btn btn-success" onClick={() => onDeliver(order.id)}>
          {order.orderType === 'delivery' ? '✅ Mark as Delivered' : '✅ Mark as Ready for Pickup'}
        </button>
      )}
      {order.deliveredAt && (
        <p className="delivered-time">Completed: {new Date(order.deliveredAt).toLocaleString('en-IN')}</p>
      )}
    </div>
  );
}
