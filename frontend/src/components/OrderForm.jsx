import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createOrder, getStoreInfo } from '../api/client';
import { buildWhatsAppMessage, openWhatsAppToAllStores } from '../utils/whatsapp';
import { requestNotificationPermission, showNotification } from '../utils/notifications';

export default function OrderForm() {
  const [store, setStore] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [orderType, setOrderType] = useState('pickup');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const isPickup = orderType === 'pickup';
  const isDelivery = orderType === 'delivery';
  const amountNum = parseFloat(amount) || 0;
  const mayGetFreeDelivery = isDelivery && amountNum >= 500;

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
    setImages((prev) => [...prev, ...files].slice(0, 10));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result].slice(0, 10));
      reader.readAsDataURL(file);
    });
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
      formData.append('estimatedAmount', amount || '0');
      images.forEach((img) => formData.append('images', img));

      const order = await createOrder(formData);
      setSuccess(order);

      const message = buildWhatsAppMessage(order, store);
      if (store?.phones) {
        openWhatsAppToAllStores(store.phones, message);
      }

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
    setAmount('');
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
          {pickup ? (
            <>
              <div className="delivery-badge pickup-badge">🏪 Pick up from store</div>
              <p>
                Visit <strong>Happy Provision Store</strong> to collect your order.
                You can <strong>add more items</strong> when you come!
              </p>
              {store && <p className="store-pickup-addr">📍 {store.address}</p>}
            </>
          ) : (
            <>
              <p>We&apos;ve opened WhatsApp to notify our team. Your order will be delivered to your address.</p>
              {success.freeDelivery && (
                <div className="delivery-badge">🚚 FREE Home Delivery (₹500+ within 2 km)</div>
              )}
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
          <p className="page-sub">Upload photos of groceries — pick up at store or get delivery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <h3 className="form-section-title">🛍️ How do you want your order?</h3>
          <div className="order-type-toggle">
            <button
              type="button"
              className={`toggle-option ${isPickup ? 'active' : ''}`}
              onClick={() => switchOrderType('pickup')}
            >
              <span className="toggle-icon">🏪</span>
              <span className="toggle-label">Pick up at Store</span>
              <span className="toggle-desc">Visit us &amp; add more items</span>
            </button>
            <button
              type="button"
              className={`toggle-option ${isDelivery ? 'active' : ''}`}
              onClick={() => switchOrderType('delivery')}
            >
              <span className="toggle-icon">🚚</span>
              <span className="toggle-label">Home Delivery</span>
              <span className="toggle-desc">We deliver to your door</span>
            </button>
          </div>

          {isPickup && store && (
            <div className="pickup-info-card">
              <img src="/logo.svg" alt="" className="pickup-info-logo" />
              <div>
                <strong>Collect from our store</strong>
                <p>{store.address}</p>
                <p className="pickup-hint">💡 Pre-order now — add more groceries when you visit!</p>
              </div>
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
              <small>Write your full address with landmark so we can find you easily</small>
            </div>
          )}
        </div>

        {isDelivery && (
          <div className="form-section">
            <h3 className="form-section-title">🚚 Home Delivery</h3>
            <div className="form-group">
              <label>Estimated Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Approx. total e.g. 600" min="0" />
              <small>🎁 Free delivery on orders above ₹500 within 2 km (confirmed by store)</small>
            </div>
            {mayGetFreeDelivery && (
              <div className="delivery-status eligible">
                🎉 Your order may qualify for FREE home delivery!
              </div>
            )}
            {isDelivery && amountNum > 0 && amountNum < 500 && (
              <div className="delivery-status not-eligible">
                Add ₹{500 - amountNum} more for free delivery (min ₹500, within 2 km)
              </div>
            )}
          </div>
        )}

        <div className="form-section">
          <h3 className="form-section-title">🛒 Grocery Photos *</h3>
          <div className="image-upload-area">
            <input type="file" accept="image/*" multiple capture="environment" onChange={handleImageChange} id="img-input" className="hidden-input" />
            <label htmlFor="img-input" className="upload-zone">
              <span className="upload-icon">📷</span>
              <strong>Tap to Take Photo or Upload</strong>
              <span className="upload-hint">Up to 10 images of items you need</span>
            </label>
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
          {loading ? '⏳ Sending...' : '📤 Send Order via WhatsApp'}
        </button>
      </form>
    </div>
  );
}
