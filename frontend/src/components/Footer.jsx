import { useEffect, useState } from 'react';
import { getStoreInfo } from '../api/client';

export default function Footer() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    getStoreInfo().then(setStore).catch(() => {});
  }, []);

  if (!store) return <footer className="footer"><p>Happy Provision Store</p></footer>;

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/logo.svg" alt="Happy Provision Store" className="footer-logo" />
          <h4>{store.name}</h4>
          <p>📍 {store.address}</p>
        </div>
        <div>
          <h4>Contact Us</h4>
          {store.phones.map((p) => (
            <p key={p}>
              <a href={`tel:+91${p}`}>📞 {p}</a>
            </p>
          ))}
          <p>
            <a href={`mailto:${store.email}`}>✉️ {store.email}</a>
          </p>
        </div>
        <div>
          <h4>Delivery Policy</h4>
          <p>🏪 Regular orders — pick up at store</p>
          <p>📦 Bulk orders — home delivery within {store.freeDeliveryMaxKm} km</p>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Happy Provision Store. All rights reserved.</p>
    </footer>
  );
}
