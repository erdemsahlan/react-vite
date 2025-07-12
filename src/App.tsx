import LoginPage from './features/login/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import CustomersPage from './features/customers/CustomersPage';
import ProductsPage from './features/products/ProductsPage';
import ProductTradePage from './features/productTrade/ProductTradePage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  const token = localStorage.getItem('token');
  if (!token) return <LoginPage />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product-trade" element={<ProductTradePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
