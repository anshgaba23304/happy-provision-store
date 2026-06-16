import { useState, useEffect } from 'react';
import { isPushSupported, enableNotifications } from '../utils/pushNotifications';
import { requestNotificationPermission, showNotification } from '../utils/notifications';

export default function NotificationBanner({ role = 'customer', phone, adminPin }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isPushSupported()) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') {
      setMessage('Notifications blocked — enable them in phone Settings → Safari → Notifications.');
      setVisible(true);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  async function handleEnable() {
    setLoading(true);
    setMessage('');
    try {
      const pushOk = await enableNotifications(role, { phone, adminPin });
      if (pushOk) {
        showNotification(
          '🔔 Notifications on',
          role === 'admin'
            ? 'You will get pop-ups when new orders arrive.'
            : 'You will get a pop-up when your order is ready.',
        );
        setVisible(false);
        return;
      }
      const permOk = await requestNotificationPermission();
      if (permOk) {
        setVisible(false);
      } else {
        setMessage('Please allow notifications when your phone asks.');
      }
    } catch {
      setMessage('Could not enable notifications. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner-text">
        <strong>🔔 Turn on pop-up alerts</strong>
        <span>
          {role === 'admin'
            ? 'Get notified on your phone when a customer places an order.'
            : 'Get notified when your grocery order is ready or delivered.'}
        </span>
        {message && <small>{message}</small>}
      </div>
      {Notification.permission !== 'denied' && (
        <button type="button" className="btn btn-primary btn-sm" onClick={handleEnable} disabled={loading}>
          {loading ? 'Enabling…' : 'Enable'}
        </button>
      )}
    </div>
  );
}
