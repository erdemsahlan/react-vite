import React from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../features/login/loginApi';

const menuItems = [
  { label: 'ANASAYFA', icon: '🏠', to: '/dashboard' },
  { label: 'MÜŞTERİLER', icon: '👤', to: '/customers' },
  { label: 'ÜRÜNLER', icon: '👤', to: '/products' },
  { label: 'ÜRÜNLER ALIŞ-SATIŞ', icon: '💱', to: '/product-trade' },
  { label: 'ÇIKIŞ YAP', icon: '🚪', to: null, onClick: logout },
];

const Sidebar: React.FC = () => {
  return (
    <aside style={{ width: 220, background: '#f8f9fa', height: '100vh', padding: 24, boxSizing: 'border-box', borderRight: '1px solid #eee' }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>Uyum Pamuk</div>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map(item => (
            <li key={item.label} style={{ marginBottom: 18 }}>
              {item.to ? (
                <Link to={item.to} style={{ display: 'flex', alignItems: 'center', color: '#222', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>
                  <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </button>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', color: '#222', fontWeight: 500, fontSize: 16 }}>
                  <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 