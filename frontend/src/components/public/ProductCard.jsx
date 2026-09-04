import React, { useState } from 'react';
import { FiShoppingBag, FiCheck, FiTag } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';

const SIZES_LIST = ['XS', 'S', 'M', 'L', 'XL'];

const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  // Default color to first inventory item
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const currentColor = product.inventory?.[selectedColorIdx] || { color: 'Único', hex: '#382923', sizes: {} };

  // Calculate first available size
  const getFirstAvailableSize = (colorObj) => {
    for (const size of SIZES_LIST) {
      if (colorObj.sizes?.[size] > 0) return size;
    }
    return 'M';
  };

  const [selectedSize, setSelectedSize] = useState(() => getFirstAvailableSize(currentColor));
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Current stock for selected color and size
  const currentVariantStock = currentColor.sizes?.[selectedSize] || 0;

  const handleColorChange = (idx) => {
    setSelectedColorIdx(idx);
    const newColor = product.inventory?.[idx];
    if (newColor) {
      setSelectedSize(getFirstAvailableSize(newColor));
    }
  };

  const handleAddToCart = () => {
    if (currentVariantStock <= 0) return;

    addItem({
      product: product._id,
      name: product.name,
      color: currentColor.color,
      size: selectedSize,
      quantity: 1,
      price: product.price,
      image: product.images?.[0] || ''
    });

    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  // Stock Badge Render Logic
  const renderStockBadge = () => {
    if (currentVariantStock === 0) {
      return <span className="badge-out-of-stock">Agotado ({selectedSize})</span>;
    }
    if (currentVariantStock === 1) {
      return <span className="badge-low-stock">¡Última unidad!</span>;
    }
    if (currentVariantStock === 2) {
      return <span className="badge-low-stock">¡Últimas 2 unidades!</span>;
    }
    return <span className="badge-in-stock">En Stock</span>;
  };

  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="product-card">
      {/* 3:4 Vertical Image Container */}
      <div className="product-image-container">
        <img
          src={imageSrc}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {/* Dynamic Stock Badge */}
        <div style={styles.badgeWrapper}>
          {renderStockBadge()}
        </div>

        {/* Promo / Discount Badge */}
        {product.isPromo && (
          <div style={styles.promoBadgeWrapper}>
            <span style={styles.promoBadge}>
              <FiTag size={10} style={{ marginRight: '3px' }} />
              {product.promoBadge || `${product.discountPercent}% OFF`}
            </span>
          </div>
        )}

        {/* Sliding Hover Action */}
        <div className="product-overlay-action">
          <button
            onClick={handleAddToCart}
            disabled={currentVariantStock <= 0}
            className={currentVariantStock > 0 ? "btn-accent" : "btn-primary"}
            style={{ width: '100%', padding: '12px 18px', fontSize: '13px' }}
          >
            {isAddedAnimation ? (
              <>
                <FiCheck style={{ fontSize: '16px' }} />
                <span>¡Agregado a la Bolsa!</span>
              </>
            ) : currentVariantStock > 0 ? (
              <>
                <FiShoppingBag style={{ fontSize: '16px' }} />
                <span>Agregar a la Bolsa</span>
              </>
            ) : (
              <span>Sin Stock en Talle {selectedSize}</span>
            )}
          </button>
        </div>
      </div>

      {/* Info & Selectors */}
      <div style={styles.cardDetails}>
        {/* Category & SKU */}
        <div style={styles.metaRow}>
          <span style={styles.category}>{product.category}</span>
          <span style={styles.sku}>{product.sku}</span>
        </div>

        {/* Product Title */}
        <h3 style={styles.title}>{product.name}</h3>

        {/* Price Row (With Compare At Strikethrough if Promo) */}
        <div style={styles.priceRow}>
          {product.isPromo && product.compareAtPrice && product.compareAtPrice > product.price ? (
            <>
              <span style={styles.pricePromo}>${product.price?.toLocaleString('es-AR')}</span>
              <span style={styles.priceOriginal}>${product.compareAtPrice?.toLocaleString('es-AR')}</span>
            </>
          ) : (
            <span style={styles.price}>${product.price?.toLocaleString('es-AR')}</span>
          )}
          <span style={styles.installments}>
            3 cuotas de ${(Math.round((product.price || 0) / 3)).toLocaleString('es-AR')}
          </span>
        </div>

        {/* Color Swatches */}
        {product.inventory && product.inventory.length > 0 && (
          <div style={styles.swatchesRow}>
            <span style={styles.selectorLabel}>Color: <strong>{currentColor.color}</strong></span>
            <div style={styles.swatchesList}>
              {product.inventory.map((inv, idx) => (
                <button
                  key={inv.color || idx}
                  onClick={() => handleColorChange(idx)}
                  className={`color-swatch ${idx === selectedColorIdx ? 'active' : ''}`}
                  style={{ backgroundColor: inv.hex || '#382923' }}
                  title={inv.color}
                  aria-label={`Seleccionar color ${inv.color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Chips */}
        <div style={styles.sizesRow}>
          <span style={styles.selectorLabel}>Talle:</span>
          <div style={styles.sizesList}>
            {SIZES_LIST.map((size) => {
              const stockForThisSize = currentColor.sizes?.[size] || 0;
              const isSelected = selectedSize === size;
              const isOutOfStock = stockForThisSize === 0;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={isOutOfStock}
                  className={`size-chip ${isSelected ? 'active' : ''}`}
                  title={isOutOfStock ? `${size} (Agotado)` : `${size} (${stockForThisSize} disponibles)`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
};

const styles = {
  badgeWrapper: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 5
  },
  promoBadgeWrapper: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 5
  },
  promoBadge: {
    backgroundColor: 'var(--color-accent-alert)',
    color: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: 'var(--radius-xs)',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(184, 29, 36, 0.3)',
    display: 'inline-flex',
    alignItems: 'center'
  },
  cardDetails: {
    padding: '16px 4px 8px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-muted)'
  },
  category: {
    fontWeight: '600'
  },
  sku: {
    color: 'var(--color-text-light)'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '19px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
    lineHeight: '1.25',
    margin: 0
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    flexWrap: 'wrap'
  },
  price: {
    fontFamily: 'var(--font-sans)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--color-text-main)'
  },
  pricePromo: {
    fontFamily: 'var(--font-sans)',
    fontSize: '19px',
    fontWeight: '800',
    color: 'var(--color-accent-alert)'
  },
  priceOriginal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--color-text-light)',
    textDecoration: 'line-through'
  },
  installments: {
    fontSize: '12px',
    color: 'var(--color-accent-secondary)',
    fontWeight: '500'
  },
  swatchesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid rgba(125, 110, 101, 0.08)'
  },
  selectorLabel: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  swatchesList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sizesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '4px'
  },
  sizesList: {
    display: 'flex',
    gap: '6px'
  }
};

export default ProductCard;
