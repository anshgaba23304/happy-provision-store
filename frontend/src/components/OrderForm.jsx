import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createOrder, getStoreInfo } from '../api/client';
import { requestNotificationPermission, showNotification } from '../utils/notifications';
import { storeMapUrl } from '../utils/store';

export default function OrderForm() {
  const [store, setStore] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [orderType, setOrderType] = useState('pickup');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const isPickup = orderType === 'pickup';
  const isDelivery = orderType === 'delivery';

  useEffect(() => {
    getStoreInfo().then(setStore).catch(() => {});
    requestNotificationPermission();
  }, []);

  function switchOrderType(type) {
    setOrderType(type);
    setError('');
    if (type === 'pickup') setAddress('');
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files].slice(0, 10));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result].slice(0, 10));
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isDelivery && !address.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('customerName', name);
      formData.append('customerPhone', phone);
      formData.append('orderType', orderType);
      formData.append('address', isDelivery ? address : '');
      formData.append('estimatedAmount', '0');
      images.forEach((img) => formData.append('images', img));

      const order = await createOrder(formData);
      setSuccess(order);

      showNotification(
        'Order Placed! 🎉',
        `Your order #${order.id} has been sent to Happy Provision Store.`
      );

      localStorage.setItem('customerPhone', phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSuccess(null);
    setName('');
    setPhone('');
    setAddress('');
    setImages([]);
    setPreviews([]);
    setOrderType('pickup');
  }

  if (success) {
    const pickup = !success.orderType || success.orderType === 'pickup';

    return (
      <div className="order-success">
        <div className="success-card animate-in">
          <div className="success-circle">✅</div>
          <h2>Order Placed!</h2>
          <p className="order-id-display">Order ID: <strong>#{success.id}</strong></p>
          <p>Your order is saved and our team has been notified in real time.</p>
          {pickup ? (
            <>
              <div className="delivery-badge pickup-badge">🏪 Pick up from store</div>
              <p>
                Visit <strong>Happy Provision Store</strong> to collect your order.
                You can <strong>add more items</strong> when you come!
              </p>
              {store && (
                <>
                  <p className="store-pickup-addr">📍 {store.address}</p>
                  {storeMapUrl(store) && (
                    <a href={storeMapUrl(store)} target="_blank" rel="noreferrer" className="map-link-btn">
                      🗺️ Open in Google Maps
                    </a>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="delivery-badge">📦 Bulk order — home delivery</div>
              <p>We&apos;ll pack your bulk grocery order and deliver within 2 km of our store.</p>
            </>
          )}
          <div className="success-actions">
            <Link to="/track" className="btn btn-primary">📦 Track This Order</Link>
            <button className="btn btn-secondary" onClick={resetForm}>Order Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-form-page">
      <div className="page-header">
        <span className="page-icon">📸</span>
        <div>
          <h1>Place Your Order</h1>
          <p className="page-sub">Upload grocery photos — pick up at store or request bulk delivery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <h3 className="form-section-title">🛍️ How do you want your order?</h3>
          <p className="order-type-hint">
            Regular orders → pick up at store. Home delivery is only for <strong>bulk grocery orders</strong>.
          </p>
          <div className="order-type-toggle">
            <button
              type="button"
              className={`toggle-option ${isPickup ? 'active' : ''}`}
              onClick={() => switchOrderType('pickup')}
            >
              <span className="toggle-icon">🏪</span>
              <span className="toggle-label">Pick up at Store</span>
              <span className="toggle-desc">For regular &amp; small orders</span>
            </button>
            <button
              type="button"
              className={`toggle-option ${isDelivery ? 'active' : ''}`}
              onClick={() => switchOrderType('delivery')}
            >
              <span className="toggle-icon">📦</span>
              <span className="toggle-label">Bulk Order — Delivery</span>
              <span className="toggle-desc">Large grocery list · within 2 km</span>
            </button>
          </div>

          {isPickup && store && (
            <div className="pickup-info-card">
              <img src="/logo.svg" alt="" className="pickup-info-logo" />
              <div>
                <strong>Collect from our store</strong>
                <p>{store.address}</p>
                {storeMapUrl(store) && (
                  <a href={storeMapUrl(store)} target="_blank" rel="noreferrer" className="map-link-btn">
                    🗺️ Open in Google Maps
                  </a>
                )}
                <p className="pickup-hint">💡 Best for everyday shopping — visit us and add more items!</p>
              </div>
            </div>
          )}

          {isDelivery && (
            <div className="bulk-delivery-card">
              <strong>📦 Bulk order delivery</strong>
              <p>
                Choose this only if you have a <strong>large grocery order</strong> (many items / heavy shopping).
                For a few items, please select <strong>pick up at store</strong> instead.
              </p>
              <p className="bulk-delivery-note">🚚 Delivery available within 2 km of our store (Deoband)</p>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3 className="form-section-title">👤 Your Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" pattern="[0-9]{10}" required />
            </div>
          </div>

          {isDelivery && (
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, landmark near Deoband..."
                rows={3}
                required
              />
              <small>Required for bulk order home delivery</small>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3 className="form-section-title">🛒 Grocery Photos *</h3>
          <div className="image-upload-area">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              id="camera-input"
              className="hidden-input"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              id="gallery-input"
              className="hidden-input"
            />
            <div className="upload-actions">
              <label htmlFor="camera-input" className="upload-zone upload-option">
                <span className="upload-icon">📷</span>
                <strong>Take Photo</strong>
                <span className="upload-hint">Use camera</span>
              </label>
              <label htmlFor="gallery-input" className="upload-zone upload-option">
                <span className="upload-icon">🖼️</span>
                <strong>Choose from Gallery</strong>
                <span className="upload-hint">Pick saved photos</span>
              </label>
            </div>
            <p className="upload-note">Add up to 10 grocery photos</p>
          </div>
          {previews.length > 0 && (
            <div className="image-previews">
              {previews.map((src, i) => (
                <div key={i} className="preview-item">
                  <img src={src} alt={`Grocery ${i + 1}`} />
                  <button type="button" className="remove-img" onClick={() => removeImage(i)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <button type="submit" className="btn btn-primary btn-lg btn-send" disabled={loading}>
          {loading ? '⏳ Placing Order...' : '📤 Place Order'}
        </button>
      </form>
    </div>
  );
}
