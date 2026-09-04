import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiSliders, 
  FiAlertTriangle, FiCheckCircle, FiBox, FiTrendingUp, 
  FiX, FiSave, FiTag 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['Todas']);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Stock Edit Modal State
  const [quickEditProduct, setQuickEditProduct] = useState(null);
  const [quickEditInventory, setQuickEditInventory] = useState([]);
  const [isSavingQuickStock, setIsSavingQuickStock] = useState(false);

  const token = useAuthStore((state) => state.admin?.token);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductsAndStats();
  }, []);

  const fetchProductsAndStats = async () => {
    try {
      setIsLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Products
      const prodRes = await fetch('http://localhost:5000/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // 2. Fetch Categories
      try {
        const catRes = await fetch('http://localhost:5000/api/products/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategoriesList(['Todas', ...catData]);
        }
      } catch (e) {}

      // 3. Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'Todas' || p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus = 
      selectedStatus === 'Todos' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`¿Estás segura/o de que deseas eliminar permanentemente "${name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        fetchProductsAndStats();
      } else {
        alert('No se pudo eliminar el producto.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar.');
    }
  };

  // Open Quick Edit
  const handleOpenQuickEdit = (product) => {
    setQuickEditProduct(product);
    setQuickEditInventory(JSON.parse(JSON.stringify(product.inventory || [])));
  };

  const handleQuickSizeChange = (colorIndex, size, value) => {
    const updated = [...quickEditInventory];
    updated[colorIndex].sizes[size] = Math.max(0, parseInt(value) || 0);
    setQuickEditInventory(updated);
  };

  const handleSaveQuickStock = async () => {
    if (!quickEditProduct) return;
    setIsSavingQuickStock(true);

    try {
      const res = await fetch(`http://localhost:5000/api/products/${quickEditProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inventory: quickEditInventory })
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        setQuickEditProduct(null);
        fetchProductsAndStats();
      } else {
        alert('Error al guardar el nuevo stock.');
      }
    } catch (err) {
      alert('Error de conexión al actualizar stock.');
    } finally {
      setIsSavingQuickStock(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Stock & Inventario</h1>
          <p style={styles.subtitle}>Supervisa existencias por variante de color y talle en tiempo real.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/productos/nuevo')} style={styles.newBtn}>
          <FiPlus size={18} />
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconWrapper}>
            <FiBox size={22} style={{ color: 'var(--color-text-main)' }} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Productos</span>
            <strong style={styles.kpiValue}>{products.length}</strong>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--color-accent-alert)' }}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#FDE8E8', color: 'var(--color-accent-alert)' }}>
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Stock Crítico (&lt;5 unid)</span>
            <strong style={{ ...styles.kpiValue, color: 'var(--color-accent-alert)' }}>
              {products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) < 5).length}
            </strong>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-muted)' }}>
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Sin Stock (Agotados)</span>
            <strong style={styles.kpiValue}>
              {products.filter(p => (p.totalStock || 0) === 0).length}
            </strong>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#EDF7ED', color: 'var(--color-accent-sage)' }}>
            <FiTrendingUp size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Ventas Totales</span>
            <strong style={styles.kpiValue}>${(stats.totalRevenue || 0).toLocaleString('es-AR')}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por prenda, SKU o descripción..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filtersGroup}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.selectFilter}
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat === 'Todas' ? 'Todas las categorías' : cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Borrador">Borrador</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Categoría</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Stock Total</th>
              <th style={styles.th}>Estado</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyTable}>
                  No se encontraron productos coincidentes.
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const stock = product.totalStock ?? 0;
                const isCritical = stock < 5;
                const isOut = stock === 0;

                return (
                  <tr key={product._id} style={styles.tr}>
                    {/* Producto */}
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                          alt={product.name}
                          style={styles.tableThumb}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={styles.productTableName}>{product.name}</strong>
                            {product.isPromo && (
                              <span style={styles.promoTagSmall}>
                                <FiTag size={10} style={{ marginRight: '2px' }} />
                                {product.promoBadge || 'PROMO'}
                              </span>
                            )}
                          </div>
                          <div style={styles.swatchMiniRow}>
                            {product.inventory?.map((inv, i) => (
                              <span
                                key={i}
                                style={{ ...styles.miniDot, backgroundColor: inv.hex || '#000' }}
                                title={`${inv.color}`}
                              />
                            ))}
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {product.inventory?.length || 0} color(es)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td style={styles.td}>
                      <span style={styles.skuTag}>{product.sku}</span>
                    </td>

                    {/* Categoría */}
                    <td style={styles.td}>{product.category}</td>

                    {/* Precio */}
                    <td style={styles.td}>
                      {product.isPromo && product.compareAtPrice ? (
                        <div>
                          <strong style={{ color: 'var(--color-accent-alert)' }}>${product.price?.toLocaleString('es-AR')}</strong>
                          <div style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--color-text-light)' }}>
                            ${product.compareAtPrice?.toLocaleString('es-AR')}
                          </div>
                        </div>
                      ) : (
                        <span>${product.price?.toLocaleString('es-AR')}</span>
                      )}
                    </td>

                    {/* Stock Total */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.stockBadge,
                          ...(isOut ? styles.stockOut : isCritical ? styles.stockCritical : styles.stockNormal)
                        }}
                      >
                        {stock} {stock === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td style={styles.td}>
                      <span style={product.status === 'Activo' ? styles.statusActive : styles.statusDraft}>
                        {product.status}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionsGroup}>
                        <button
                          onClick={() => handleOpenQuickEdit(product)}
                          style={styles.quickStockBtn}
                          title="Edición rápida de stock por talle"
                        >
                          <FiSliders size={14} />
                          <span>Stock</span>
                        </button>

                        <button
                          onClick={() => navigate(`/admin/productos/editar/${product._id}`)}
                          style={styles.actionBtn}
                          title="Editar producto completo"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          style={{ ...styles.actionBtn, color: 'var(--color-accent-alert)' }}
                          title="Eliminar producto"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Edit Modal */}
      {quickEditProduct && (
        <div className="modal-backdrop" onClick={() => setQuickEditProduct(null)}>
          <div style={styles.quickModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.quickModalHeader}>
              <div>
                <h3 style={styles.quickModalTitle}>Edición Rápida de Stock</h3>
                <p style={styles.quickModalSubtitle}>
                  {quickEditProduct.name} (SKU: {quickEditProduct.sku})
                </p>
              </div>
              <button onClick={() => setQuickEditProduct(null)} style={styles.closeBtn}>
                <FiX size={22} />
              </button>
            </div>

            <div style={styles.quickModalBody}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Ajusta las cantidades disponibles por cada talle y color en un solo clic:
              </p>

              <div style={styles.matrixContainer}>
                <table style={styles.matrixTable}>
                  <thead>
                    <tr>
                      <th style={styles.matrixTh}>Color</th>
                      <th style={styles.matrixTh}>XS</th>
                      <th style={styles.matrixTh}>S</th>
                      <th style={styles.matrixTh}>M</th>
                      <th style={styles.matrixTh}>L</th>
                      <th style={styles.matrixTh}>XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quickEditInventory.map((inv, colorIdx) => (
                      <tr key={colorIdx}>
                        <td style={styles.matrixTd}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ ...styles.colorPreviewDot, backgroundColor: inv.hex || '#000' }} />
                            <strong>{inv.color}</strong>
                          </div>
                        </td>
                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                          <td key={size} style={styles.matrixTd}>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={styles.cellInput}
                              value={inv.sizes?.[size] ?? 0}
                              onChange={(e) => handleQuickSizeChange(colorIdx, size, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.quickModalFooter}>
              <button onClick={() => setQuickEditProduct(null)} style={styles.btnCancel}>
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickStock}
                disabled={isSavingQuickStock}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <FiSave size={16} />
                <span>{isSavingQuickStock ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px'
  },
  title: {
    fontSize: '32px',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '4px'
  },
  newBtn: {
    padding: '12px 24px'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '32px'
  },
  kpiCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '20px 24px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(125, 110, 101, 0.08)'
  },
  kpiIconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiLabel: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    display: 'block'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-main)'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '280px',
    maxWidth: '480px'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)'
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    outline: 'none',
    fontSize: '13px',
    backgroundColor: 'var(--color-surface)'
  },
  filtersGroup: {
    display: 'flex',
    gap: '12px'
  },
  selectFilter: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    backgroundColor: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-main)',
    outline: 'none',
    cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-subtle)',
    overflow: 'hidden',
    border: '1px solid rgba(125, 110, 101, 0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '16px 20px',
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-muted)',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  tr: {
    borderBottom: '1px solid var(--color-surface-soft)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  tableThumb: {
    width: '44px',
    height: '56px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-surface-soft)'
  },
  productTableName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
    display: 'block'
  },
  promoTagSmall: {
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: 'var(--color-accent-alert)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  swatchMiniRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  miniDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  skuTag: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  stockBadge: {
    padding: '4px 10px',
    borderRadius: 'var(--radius-xs)',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block'
  },
  stockNormal: {
    backgroundColor: 'var(--color-bg-alt)',
    color: 'var(--color-text-main)'
  },
  stockCritical: {
    backgroundColor: '#FDE8E8',
    color: 'var(--color-accent-alert)',
    border: '1px solid #F8B4B4'
  },
  stockOut: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280'
  },
  statusActive: {
    backgroundColor: '#EDF7ED',
    color: '#1E4620',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  statusDraft: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  actionsGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  quickStockBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text-main)',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionBtn: {
    padding: '8px',
    color: 'var(--color-text-muted)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTable: {
    textAlign: 'center',
    padding: '48px',
    color: 'var(--color-text-muted)'
  },
  quickModalCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '620px',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    animation: 'modalScaleUp 0.2s ease'
  },
  quickModalHeader: {
    padding: '20px 24px',
    backgroundColor: 'var(--color-bg-base)',
    borderBottom: '1px solid var(--color-surface-soft)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quickModalTitle: {
    fontSize: '20px',
    margin: 0
  },
  quickModalSubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0 0'
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    padding: '4px'
  },
  quickModalBody: {
    padding: '24px'
  },
  matrixContainer: {
    overflowX: 'auto',
    border: '1px solid var(--color-surface-soft)',
    borderRadius: 'var(--radius-sm)'
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  matrixTh: {
    padding: '10px 14px',
    backgroundColor: 'var(--color-bg-base)',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  matrixTd: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-surface-soft)',
    textAlign: 'center'
  },
  colorPreviewDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'inline-block',
    border: '1px solid rgba(0,0,0,0.15)'
  },
  cellInput: {
    width: '64px',
    padding: '6px',
    textAlign: 'center',
    fontWeight: '600'
  },
  quickModalFooter: {
    padding: '16px 24px',
    backgroundColor: 'var(--color-surface-soft)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  btnCancel: {
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-muted)'
  }
};

export default AdminDashboard;
