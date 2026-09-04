import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Views
import PublicLayout from './components/public/PublicLayout';
import Home from './pages/public/Home';
import Catalog from './pages/public/Catalog';

// Admin Views
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNewProduct from './pages/admin/AdminNewProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Tienda Pública */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
        </Route>

        {/* Acceso Administrador */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Panel de Control Privado */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/stock" replace />} />
          <Route path="stock" element={<AdminDashboard />} />
          <Route path="productos/nuevo" element={<AdminNewProduct />} />
          <Route path="productos/editar/:id" element={<AdminNewProduct />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
