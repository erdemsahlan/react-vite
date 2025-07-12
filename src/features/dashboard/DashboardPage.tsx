import React from 'react';
import Sidebar from '../../assets/Sidebar';
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";

const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 32, background: '#f4f6fb' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001' }}>
          <p>Hoş geldiniz! Burası ana sayfa dashboard alanıdır.</p>
          <Button variant="outline">Button</Button>
          <Link to="/customers">
            <Button style={{ marginLeft: 12, marginTop: 12 }}>Müşteriler</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 