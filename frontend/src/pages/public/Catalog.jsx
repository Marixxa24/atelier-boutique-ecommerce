import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/public/ProductCard';
import { 
  FiFilter, FiSearch, FiSliders, FiTag, 
  FiRotateCcw, FiCheck, FiChevronRight, FiGrid 
} from 'react-icons/fi';

const COLOR_PALETTE = [
  { name: 'Negro', hex: '#241E1C' },
  { name: 'Blanco / Marfil', hex: '#F7F3EE' },
  { name: 'Terracota', hex: '#BF775D' },
  { name: 'Arena', hex: '#D6C7B2' },
  { name: 'Vainilla', hex: '#F9F5EC' },
  { name: 'Rosa Nube', hex: '#ECCDC5' },
  { name: 'Marrón Moca', hex: '#382923' },
  { name: 'Verde Sage', hex: '#7A8274' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['Todas']);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || 'Todas');
  const [onlyPromos, setOnlyPromos] = useState(searchParams.get('promo') === 'true');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      setIsLoading(true);

      // Fetch Categories
      try {
        const catRes = await fetch('http://localhost:5000/api/products/categories');
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategoriesList(['Todas', ...cats]);
        }
      } catch (e) {}

      // Fetch Products
      const res = await fetch('http://localhost:5000/api/products?status=Activo');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Color Filter Toggle
  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  // Size Filter Toggle
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setOnlyPromos(false);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMaxPrice(150000);
    setSortBy('relevance');
  };

  // Apply Filter Logic
  const filteredProducts = products.filter((p) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchDesc) return false;
    }

    // 2. Category filter
    if (selectedCategory !== 'Todas') {
      if (p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // 3. Only Promos filter
    if (onlyPromos && !p.isPromo) {
      return false;
    }

    // 4. Max Price filter
    if (p.price > maxPrice) {
      return false;
    }

    // 5. Colors filter
    if (selectedColors.length > 0) {
      const hasMatchingColor = p.inventory?.some((inv) =>
        selectedColors.some((sc) => inv.color?.toLowerCase().includes(sc.toLowerCase()) || sc.toLowerCase().includes(inv.color?.toLowerCase()))
      );
      if (!hasMatchingColor) return false;
    }

    // 6. Sizes filter
    if (selectedSizes.length > 0) {
      const hasMatchingSize = p.inventory?.some((inv) =>
        selectedSizes.some((sz) => (inv.sizes?.[sz] || 0) > 0)
      );
      if (!hasMatchingSize) return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
    return 0; // relevance / new
  });

  return (
    <div style={styles.page}>
      {/* Top Banner / Breadcrumbs */}
      <div style={styles.topHeader}>
        <div className="container">
          <div style={styles.breadcrumb}>
            <span>Inicio</span>
            <FiChevronRight size={12} />
            <strong style={{ color: 'var(--color-text-main)' }}>Catálogo Completo</strong>
          </div>
          <h1 style={styles.headerTitle}>Catálogo & Colección Editorial</h1>
          <p style={styles.headerSubtitle}>
            Explora la selección completa de prendas confeccionadas en telas nobles y cortes contemporáneos.
          </p>
        </div>
      </div>

      <div className="container" style={styles.catalogLayout}>
        {/* ============================================================ */}
        {/* BARRA LATERAL DE FILTROS (COLUMNA IZQUIERDA)                 */}
        {/* ============================================================ */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFilter size={18} style={{ color: 'var(--color-text-main)' }} />
              <h3 style={styles.sidebarTitle}>Filtros</h3>
            </div>
            <button onClick={handleResetFilters} style={styles.resetBtn} title="Limpiar todos los filtros">
              <FiRotateCcw size={12} />
              <span>Limpiar</span>
            </button>
          </div>

          {/* 1. Buscador */}
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Buscar Prenda</label>
            <div style={styles.searchBox}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Nombre, SKU..."
                className="input-field"
                style={{ padding: '8px 12px 8px 34px', fontSize: '13px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Switch Promociones */}
          <div style={styles.filterSection}>
            <label style={styles.promoToggleCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTag size={16} style={{ color: 'var(--color-accent-alert)' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-main)', display: 'block' }}>
                    Solo Promociones
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Prendas con descuento</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={onlyPromos}
                onChange={(e) => setOnlyPromos(e.target.checked)}
                style={styles.checkboxInput}
              />
            </label>
          </div>

          {/* 3. Categorías */}
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Categorías</label>
            <div style={styles.categoryList}>
              {categoriesList.map((cat) => {
                const count = cat === 'Todas' 
                  ? products.length 
                  : products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...styles.categoryRowBtn,
                      ...(isSelected ? styles.categoryRowBtnActive : {})
                    }}
                  >
                    <span>{cat === 'Todas' ? 'Todas las categorías' : cat}</span>
                    <span style={styles.categoryCountBadge}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Filtro por Colores */}
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Colores</label>
            <div style={styles.colorPaletteGrid}>
              {COLOR_PALETTE.map((color) => {
                const isChecked = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => toggleColor(color.name)}
                    style={{
                      ...styles.colorSwatchBtn,
                      backgroundColor: color.hex,
                      borderColor: isChecked ? 'var(--color-text-main)' : 'rgba(125, 110, 101, 0.2)'
                    }}
                    title={color.name}
                  >
                    {isChecked && (
                      <FiCheck
                        size={12}
                        style={{
                          color: color.hex === '#F7F3EE' || color.hex === '#F9F5EC' ? '#382923' : '#FFFFFF'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedColors.length > 0 && (
              <div style={styles.selectedFiltersList}>
                {selectedColors.map((c) => (
                  <span key={c} style={styles.filterTagChip}>
                    {c}
                    <button onClick={() => toggleColor(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. Filtro por Talles */}
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Talles Disponibles</label>
            <div style={styles.sizeChipsGrid}>
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    style={{
                      ...styles.sizeFilterChip,
                      ...(isSelected ? styles.sizeFilterChipActive : {})
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Filtro por Rango de Precios */}
          <div style={styles.filterSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={styles.filterLabel}>Precio Máximo</label>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
                ${maxPrice.toLocaleString('es-AR')}
              </strong>
            </div>
            <input
              type="range"
              min="20000"
              max="200000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={styles.rangeSlider}
            />
            <div style={styles.rangeLabels}>
              <span>$20.000</span>
              <span>$200.000</span>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* COLUMNA DERECHA: RESULTADOS DEL CATÁLOGO                     */}
        {/* ============================================================ */}
        <main style={styles.mainContent}>
          {/* Toolbar de Resultados */}
          <div style={styles.resultsToolbar}>
            <div>
              <span style={styles.resultsCount}>
                Mostrando <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'prenda' : 'prendas'}
              </span>
            </div>

            <div style={styles.sortContainer}>
              <FiSliders size={14} style={{ color: 'var(--color-text-muted)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="relevance">Novedades / Relevancia</option>
                <option value="discount">Mayor Descuento Promocional</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>Cargando catálogo...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={styles.emptyResultsBox}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '8px' }}>
                No encontramos prendas con los filtros seleccionados
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Prueba ajustando el rango de precios, cambiando de categoría o quitando los filtros aplicados.
              </p>
              <button onClick={handleResetFilters} className="btn-primary">
                Limpiar Todos los Filtros
              </button>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    paddingBottom: '100px'
  },
  topHeader: {
    backgroundColor: 'var(--color-surface-soft)',
    padding: '40px 0 32px 0',
    borderBottom: '1px solid rgba(125, 110, 101, 0.1)',
    marginBottom: '40px'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    marginBottom: '12px'
  },
  headerTitle: {
    fontSize: 'clamp(28px, 3.5vw, 40px)',
    margin: 0,
    fontWeight: '600'
  },
  headerSubtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '6px'
  },
  catalogLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '40px',
    alignItems: 'start'
  },
  sidebar: {
    backgroundColor: 'var(--color-surface)',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-subtle)',
    border: '1px solid rgba(125, 110, 101, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  sidebarTitle: {
    fontSize: '18px',
    margin: 0
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    cursor: 'pointer'
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--color-text-muted)'
  },
  promoToggleCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    border: '1px solid rgba(184, 29, 36, 0.15)'
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--color-accent-alert)',
    cursor: 'pointer'
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  categoryRowBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 'var(--radius-xs)',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    backgroundColor: 'transparent',
    transition: 'all 0.15s ease',
    textAlign: 'left'
  },
  categoryRowBtnActive: {
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text-main)',
    fontWeight: '700'
  },
  categoryCountBadge: {
    fontSize: '11px',
    color: 'var(--color-text-light)',
    backgroundColor: 'var(--color-bg-base)',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  colorPaletteGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  colorSwatchBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  selectedFiltersList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px'
  },
  filterTagChip: {
    fontSize: '11px',
    padding: '2px 8px',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: 'var(--radius-xs)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  sizeChipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px'
  },
  sizeFilterChip: {
    padding: '6px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid rgba(125, 110, 101, 0.15)',
    color: 'var(--color-text-main)',
    cursor: 'pointer'
  },
  sizeFilterChipActive: {
    backgroundColor: 'var(--color-text-main)',
    color: 'white',
    borderColor: 'var(--color-text-main)'
  },
  rangeSlider: {
    width: '100%',
    accentColor: 'var(--color-text-main)',
    cursor: 'pointer'
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    marginTop: '4px'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  resultsToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
    padding: '14px 20px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-subtle)',
    border: '1px solid rgba(125, 110, 101, 0.08)'
  },
  resultsCount: {
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sortSelect: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    backgroundColor: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-main)',
    outline: 'none',
    cursor: 'pointer'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '32px 24px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--color-surface-soft)',
    borderTop: '3px solid var(--color-text-main)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyResultsBox: {
    backgroundColor: 'var(--color-surface)',
    padding: '60px 40px',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    border: '1px solid rgba(125, 110, 101, 0.08)'
  }
};

export default Catalog;
