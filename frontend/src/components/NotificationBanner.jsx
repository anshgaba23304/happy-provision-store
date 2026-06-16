import { useState, useEffect } from 'react';
import {
  isPushSupported,
  enableNotifications,
  isPushRegistered,
  getPushStatus,
} from '../utils/pushNotifications';
import { showNotification } from '../utils/notifications';

const MESSAGES = {
  NOT_SUPPORTED: 'Your browser does not support phone notifications. Use the installed app on iPhone.',
  SERVER_NOT_CONFIGURED: 'Push alerts need VAPID keys on the server (Render env vars). In-app alerts still work while the app is open.',
  PERMISSION_DENIED: 'Please allow notifications when your phone asks.',
  SUBSCRIBE_FAILED: 'Could not register for alerts. Try again.',
};

export default function NotificationBanner({ role = 'customer', phone, adminPin }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [serverOk, setServerOk] = useState(true);

  useEffect(() => {
    async function check() {
      if (!isPushSupported()) {
        setMessage(MESSAGES.NOT_SUPPORTED);
        setVisible(true);
        return;
      }

      const status = await getPushStatus();
      setServerOk(status.serverConfigured);

      if (Notification.permission === 'denied') {
        setMessage('Notifications blocked — enable in Settings → Notifications → Happy Store.');
        setVisible(true);
        return;
      }

      if (!status.serverConfigured) {
        setMessage(MESSAGES.SERVER_NOT_CONFIGURED);
        setVisible(true);
        return;
      }

      if (Notification.permission === 'granted' && isPushRegistered()) {
        setVisible(false);
        return;
      }

      setVisible(true);
    }
    check();
  }, [role, phone, adminPin]);

  if (!visible) return null;

  async function handleEnable() {
    setLoading(true);
    setMessage('');
    try {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setMessage(MESSAGES.PERMISSION_DENIED);
          return;
        }
      }
      await enableNotifications(role, { phone, adminPin });
      showNotification(
        '🔔 Notifications on',
        role === 'admin'
          ? 'You will get pop-ups when new orders arrive (even in background).'
          : 'You will get a pop-up when your order is ready.',
        undefined,
        'push-enabled',
      );
      setVisible(false);
    } catch (err) {
      const code = err?.message || 'SUBSCRIBE_FAILED';
      setMessage(MESSAGES[code] || MESSAGES.SUBSCRIBE_FAILED);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner-text">
        <strong>🔔 Turn on phone pop-up alerts</strong>
        <span>
          {role === 'admin'
            ? 'Get notified when a customer places an order — works in background on installed app.'
            : 'Get notified when your grocery order is ready or delivered.'}
        </span>
        {message && <small>{message}</small>}
      </div>
      {Notification.permission !== 'denied' && serverOk && (
        <button type="button" className="btn btn-primary btn-sm" onClick={handleEnable} disabled={loading}>
          {loading ? 'Enabling…' : 'Enable'}
        </button>
      )}
    </div>
  );
}
