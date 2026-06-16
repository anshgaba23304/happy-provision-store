import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStoreInfo } from '../api/client';

const STEPS = [
  { num: '1', icon: '📸', title: 'Snap Photos', desc: 'Take pictures of items you need', color: 'step-teal' },
  { num: '2', icon: '📤', title: 'Send Order', desc: 'We get it on WhatsApp instantly', color: 'step-mango' },
  { num: '3', icon: '🚚', title: 'We Deliver', desc: 'Fresh groceries at your door', color: 'step-violet' },
];

const FEATURES = [
  { icon: '📷', title: 'Photo Orders', desc: 'Snap your list — no typing needed!', tint: 'tint-teal' },
  { icon: '🚚', title: 'Free Delivery', desc: 'Orders above ₹500 within 2 km!', tint: 'tint-mango' },
  { icon: '💬', title: 'WhatsApp Ready', desc: 'Orders go straight to our chat', tint: 'tint-violet' },
  { icon: '🔔', title: 'Live Updates', desc: 'Know when your order arrives', tint: 'tint-rose' },
];

export default function Home() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    getStoreInfo().then(setStore).catch(() => {});
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-floaters">
          <span>🥬</span><span>🍎</span><span>🥛</span><span>🍞</span>
        </div>
        <div className="hero-content">
          <img src="/logo.svg" alt="Happy Provision Store" className="hero-logo" />
          <span className="hero-tag">✨ Deoband&apos;s Favourite Grocery Store</span>
          <h1>
            Fresh Groceries,
            <br />
            <span className="hero-highlight">Delivered with a Smile!</span>
          </h1>
          <p className="hero-sub">
            Skip the long lists — snap photos of what you need and we&apos;ll pack
            &amp; deliver to your doorstep. Easy, quick, and always fresh.
          </p>
          <div className="hero-actions">
            <Link to="/order" className="btn btn-primary btn-lg">
              <span>📸</span> Order Now
            </Link>
            <Link to="/track" className="btn btn-glass btn-lg">
              <span>📦</span> Track Order
            </Link>
          </div>
          <div className="hero-chips">
            <span className="chip">🚚 Free delivery ₹500+</span>
            <span className="chip">📍 Within 2 km</span>
            <span className="chip">💬 WhatsApp support</span>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Get your groceries in 3 easy steps</p>
        <div className="steps-row">
          {STEPS.map((step) => (
            <div key={step.num} className={`step-card ${step.color}`}>
              <div className="step-num">{step.num}</div>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className={`feature-card ${f.tint}`}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {store && (
        <section className="visit-store">
          <div className="visit-store-bg" aria-hidden="true">
            <span className="visit-deco visit-deco-1">📍</span>
            <span className="visit-deco visit-deco-2">🛒</span>
            <span className="visit-deco visit-deco-3">✨</span>
          </div>

          <div className="visit-store-card">
            <div className="visit-store-left">
              <div className="visit-store-badge">
                <img src="/logo.svg" alt="" className="visit-logo" />
                <span>Visit Us</span>
              </div>
              <h2 className="visit-title">{store.name}</h2>
              <p className="visit-tagline">Your neighbourhood grocery store in Deoband</p>

              <div className="visit-info-list">
                <div className="visit-info-item">
                  <span className="visit-info-icon">📍</span>
                  <div>
                    <strong>Store Address</strong>
                    <p>{store.address}</p>
                  </div>
                </div>
                <div className="visit-info-item">
                  <span className="visit-info-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p>
                      <a href={`mailto:${store.email}`}>{store.email}</a>
                    </p>
                  </div>
                </div>
                <div className="visit-info-item">
                  <span className="visit-info-icon">🕐</span>
                  <div>
                    <strong>Open Daily</strong>
                    <p>8:00 AM – 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="visit-store-right">
              <div className="visit-cta-box">
                <p className="visit-cta-label">Need groceries? Reach us instantly</p>
                <a
                  href={`https://wa.me/91${store.phones[0]}`}
                  className="btn btn-whatsapp btn-lg visit-wa-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="wa-icon">💬</span>
                  <span>
                    <small>Chat on WhatsApp</small>
                    <strong>{store.phones[0]}</strong>
                  </span>
                </a>
                <a href={`tel:+91${store.phones[0]}`} className="btn btn-call btn-lg">
                  📞 Call Now
                </a>
                <Link to="/order" className="visit-order-link">
                  Or place order online →
                </Link>
              </div>

              <div className="visit-map-hint">
                <span>🗺️</span>
                <p>Near Lajpat Nagar Railway Road, Deoband</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
