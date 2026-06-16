import { useState, useEffect, useCallback } from 'react';
import { getAdminOrders, markDelivered } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { requestNotificationPermission, showNotification } from '../utils/notifications';
import Analytics from './Analytics';

function CompleteOrderModal({ order, onClose, onConfirm, error }) {
  const [billAmount, setBillAmount] = useState('');

  if (!order) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(billAmount);
    if (!amount || amount <= 0) return;
    onConfirm(order.id, amount);
  }

  const isDelivery = order.orderType === 'delivery';

  return (
    <div className="complete-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="complete-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="complete-order-title"
      >
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 id="complete-order-title">💰 Bill amount</h2>
        <p className="complete-modal-sub">
          Order #{order.id} · {order.customerName}
        </p>
        <form onSubmit={handleSubmit} className="complete-modal-form">
          <label htmlFor="bill-amount-input">Enter total bill amount (₹)</label>
          <input
            id="bill-amount-input"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            placeholder="e.g. 450"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            autoFocus
            autoComplete="off"
            required
          />
          {error && <div className="error-msg">{error}</div>}
          <div className="complete-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={!billAmount || Number(billAmount) <= 0}
            >
              {isDelivery ? '✅ Mark as Delivered' : '✅ Mark as Ready for Pickup'}
            </button>
          </div>
        </form>
        <p className="bill-hint">This amount is saved for daily sales &amp; analytics.</p>
      </div>
    </div>
  );
}

function ImageLightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="image-lightbox" onClick={onClose} role="dialog" aria-label="Grocery photo">
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <img src={src} alt="Grocery item" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default function AdminPanel() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [completeError, setCompleteError] = useState('');

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

  async function handleDeliver(orderId, billAmount) {
    const savedPin = sessionStorage.getItem('adminPin') || pin;
    setCompleteError('');
    try {
      const updated = await markDelivered(orderId, savedPin, billAmount);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setCompletingOrder(null);
      setError('');
      showNotification(
        'Order Updated',
        `Order #${orderId} completed — ₹${billAmount.toLocaleString('en-IN')} added to sales.`,
      );
    } catch (err) {
      setCompleteError(err.message);
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
              <p className="admin-hint">Tap <strong>Complete Order</strong> on each order and enter the bill amount.</p>
              {pending.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onComplete={() => { setCompleteError(''); setCompletingOrder(order); }}
                  onImageClick={setLightboxImage}
                />
              ))}
            </section>
          )}

          {delivered.length > 0 && (
            <section className="admin-section">
              <h2>✅ Completed Orders ({delivered.length})</h2>
              {delivered.map((order) => (
                <OrderCard key={order.id} order={order} onImageClick={setLightboxImage} />
              ))}
            </section>
          )}

          {orders.length === 0 && <p className="no-orders">No orders yet. Waiting for customers...</p>}
        </>
      )}

      {error && <div className="error-msg">{error}</div>}

      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      <CompleteOrderModal
        order={completingOrder}
        onClose={() => { setCompletingOrder(null); setCompleteError(''); }}
        onConfirm={handleDeliver}
        error={completeError}
      />
    </div>
  );
}

function OrderCard({ order, onComplete, onImageClick }) {
  const isPending = order.status !== 'delivered';

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
          <strong>{order.orderType === 'delivery' ? '📦' : '🏪'}</strong>
          {order.orderType === 'delivery' ? ' Bulk order — Home Delivery' : ' Pick up at Store'}
        </p>
        <p><strong>👤</strong> {order.customerName}</p>
        <p><strong>📞</strong> <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
        {order.address && order.orderType === 'delivery' && <p><strong>📍</strong> {order.address}</p>}
        {order.orderType === 'delivery' && <p className="free-tag">📦 Bulk delivery</p>}
        <p><strong>📅</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
      </div>
      <div className="order-images">
        {order.images.map((img, i) => (
          <button
            key={i}
            type="button"
            className="order-image-btn"
            onClick={() => onImageClick?.(img)}
            aria-label={`View grocery photo ${i + 1}`}
          >
            <img src={img} alt={`Grocery ${i + 1}`} />
          </button>
        ))}
      </div>
      {isPending && onComplete && (
        <button type="button" className="btn btn-success btn-block complete-order-btn" onClick={onComplete}>
          💰 Complete Order — Enter Bill Amount
        </button>
      )}
      {order.status === 'delivered' && order.estimatedAmount > 0 && (
        <p className="bill-amount-display">
          <strong>💰 Bill:</strong> ₹{order.estimatedAmount.toLocaleString('en-IN')}
        </p>
      )}
      {order.deliveredAt && (
        <p className="delivered-time">Completed: {new Date(order.deliveredAt).toLocaleString('en-IN')}</p>
      )}
    </div>
  );
}
