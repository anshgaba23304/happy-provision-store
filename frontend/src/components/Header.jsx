import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/order', label: 'Order', icon: '🛒' },
  { to: '/track', label: 'Track', icon: '📦' },
  { to: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="" className="logo-mark" aria-hidden="true" />
          <div className="logo-text">
            <strong>Happy Provision</strong>
            <small>Store · Deoband</small>
          </div>
        </Link>
        <nav className="nav">
          {NAV.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={pathname === to ? 'active' : ''}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
