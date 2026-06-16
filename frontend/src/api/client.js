const API = '/api';

export async function getStoreInfo() {
  const res = await fetch(`${API}/store`);
  if (!res.ok) throw new Error('Failed to load store info');
  return res.json();
}

export async function createOrder(formData) {
  const res = await fetch(`${API}/orders`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data;
}

export async function getOrdersByPhone(phone) {
  const res = await fetch(`${API}/orders?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function getAdminOrders(pin) {
  const res = await fetch(`${API}/orders?adminPin=${encodeURIComponent(pin)}`);
  if (!res.ok) throw new Error('Invalid PIN');
  return res.json();
}

export async function getAnalytics(pin) {
  const res = await fetch(`${API}/analytics?adminPin=${encodeURIComponent(pin)}`);
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function markDelivered(orderId, pin, billAmount) {
  const res = await fetch(`${API}/orders/${orderId}/deliver`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPin: pin, billAmount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update');
  return data;
}

export async function getOrder(id) {
  const res = await fetch(`${API}/orders/${id}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}
