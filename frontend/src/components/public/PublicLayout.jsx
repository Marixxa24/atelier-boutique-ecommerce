import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StickyNavbar from './StickyNavbar';
import CartDrawer from './CartDrawer';
import GuestCheckoutModal from './GuestCheckoutModal';
import CustomerAuthModal from './CustomerAuthModal';
import SearchModal from './SearchModal';
import { FiInstagram, FiMail, FiPhone, FiMapPin, FiTruck, FiCreditCard, FiShield } from 'react-icons/fi';

const PublicLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    const catalogSection = document.getElementById('catalogo-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.layoutWrapper}>
      {/* Sticky Header */}
      <StickyNavbar
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content */}
      <main style={{ minHeight: '80vh' }}>
        <Outlet context={{ selectedCategory, setSelectedCategory }} />
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <GuestCheckoutModal />
      <CustomerAuthModal />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={() => {
          const catalogSection = document.getElementById('catalogo-section');
          if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Rich Footer */}
      <footer style={styles.footer}>
        {/* Value Proposition Bar */}
        <div style={styles.featuresBar}>
          <div className="container" style={styles.featuresGrid}>
            <div style={styles.featureItem}>
              <FiTruck style={styles.featureIcon} />
              <div>
                <h4 style={styles.featureTitle}>Envíos a Todo el País</h4>
                <p style={styles.featureDesc}>Gratis en órdenes mayores a $50.000</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <FiCreditCard style={styles.featureIcon} />
              <div>
                <h4 style={styles.featureTitle}>3 y 6 Cuotas Sin Interés</h4>
                <p style={styles.featureDesc}>Con todas las tarjetas bancarias</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <FiShield style={styles.featureIcon} />
              <div>
                <h4 style={styles.featureTitle}>Diseño & Calidad de Autor</h4>
                <p style={styles.featureDesc}>Confección noble y terminaciones a mano</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container" style={styles.footerMain}>
          <div style={styles.footerColBrand}>
            <h2 style={styles.footerLogo}>ATELIER</h2>
            <p style={styles.brandManifesto}>
              Boutique de indumentaria contemporánea con estética minimalista. Diseñamos siluetas atemporales y prendas esenciales que acompañan tu identidad.
            </p>
            <div style={styles.socialRow}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialIcon} aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="mailto:contacto@atelier.com" style={styles.socialIcon} aria-label="Email">
                <FiMail />
              </a>
              <a href="https://wa.me/5491144556677" target="_blank" rel="noreferrer" style={styles.socialIcon} aria-label="WhatsApp">
                <FiPhone />
              </a>
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Colecciones</h4>
            <ul style={styles.footerLinks}>
              <li><button onClick={() => handleSelectCategory('Novedades')} style={styles.footerLink}>Novedades 2026</button></li>
              <li><button onClick={() => handleSelectCategory('Tops')} style={styles.footerLink}>Tops & Blusas</button></li>
              <li><button onClick={() => handleSelectCategory('Pantalones')} style={styles.footerLink}>Pantalones & Palazzos</button></li>
              <li><button onClick={() => handleSelectCategory('Sets')} style={styles.footerLink}>Sets Minimalistas</button></li>
              <li><button onClick={() => handleSelectCategory('Colección')} style={styles.footerLink}>Línea Prêt-à-Porter</button></li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Atención & Boutique</h4>
            <div style={styles.boutiqueInfo}>
              <div style={styles.infoRow}>
                <FiMapPin style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>Av. Alvear 1750, Recoleta, Buenos Aires</span>
              </div>
              <div style={styles.infoRow}>
                <FiPhone style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>WhatsApp: +54 9 11 4455-6677</span>
              </div>
              <p style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Lunes a Sábados: 10:30 a 19:30 hs.
              </p>
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Newsletter Editorial</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              Suscríbete para recibir adelantos exclusivos de colección y beneficios privados.
            </p>
            <div style={styles.newsletterForm}>
              <input type="email" placeholder="Tu email..." style={styles.newsletterInput} />
              <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>Unirme</button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={styles.copyrightBar}>
          <div className="container" style={styles.copyrightContent}>
            <p>© 2026 ATELIER BOUTIQUE. Todos los derechos reservados.</p>
            <div style={styles.legalLinks}>
              <span>Términos y Condiciones</span>
              <span>•</span>
              <span>Política de Privacidad</span>
              <span>•</span>
              <a href="/admin/login" style={{ textDecoration: 'underline', color: 'var(--color-text-muted)' }}>Acceso Admin</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  layoutWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-base)'
  },
  footer: {
    backgroundColor: 'var(--color-surface)',
    borderTop: '1px solid var(--color-surface-soft)',
    marginTop: 'auto'
  },
  featuresBar: {
    backgroundColor: 'var(--color-bg-alt)',
    borderBottom: '1px solid rgba(125, 110, 101, 0.1)',
    padding: '32px 0'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '28px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  featureIcon: {
    fontSize: '28px',
    color: 'var(--color-accent-secondary)',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '16px',
    fontFamily: 'var(--font-serif)',
    fontWeight: '600',
    marginBottom: '2px'
  },
  featureDesc: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  footerMain: {
    padding: '60px 24px',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
    gap: '48px'
  },
  footerColBrand: {
    display: 'flex',
    flexDirection: 'column'
  },
  footerLogo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '28px',
    letterSpacing: '4px',
    marginBottom: '16px'
  },
  brandManifesto: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.7',
    maxWidth: '320px',
    marginBottom: '20px'
  },
  socialRow: {
    display: 'flex',
    gap: '14px'
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  footerColTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '18px',
    color: 'var(--color-text-main)'
  },
  footerLinks: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerLink: {
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'color 0.2s ease'
  },
  boutiqueInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--color-text-main)'
  },
  infoRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  newsletterForm: {
    display: 'flex',
    gap: '8px'
  },
  newsletterInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.25)',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: 'var(--color-bg-base)'
  },
  copyrightBar: {
    borderTop: '1px solid var(--color-surface-soft)',
    padding: '20px 0',
    backgroundColor: 'var(--color-bg-base)',
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  copyrightContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  legalLinks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }
};

export default PublicLayout;
