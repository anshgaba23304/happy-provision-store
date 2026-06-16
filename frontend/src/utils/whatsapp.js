export function buildWhatsAppMessage(order, store) {
  const isPickup = !order.orderType || order.orderType === 'pickup';
  const lines = [
    `🛒 *New Order from Happy Provision Store*`,
    ``,
    `📋 Order ID: *${order.id}*`,
    `👤 Name: ${order.customerName}`,
    `📞 Phone: ${order.customerPhone}`,
    isPickup
      ? `🏪 *PICK UP AT STORE*`
      : `🚚 *HOME DELIVERY*`,
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

export function openWhatsApp(phone, message) {
  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function openWhatsAppToAllStores(phones, message) {
  phones.forEach((phone, i) => {
    setTimeout(() => openWhatsApp(phone, message), i * 500);
  });
}
