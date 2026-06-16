import { useState, useEffect, useCallback } from 'react';
import { getAdminOrders, markDelivered } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { requestNotificationPermission, showNotification } from '../utils/notifications';
import { enableNotifications, ensurePushRegistered } from '../utils/pushNotifications';
import { downloadGroceryImage, downloadAllOrderImages } from '../utils/downloadImage';
import Analytics from './Analytics';
import NotificationBanner from './NotificationBanner';

const ADMIN_UI_VERSION = '4';

function ImageLightbox({ src, orderId, imageIndex, onClose }) {
  const [saving, setSaving] = useState(false);

  if (!src) return null;

  async function handleSave() {
    setSaving(true);
    try {
      const name = orderId
        ? `order-${orderId}-grocery-${(imageIndex ?? 0) + 1}`
        : 'grocery-photo';
      await downloadGroceryImage(src, name);
    } catch {
      window.open(src, '_blank');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="image-lightbox" onClick={onClose} role="dialog" aria-label="Grocery photo">
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <img src={src} alt="Grocery item" onClick={(e) => e.stopPropagation()} />
      <div className="lightbox-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '⬇️ Save to Gallery'}
        </button>
      </div>
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
  const [lightboxMeta, setLightboxMeta] = useState({ orderId: null, imageIndex: 0 });

  function openImage(orderId, imageIndex, src) {
    setLightboxMeta({ orderId, imageIndex });
    setLightboxImage(src);
  }

  const fetchOrders = useCallback(async (loginPin) => {
    const pinToUse = (loginPin ?? pin).trim();
    if (!pinToUse) return;
    setLoading(true);
    try {
      const data = await getAdminOrders(pinToUse);
      setOrders(data);
      setAuthenticated(true);
      sessionStorage.setItem('adminPin', pinToUse);
      enableNotifications('admin', { adminPin: pinToUse }).catch(() => {});
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
        ensurePushRegistered('admin', { adminPin: saved }).catch(() => {});
      }).catch(() => sessionStorage.removeItem('adminPin'));
    }
  }, []);

  const onNewOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    setNewOrderAlert(order);
    showNotification(
      '🔔 New Order!',
      `Order #${order.id} from ${order.customerName} - ${order.customerPhone}`,
      () => window.focus(),
      `admin-new-${order.id}`,
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
    try {
      const updated = await markDelivered(orderId, savedPin, billAmount);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setError('');
      showNotification(
        'Order Updated',
        `Order #${orderId} completed — ₹${billAmount.toLocaleString('en-IN')} added to sales.`,
      );
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

  const pending = orders.filter((o) => o.status !== 'delivered');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const savedPin = sessionStorage.getItem('adminPin') || pin;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📋 Store Dashboard</h1>
        <div className="admin-header-actions">
          <span className="admin-version">v{ADMIN_UI_VERSION}</span>
          <button className="btn btn-outline btn-sm" onClick={() => { sessionStorage.removeItem('adminPin'); setAuthenticated(false); }}>
            Logout
          </button>
        </div>
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
          <NotificationBanner role="admin" adminPin={savedPin} />
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
              <p className="admin-hint">
                Enter the <strong>bill amount (₹)</strong> in the green box on each order, then tap complete.
              </p>
              {pending.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDeliver={handleDeliver}
                  onImageClick={openImage}
                />
              ))}
            </section>
          )}

          {delivered.length > 0 && (
            <section className="admin-section">
              <h2>✅ Completed Orders ({delivered.length})</h2>
              {delivered.map((order) => (
                <OrderCard key={order.id} order={order} onImageClick={openImage} />
              ))}
            </section>
          )}

          {orders.length === 0 && <p className="no-orders">No orders yet. Waiting for customers...</p>}
        </>
      )}

      {error && <div className="error-msg">{error}</div>}

      <ImageLightbox
        src={lightboxImage}
        orderId={lightboxMeta.orderId}
        imageIndex={lightboxMeta.imageIndex}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}

function OrderCard({ order, onDeliver, onImageClick }) {
  const [billAmount, setBillAmount] = useState('');
  const [downloadingAll, setDownloadingAll] = useState(false);
  const isPending = order.status !== 'delivered';

  function handleComplete(e) {
    e.preventDefault();
    const amount = Number(billAmount);
    if (!amount || amount <= 0) return;
    onDeliver?.(order.id, amount);
  }

  async function handleDownloadAll(e) {
    e.preventDefault();
    if (!order.images?.length) return;
    setDownloadingAll(true);
    try {
      await downloadAllOrderImages(order.id, order.images);
    } catch {
      /* user cancelled share */
    } finally {
      setDownloadingAll(false);
    }
  }

  async function handleDownloadOne(e, img, index) {
    e.stopPropagation();
    try {
      await downloadGroceryImage(img, `order-${order.id}-grocery-${index + 1}`);
    } catch {
      window.open(img, '_blank');
    }
  }

  return (
    <div className={`admin-order-card status-${order.status}`}>
      <div className="order-header">
        <span className="order-id">#{order.id}</span>
        <span className={`status-badge ${order.status}`}>
          {order.status === 'delivered' ? '✅ Done' : '🥬 Packing'}
        </span>
      </div>

      {isPending && onDeliver && (
        <form className="bill-entry-box" onSubmit={handleComplete}>
          <p className="bill-entry-title">💰 Bill amount (required)</p>
          <div className="bill-entry-row">
            <span className="bill-currency">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              placeholder="Enter amount e.g. 450"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              autoComplete="off"
              aria-label="Bill amount in rupees"
              required
            />
            <button
              type="submit"
              className="btn btn-success"
              disabled={!billAmount || Number(billAmount) <= 0}
            >
              {order.orderType === 'delivery' ? 'Deliver' : 'Complete'}
            </button>
          </div>
        </form>
      )}

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
          <div key={i} className="order-image-wrap">
            <button
              type="button"
              className="order-image-btn"
              onClick={() => onImageClick?.(order.id, i, img)}
              aria-label={`View grocery photo ${i + 1}`}
            >
              <img src={img} alt={`Grocery ${i + 1}`} />
            </button>
            <button
              type="button"
              className="order-image-download"
              onClick={(e) => handleDownloadOne(e, img, i)}
              aria-label={`Save grocery photo ${i + 1}`}
              title="Save to gallery"
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>
      {order.images.length > 0 && (
        <button
          type="button"
          className="btn btn-outline btn-sm download-all-btn"
          onClick={handleDownloadAll}
          disabled={downloadingAll}
        >
          {downloadingAll ? 'Saving…' : `⬇️ Save all photos (${order.images.length})`}
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
