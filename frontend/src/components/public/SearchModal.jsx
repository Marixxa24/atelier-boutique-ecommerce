import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';

const SearchModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(searchTerm)}&status=Activo`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const quickCategories = ['Tops', 'Pantalones', 'Sets', 'Colección', 'Lino'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div style={styles.searchHeader}>
          <FiSearch size={26} style={{ color: 'var(--color-text-main)' }} />
          <input
            type="text"
            placeholder="Buscar prenda, color, tela o SKU..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar buscador">
            <FiX size={26} />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div style={styles.suggestionsRow}>
          <span style={styles.suggestionsLabel}>Sugerencias:</span>
          {quickCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchTerm(cat)}
              style={styles.categoryChip}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div style={styles.resultsBody}>
          {isLoading ? (
            <p style={styles.statusText}>Buscando en el catálogo de Atelier...</p>
          ) : results.length > 0 ? (
            <div style={styles.resultsGrid}>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(product);
                    onClose();
                  }}
                  style={styles.resultItem}
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80'}
                    alt={product.name}
                    style={styles.resultThumb}
                  />
                  <div style={styles.resultInfo}>
                    <span style={styles.resultCategory}>{product.category}</span>
                    <h4 style={styles.resultTitle}>{product.name}</h4>
                    <span style={styles.resultPrice}>${product.price?.toLocaleString('es-AR')}</span>
                  </div>
                  <FiArrowRight style={styles.arrowIcon} />
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <p style={styles.statusText}>No se encontraron prendas que coincidan con "{searchTerm}".</p>
          ) : (
            <p style={styles.statusText}>Ingresa una palabra clave para explorar el catálogo.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '80vh',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'modalScaleUp 0.25s ease'
  },
  searchHeader: {
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid var(--color-surface-soft)',
    backgroundColor: 'var(--color-bg-base)'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    color: 'var(--color-text-main)'
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  suggestionsRow: {
    padding: '12px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--color-surface-soft)',
    overflowX: 'auto'
  },
  suggestionsLabel: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontWeight: '600'
  },
  categoryChip: {
    fontSize: '12px',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-main)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(125, 110, 101, 0.15)',
    cursor: 'pointer'
  },
  resultsBody: {
    padding: '24px 28px',
    overflowY: 'auto',
    minHeight: '240px'
  },
  statusText: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '14px',
    marginTop: '40px'
  },
  resultsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid rgba(125, 110, 101, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  resultThumb: {
    width: '48px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-xs)'
  },
  resultInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  resultCategory: {
    fontSize: '10px',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    fontWeight: '600',
    letterSpacing: '0.04em'
  },
  resultTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '16px',
    fontWeight: '600',
    margin: '2px 0'
  },
  resultPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--color-text-main)'
  },
  arrowIcon: {
    color: 'var(--color-text-muted)',
    fontSize: '18px'
  }
};

export default SearchModal;
