export function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function buildWhatsAppMessage(order, store) {
  const isPickup = !order.orderType || order.orderType === 'pickup';
  const lines = [
    `🛒 *New Order from Happy Provision Store*`,
    ``,
    `📋 Order ID: *${order.id}*`,
    `👤 Name: ${order.customerName}`,
    `📞 Phone: ${order.customerPhone}`,
    isPickup ? `🏪 *PICK UP AT STORE*` : `🚚 *HOME DELIVERY*`,
    !isPickup && order.address ? `📍 Address: ${order.address}` : '',
    isPickup && store?.address ? `📍 Store: ${store.address}` : '',
    order.estimatedAmount ? `💰 Est. Amount: ₹${order.estimatedAmount}` : '',
    !isPickup && order.freeDelivery ? `✅ *FREE HOME DELIVERY* (₹500+ within 2 km)` : '',
    isPickup ? `💡 Customer will visit store & may add more items` : '',
    ``,
    `📸 Grocery images uploaded in app`,
    order.images?.[0] ? `View images: ${window.location.origin}${order.images[0]}` : '',
    ``,
    `_Sent via Happy Provision Store App_`,
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone, message) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  const text = encodeURIComponent(message);
  if (isIOS()) {
    return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${text}`;
  }
  return `https://wa.me/91${cleanPhone}?text=${text}`;
}

export function openWhatsApp(phone, message) {
  const url = buildWhatsAppUrl(phone, message);
  if (isMobile()) {
    window.location.assign(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function openWhatsAppToStore(phones, message) {
  const phone = phones?.[0];
  if (phone) openWhatsApp(phone, message);
}
