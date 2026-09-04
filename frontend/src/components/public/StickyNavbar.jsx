import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiLogOut, FiTag, FiCheck } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import useCustomerAuthStore from '../../store/customerAuthStore';

const StickyNavbar = ({ onOpenSearch }) => {
  const { toggleCart, getTotalItemsCount } = useCartStore();
  const { customer, openAuthModal, logoutCustomer } = useCustomerAuthStore();
  const totalCount = getTotalItemsCount();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header style={styles.header}>
      {/* Top micro-announcement */}
      <div style={styles.topBar}>
        <p style={styles.topBarText}>ENVÍOS SIN CARGO EN COMPRAS SUPERIORES A $50.000 • 3 Y 6 CUOTAS SIN INTERÉS</p>
      </div>

      <nav style={styles.nav}>
        <div className="container-wide" style={styles.navContainer}>
          {/* Navegación Izquierda */}
          <div style={styles.navLeft}>
            <Link to="/" style={styles.navLink}>
              Inicio
            </Link>
            <Link to="/catalogo" style={styles.navLink}>
              Catálogo Completo
            </Link>
            <Link to="/catalogo?promo=true" style={{ ...styles.navLink, color: 'var(--color-accent-alert)', fontWeight: '700' }}>
              <FiTag size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Promociones
            </Link>
          </div>

          {/* Logo Central */}
          <div style={styles.navCenter}>
            <Link to="/" style={styles.logo}>
              ATELIER
            </Link>
          </div>

          {/* Acciones Derecha */}
          <div style={styles.navRight}>
            {/* Buscador */}
            <button
              onClick={onOpenSearch}
              style={styles.searchTrigger}
              title="Buscar prenda..."
            >
              <FiSearch style={styles.icon} />
              <span style={styles.searchPrompt}>Buscar prenda...</span>
            </button>

            {/* Login / Perfil de Cliente */}
            {customer ? (
              <div style={styles.profileWrapper}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={styles.userButtonLoggedIn}
                  title="Mi Cuenta"
                >
                  <div style={styles.userAvatarBadge}>
                    {customer.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <span style={styles.userNameText}>{customer.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                      <strong style={{ fontSize: '13px', color: 'var(--color-text-main)', display: 'block' }}>
                        {customer.name}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{customer.email}</span>
                    </div>

                    <Link
                      to="/catalogo"
                      onClick={() => setIsProfileMenuOpen(false)}
                      style={styles.dropdownItem}
                    >
                      Explorar Catálogo
                    </Link>

                    <button
                      onClick={() => {
                        logoutCustomer();
                        setIsProfileMenuOpen(false);
                      }}
                      style={styles.dropdownLogoutBtn}
                    >
                      <FiLogOut size={13} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                style={styles.loginTriggerBtn}
                title="Iniciar Sesión / Registrarse"
              >
                <FiUser style={styles.icon} />
                <span style={styles.loginPrompt}>Ingresar</span>
              </button>
            )}

            {/* Bolsa de Compras */}
            <button
              onClick={toggleCart}
              style={styles.cartButton}
              aria-label="Bolsa de compras"
            >
              <FiShoppingBag style={styles.icon} />
              <span style={styles.cartLabel}>Bolsa</span>
              {totalCount > 0 && (
                <span style={styles.cartBadge}>{totalCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 900,
    backgroundColor: 'rgba(251, 248, 243, 0.94)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(125, 110, 101, 0.12)',
    transition: 'all 0.3s ease'
  },
  topBar: {
    backgroundColor: 'var(--color-text-main)',
    color: 'var(--color-bg-base)',
    textAlign: 'center',
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em'
  },
  topBarText: {
    margin: 0
  },
  nav: {
    padding: '16px 0'
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1
  },
  navLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '4px 0',
    position: 'relative',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  navCenter: {
    flex: 1,
    textAlign: 'center'
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '6px',
    color: 'var(--color-text-main)',
    display: 'inline-block',
    textDecoration: 'none'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '14px',
    flex: 1
  },
  searchTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(246, 239, 233, 0.7)',
    border: '1px solid rgba(125, 110, 101, 0.15)',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  searchPrompt: {
    display: 'inline',
    fontSize: '12px'
  },
  loginTriggerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-main)',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    cursor: 'pointer'
  },
  loginPrompt: {
    fontSize: '12px'
  },
  profileWrapper: {
    position: 'relative'
  },
  userButtonLoggedIn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px 4px 6px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-surface-soft)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    cursor: 'pointer'
  },
  userAvatarBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-main)',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userNameText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '200px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid rgba(125, 110, 101, 0.12)',
    overflow: 'hidden',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownHeader: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--color-surface-soft)',
    backgroundColor: 'var(--color-bg-base)'
  },
  dropdownItem: {
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--color-text-main)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--color-surface-soft)',
    transition: 'background-color 0.15s ease'
  },
  dropdownLogoutBtn: {
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--color-accent-alert)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left'
  },
  cartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-text-main)',
    color: 'var(--color-surface)',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  cartLabel: {
    fontSize: '12px'
  },
  icon: {
    fontSize: '16px'
  },
  cartBadge: {
    backgroundColor: 'var(--color-accent-alert)',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    marginLeft: '2px'
  }
};

export default StickyNavbar;
