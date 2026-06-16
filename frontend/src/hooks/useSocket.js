import { useEffect, useRef } from 'react';
import { playNotificationSound } from '../utils/notifications';

export function useSocket(onNewOrder, onOrderDelivered) {
  const sourceRef = useRef(null);

  useEffect(() => {
    const source = new EventSource('/api/events');
    sourceRef.current = source;

    source.addEventListener('new-order', (e) => {
      const payload = JSON.parse(e.data);
      const order = payload.order || payload;
      playNotificationSound();
      onNewOrder?.(order);
    });

    source.addEventListener('order-delivered', (e) => {
      const payload = JSON.parse(e.data);
      const order = payload.order || payload;
      playNotificationSound();
      onOrderDelivered?.(order);
    });

    return () => source.close();
  }, [onNewOrder, onOrderDelivered]);

  return sourceRef;
}
