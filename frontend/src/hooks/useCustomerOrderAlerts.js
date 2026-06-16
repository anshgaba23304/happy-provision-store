import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from './useSocket';
import { showNotification } from '../utils/notifications';

/** Show pop-ups app-wide when the customer's order is marked ready. */
export function useCustomerOrderAlerts() {
  const location = useLocation();

  const onOrderDelivered = useCallback((order) => {
    const savedPhone = (localStorage.getItem('customerPhone') || '').replace(/\D/g, '').slice(-10);
    const orderPhone = (order.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (!savedPhone || savedPhone !== orderPhone) return;

    const isDelivery = order.orderType === 'delivery';
    showNotification(
      isDelivery ? '🎉 Order Delivered!' : '✅ Ready for Pickup!',
      isDelivery
        ? `Your order #${order.id} has been delivered. Thank you!`
        : `Order #${order.id} is ready — pick up at the store.`,
      () => { window.location.href = '/track'; },
    );
  }, []);

  useSocket(null, onOrderDelivered);

  useEffect(() => {
    // Keep SSE alive while browsing (not only on /track)
  }, [location.pathname]);
}
