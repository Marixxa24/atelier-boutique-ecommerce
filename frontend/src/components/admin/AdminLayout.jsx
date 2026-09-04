import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiExternalLink } from 'react-icons/fi';

const AdminLayout = () => {
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Gestión de Stock', path: '/admin/stock', icon: <FiBox size={18} /> },
    { label: 'Pedidos', path: '/admin/pedidos', icon: <FiShoppingBag size={18} /> },
    { label: 'Clientes', path: '/admin/clientes', icon: <FiUsers size={18} /> },
    { label: 'Configuración de Tienda', path: '/admin/configuracion', icon: <FiSettings size={18} /> }
  ];

  return (
    <div style={styles.layoutContainer}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo & Brand */}
        <div style={styles.logoSection}>
          <h2 style={styles.brandTitle}>ATELIER</h2>
          <span style={styles.adminBadge}>ADMIN PANEL</span>
        </div>

        {/* Store Quicklink */}
        <div style={styles.quicklinkBox}>
          <a href="/" target="_blank" rel="noreferrer" style={styles.quicklink}>
            <span>Ver Tienda Pública</span>
            <FiExternalLink size={14} />
          </a>
        </div>

        {/* Navigation Items */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {})
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Profile */}
        <div style={styles.footerSection}>
          <div style={styles.profileCard}>
            <div style={styles.avatarCircle}>
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{admin.name || 'Valentina Atelier'}</span>
              <span style={styles.profileEmail}>{admin.email}</span>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <FiLogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-base)'
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'var(--color-surface)',
    borderRight: '1px solid rgba(125, 110, 101, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 20px',
    position: 'sticky',
    top: 0,
    height: '100vh'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  brandTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '26px',
    letterSpacing: '3px',
    margin: 0
  },
  adminBadge: {
    fontSize: '9px',
    fontWeight: '700',
    backgroundColor: 'var(--color-text-main)',
    color: 'var(--color-surface)',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.06em'
  },
  quicklinkBox: {
    margin: '16px 0 20px 0'
  },
  quicklink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-bg-alt)',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    transition: 'all 0.2s ease'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--color-text-muted)',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%'
  },
  navButtonActive: {
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text-main)',
    fontWeight: '700',
    boxShadow: '0 2px 6px rgba(56, 41, 35, 0.05)'
  },
  footerSection: {
    borderTop: '1px solid var(--color-surface-soft)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-main)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  profileEmail: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-accent-alert)',
    padding: '8px 4px',
    transition: 'opacity 0.2s ease'
  },
  mainContent: {
    flex: 1,
    padding: '36px 44px',
    overflowY: 'auto',
    maxHeight: '100vh'
  }
};

export default AdminLayout;
