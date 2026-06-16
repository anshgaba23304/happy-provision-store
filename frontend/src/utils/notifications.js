let audio = null;

export function playNotificationSound() {
  try {
    if (!audio) {
      audio = new Audio('/notification.mp3');
      audio.volume = 1;
    }
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Fallback beep using Web Audio API
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => osc.stop(), 300);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.3;
        osc2.start();
        setTimeout(() => osc2.stop(), 300);
      }, 350);
    });
  } catch {
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showNotification(title, body, onClick) {
  if (Notification.permission === 'granted') {
    const n = new Notification(title, {
      body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      vibrate: [200, 100, 200],
      tag: 'happy-store',
    });
    if (onClick) n.onclick = onClick;
    playNotificationSound();
  }
}
