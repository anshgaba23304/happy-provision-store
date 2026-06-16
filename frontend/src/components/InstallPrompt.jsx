import { useState, useEffect } from 'react';

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInstalled() && !localStorage.getItem('iosInstallDismissed')) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem('iosInstallDismissed', '1');
    setVisible(false);
  }

  return (
    <div className="install-prompt" role="dialog" aria-label="Install app">
      <button type="button" className="install-dismiss" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
      <div className="install-prompt-body">
        <img src="/apple-touch-icon.png" alt="" className="install-icon" />
        <div>
          <strong>Install Happy Store on iPhone</strong>
          <p>
            Tap <span className="install-step">Share</span> in Safari, then{' '}
            <span className="install-step">Add to Home Screen</span>
          </p>
        </div>
      </div>
    </div>
  );
}
