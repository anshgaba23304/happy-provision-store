const API = '/api';

const PUSH_REGISTERED_KEY = 'happyStorePushRegistered';

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isPushRegistered() {
  return localStorage.getItem(PUSH_REGISTERED_KEY) === '1';
}

export function clearPushRegistered() {
  localStorage.removeItem(PUSH_REGISTERED_KEY);
}

export async function getPushStatus() {
  try {
    const res = await fetch(`${API}/push/status`);
    if (!res.ok) return { enabled: false, serverConfigured: false };
    return res.json();
  } catch {
    return { enabled: false, serverConfigured: false };
  }
}

export async function getVapidPublicKey() {
  const res = await fetch(`${API}/push/vapid-public-key`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.publicKey || null;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(role, { phone, adminPin } = {}) {
  if (!isPushSupported()) {
    throw new Error('NOT_SUPPORTED');
  }

  const status = await getPushStatus();
  if (!status.serverConfigured) {
    throw new Error('SERVER_NOT_CONFIGURED');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('PERMISSION_DENIED');
  }

  const publicKey = await getVapidPublicKey();
  if (!publicKey) {
    throw new Error('SERVER_NOT_CONFIGURED');
  }

  const registration = await navigator.serviceWorker.ready;

  // Fresh subscription avoids stale keys after deploy / VAPID change
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await existing.unsubscribe();
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  const res = await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      role,
      phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : undefined,
      adminPin,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'SUBSCRIBE_FAILED');
  }

  localStorage.setItem(PUSH_REGISTERED_KEY, '1');
  localStorage.setItem('happyStorePushRole', role);
  return true;
}

export async function enableNotifications(role, options = {}) {
  return subscribeToPush(role, options);
}

/** Call after admin login or customer track — registers push if permitted. */
export async function ensurePushRegistered(role, options = {}) {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    return await subscribeToPush(role, options);
  } catch {
    return false;
  }
}
