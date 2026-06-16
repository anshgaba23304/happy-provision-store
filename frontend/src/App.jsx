import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import OrderForm from './components/OrderForm';
import TrackOrder from './components/TrackOrder';
import AdminPanel from './components/AdminPanel';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <div className="app">
      <InstallPrompt />
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
