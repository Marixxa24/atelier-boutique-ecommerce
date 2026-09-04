import React from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight, FiTruck } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';

const CartDrawer = () => {
  const {
    isOpen,
    items,
    closeCart,
    openCheckout,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShippingCost,
    getMissingForFreeShipping
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const missingForFree = getMissingForFreeShipping();
  const freeShippingThreshold = 50000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const total = subtotal + shippingCost;

  const handleProceedToCheckout = () => {
    openCheckout();
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div className="drawer-backdrop" onClick={closeCart} />

      {/* Slide-over Drawer */}
      <aside style={styles.drawer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <FiShoppingBag style={{ fontSize: '20px', color: 'var(--color-text-main)' }} />
            <h2 style={styles.title}>Bolsa de Compras</h2>
            <span style={styles.countBadge}>({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <button onClick={closeCart} style={styles.closeBtn} aria-label="Cerrar bolsa">
            <FiX size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={styles.shippingBarContainer}>
          <div style={styles.shippingTextRow}>
            <FiTruck style={{ color: missingForFree === 0 ? 'var(--color-accent-sage)' : 'var(--color-accent-alert)' }} />
            <span style={styles.shippingText}>
              {missingForFree === 0 ? (
                <strong>¡Felicitaciones! Tenés ENVÍO GRATIS asegurado</strong>
              ) : (
                <>Te faltan <strong>${missingForFree.toLocaleString('es-AR')}</strong> para <strong>Envío Gratis</strong></>
              )}
            </span>
          </div>
          <div style={styles.progressBarTrack}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progressPercent}%`,
                backgroundColor: missingForFree === 0 ? 'var(--color-accent-sage)' : 'var(--color-accent-alert)'
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div style={styles.body}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconCircle}>
                <FiShoppingBag size={32} />
              </div>
              <h3 style={styles.emptyTitle}>Tu bolsa está vacía</h3>
              <p style={styles.emptySubtitle}>Descubre las piezas de nuestra última colección de autor y arma tu look.</p>
              <button onClick={closeCart} className="btn-primary" style={{ marginTop: '16px' }}>
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {items.map((item, idx) => (
                <div key={`${item.product}-${item.color}-${item.size}-${idx}`} style={styles.itemCard}>
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    style={styles.thumbnail}
                  />

                  {/* Details */}
                  <div style={styles.itemDetails}>
                    <div style={styles.itemTopRow}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.product, item.color, item.size)}
                        style={styles.deleteBtn}
                        title="Eliminar de la bolsa"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div style={styles.itemAttributes}>
                      <span style={styles.attributeTag}>Color: {item.color}</span>
                      <span style={styles.attributeTag}>Talle: {item.size}</span>
                    </div>

                    <div style={styles.itemBottomRow}>
                      {/* Quantity Stepper */}
                      <div style={styles.stepper}>
                        <button
                          onClick={() => updateQuantity(item.product, item.color, item.size, item.quantity - 1)}
                          style={styles.stepBtn}
                          aria-label="Disminuir cantidad"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span style={styles.stepCount}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product, item.color, item.size, item.quantity + 1)}
                          style={styles.stepBtn}
                          aria-label="Aumentar cantidad"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <span style={styles.itemTotal}>
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Breakdown & Action */}
        {items.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.summaryBreakdown}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Envío Estimado</span>
                <span style={{ ...styles.summaryValue, color: shippingCost === 0 ? 'var(--color-accent-sage)' : 'var(--color-text-main)' }}>
                  {shippingCost === 0 ? '¡GRATIS!' : `$${shippingCost.toLocaleString('es-AR')}`}
                </span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Final</span>
                <span style={styles.totalValue}>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-accent"
              style={styles.checkoutBtn}
            >
              <span>Iniciar Compra (Checkout)</span>
              <FiArrowRight size={18} />
            </button>

            <p style={styles.secureNotice}>
              🔒 Compra 100% segura • Checkout sin contraseña obligatoria
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

const styles = {
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--color-surface)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-drawer)',
    animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '600',
    margin: 0
  },
  countBadge: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    fontWeight: '500'
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  },
  shippingBarContainer: {
    padding: '14px 24px',
    backgroundColor: 'var(--color-bg-base)',
    borderBottom: '1px solid rgba(125, 110, 101, 0.1)'
  },
  shippingTextRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '13px',
    color: 'var(--color-text-main)'
  },
  shippingText: {
    fontSize: '12px'
  },
  progressBarTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(125, 110, 101, 0.15)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease, background-color 0.4s ease'
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    padding: '40px 20px'
  },
  emptyIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '22px',
    marginBottom: '8px'
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    maxWidth: '300px',
    lineHeight: 1.5
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  itemCard: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  thumbnail: {
    width: '84px',
    height: '112px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-soft)'
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  itemTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  itemName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    fontWeight: '600',
    lineHeight: 1.25,
    margin: 0
  },
  deleteBtn: {
    color: 'var(--color-text-light)',
    padding: '2px',
    transition: 'color 0.2s ease',
    cursor: 'pointer'
  },
  itemAttributes: {
    display: 'flex',
    gap: '8px',
    margin: '4px 0 8px 0'
  },
  attributeTag: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  itemBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepper: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid rgba(125, 110, 101, 0.25)',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-surface)'
  },
  stepBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-main)',
    cursor: 'pointer'
  },
  stepCount: {
    minWidth: '24px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600'
  },
  itemTotal: {
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    fontSize: '15px'
  },
  footer: {
    padding: '24px',
    backgroundColor: 'var(--color-surface)',
    borderTop: '1px solid var(--color-surface-soft)',
    boxShadow: '0 -4px 20px rgba(56, 41, 35, 0.05)'
  },
  summaryBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--color-text-muted)'
  },
  summaryLabel: {
    fontWeight: '400'
  },
  summaryValue: {
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    fontWeight: '700',
    paddingTop: '12px',
    borderTop: '1px solid var(--color-surface-soft)',
    color: 'var(--color-text-main)'
  },
  totalLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px'
  },
  totalValue: {
    fontFamily: 'var(--font-sans)',
    fontSize: '20px'
  },
  checkoutBtn: {
    width: '100%',
    padding: '16px'
  },
  secureNotice: {
    fontSize: '11px',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    marginTop: '12px',
    letterSpacing: '0.02em'
  }
};

export default CartDrawer;
