const DEFAULT_CONTACTS = [
  { phone: '9557237665', name: 'Ansh' },
  { phone: '9897297006', name: 'Happy Bhai' },
  { phone: '8979670760', name: 'Anil Bhai' },
];

const DEFAULT_ADDRESS = 'Lajpat Nagar Railway Road Deoband U.P 247554';

export function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91-${digits}`;
}

export function phoneTel(phone) {
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  return `tel:+91${digits}`;
}

export function storeContacts(store) {
  if (store?.contacts?.length >= 2) return store.contacts;
  return DEFAULT_CONTACTS;
}

export function storeMapUrl(store) {
  if (store?.mapUrl) return store.mapUrl;
  if (store?.lat && store?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
  }
  const address = store?.address || DEFAULT_ADDRESS;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
