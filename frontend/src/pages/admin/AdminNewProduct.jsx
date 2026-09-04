import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  FiArrowLeft, FiPlus, FiTrash2, FiImage, 
  FiSave, FiCheck, FiAlertCircle, FiUploadCloud, 
  FiTag, FiPercent, FiDollarSign, FiX 
} from 'react-icons/fi';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const defaultCategoriesList = ['Tops', 'Pantalones', 'Sets', 'Colección', 'Vestidos', 'Abrigos', 'Accesorios'];

const sampleImagePresets = [
  "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"
];

const AdminNewProduct = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.admin?.token);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    originalPrice: '', // Base list price
    price: '', // Final selling price
    compareAtPrice: '',
    isPromo: false,
    discountPercent: 0,
    promoBadge: 'SALE 20% OFF',
    isFeatured: false,
    category: 'Tops',
    status: 'Activo',
    images: []
  });

  const [categories, setCategories] = useState(defaultCategoriesList);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [inventory, setInventory] = useState([
    { color: 'Negro Moca', hex: '#241E1C', sizes: { XS: 2, S: 4, M: 4, L: 2, XL: 1 } },
    { color: 'Blanco Lino', hex: '#FAF7F2', sizes: { XS: 1, S: 3, M: 3, L: 1, XL: 0 } }
  ]);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  // Load existing categories & product if edit
  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.from(new Set([...defaultCategoriesList, ...data])));
      }
    } catch (err) {
      console.warn('Usando categorías por defecto');
    }
  };

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        const basePrice = data.compareAtPrice || data.price;
        setFormData({
          name: data.name || '',
          sku: data.sku || '',
          description: data.description || '',
          originalPrice: basePrice || '',
          price: data.price || '',
          compareAtPrice: data.compareAtPrice || '',
          isPromo: Boolean(data.isPromo),
          discountPercent: data.discountPercent || 0,
          promoBadge: data.promoBadge || 'SALE 20% OFF',
          isFeatured: Boolean(data.isFeatured),
          category: data.category || 'Tops',
          status: data.status || 'Activo',
          images: data.images || []
        });
        if (data.inventory && data.inventory.length > 0) {
          setInventory(data.inventory);
        }
      }
    } catch (err) {
      setFeedback({ error: 'No se pudo cargar la información del producto.', success: '' });
    }
  };

  // Recalculate price when promo or discount changes
  const handlePriceChange = (e) => {
    const orig = Number(e.target.value) || 0;
    setFormData((prev) => {
      let finalPrice = orig;
      let compareAt = null;
      if (prev.isPromo && prev.discountPercent > 0) {
        finalPrice = Math.round(orig * (1 - prev.discountPercent / 100));
        compareAt = orig;
      }
      return {
        ...prev,
        originalPrice: e.target.value,
        price: finalPrice,
        compareAtPrice: compareAt
      };
    });
  };

  const handlePromoToggle = (e) => {
    const isPromoActive = e.target.checked;
    setFormData((prev) => {
      const orig = Number(prev.originalPrice) || Number(prev.price) || 0;
      const defaultPercent = prev.discountPercent > 0 ? prev.discountPercent : 20;
      let finalPrice = orig;
      let compareAt = null;

      if (isPromoActive) {
        finalPrice = Math.round(orig * (1 - defaultPercent / 100));
        compareAt = orig;
      }

      return {
        ...prev,
        isPromo: isPromoActive,
        discountPercent: isPromoActive ? defaultPercent : 0,
        promoBadge: isPromoActive ? `${defaultPercent}% OFF` : '',
        price: isPromoActive ? finalPrice : orig,
        compareAtPrice: isPromoActive ? compareAt : null
      };
    });
  };

  const handleDiscountPercentChange = (percent) => {
    const numPercent = Math.max(0, Math.min(99, Number(percent) || 0));
    setFormData((prev) => {
      const orig = Number(prev.originalPrice) || Number(prev.price) || 0;
      let finalPrice = orig;
      let compareAt = null;

      if (prev.isPromo && numPercent > 0) {
        finalPrice = Math.round(orig * (1 - numPercent / 100));
        compareAt = orig;
      } else {
        finalPrice = orig;
      }

      // Check if user previously had a custom prefix like 'SALE'
      let badgeText = numPercent > 0 ? `${numPercent}% OFF` : '';
      if (prev.promoBadge?.startsWith('SALE') && numPercent > 0) {
        badgeText = `SALE ${numPercent}% OFF`;
      } else if (prev.promoBadge?.startsWith('PROMO') && numPercent > 0) {
        badgeText = `PROMO ${numPercent}% OFF`;
      }

      return {
        ...prev,
        discountPercent: numPercent,
        price: finalPrice,
        compareAtPrice: prev.isPromo && numPercent > 0 ? compareAt : null,
        promoBadge: badgeText
      };
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Custom Category
  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    if (!categories.includes(cat)) {
      setCategories([...categories, cat]);
    }
    setFormData({ ...formData, category: cat });
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  // File Upload via Local Computer (FileReader)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`El archivo ${file.name} no es una imagen válida.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target.result;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64Url]
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add Image URL
  const handleAddImage = (url) => {
    const targetUrl = url || newImageUrl;
    if (!targetUrl.trim()) return;
    if (formData.images.includes(targetUrl.trim())) return;

    setFormData({
      ...formData,
      images: [...formData.images, targetUrl.trim()]
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (imgIdx) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, idx) => idx !== imgIdx)
    });
  };

  // Matrix management
  const handleAddColorRow = () => {
    setInventory([
      ...inventory,
      { color: 'Nuevo Color', hex: '#BF775D', sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 } }
    ]);
  };

  const handleRemoveColorRow = (index) => {
    if (inventory.length <= 1) {
      alert('Debes mantener al menos una variante de color en el producto.');
      return;
    }
    setInventory(inventory.filter((_, i) => i !== index));
  };

  const handleInventoryChange = (colorIndex, field, value) => {
    const updated = [...inventory];
    if (SIZES.includes(field)) {
      updated[colorIndex].sizes[field] = Math.max(0, parseInt(value) || 0);
    } else {
      updated[colorIndex][field] = value;
    }
    setInventory(updated);
  };

  const [quickQuantity, setQuickQuantity] = useState(5);

  // Quick Stock Helpers
  const handleApplyQuickQuantityToAll = (qty) => {
    const num = Math.max(0, parseInt(qty) || 0);
    const updated = inventory.map((inv) => ({
      ...inv,
      sizes: SIZES.reduce((acc, size) => ({ ...acc, [size]: num }), {})
    }));
    setInventory(updated);
  };

  const handleApplyQuickQuantityToColor = (colorIdx, qty) => {
    const num = Math.max(0, parseInt(qty) || 0);
    const updated = [...inventory];
    updated[colorIdx].sizes = SIZES.reduce((acc, size) => ({ ...acc, [size]: num }), {});
    setInventory(updated);
  };

  const totalMatrixStock = inventory.reduce((sum, item) => {
    return sum + SIZES.reduce((sSum, size) => sSum + (item.sizes?.[size] || 0), 0);
  }, 0);

  // Submit Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });

    const finalSellPrice = Number(formData.price) || Number(formData.originalPrice);

    if (!formData.name.trim() || !formData.sku.trim() || !finalSellPrice) {
      setFeedback({ error: 'Nombre, SKU y Precio son campos obligatorios.', success: '' });
      return;
    }

    if (formData.images.length === 0) {
      if (!window.confirm('No has añadido ninguna foto al producto. ¿Deseas guardarlo de todos modos?')) {
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description,
      price: finalSellPrice,
      compareAtPrice: formData.isPromo ? Number(formData.originalPrice) : null,
      isPromo: Boolean(formData.isPromo),
      discountPercent: formData.isPromo ? Number(formData.discountPercent) : 0,
      promoBadge: formData.isPromo ? formData.promoBadge : '',
      isFeatured: Boolean(formData.isFeatured),
      category: formData.category,
      status: formData.status,
      images: formData.images,
      inventory
    };

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/products/${id}`
        : 'http://localhost:5000/api/products';

      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setFeedback({ 
          error: 'Tu sesión de administrador ha expirado o no es válida. Redirigiendo al login para renovar tu acceso...', 
          success: '' 
        });
        setTimeout(() => {
          localStorage.removeItem('adminInfo');
          navigate('/admin/login');
        }, 1500);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          error: '',
          success: `¡Producto ${isEditMode ? 'actualizado' : 'creado'} exitosamente!`
        });
        setTimeout(() => {
          navigate('/admin/stock');
        }, 900);
      } else {
        setFeedback({ error: data.message || 'Error al guardar el producto.', success: '' });
      }
    } catch (err) {
      setFeedback({ error: 'Error de conexión con el servidor de Atelier.', success: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/admin/stock')} style={styles.backBtn}>
          <FiArrowLeft size={16} />
          <span>Volver al Inventario</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary"
          style={styles.saveBtn}
        >
          <FiSave size={16} />
          <span>{isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Producto' : 'Guardar Producto'}</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {feedback.error && (
        <div style={styles.alertError}>
          <FiAlertCircle size={18} />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback.success && (
        <div style={styles.alertSuccess}>
          <FiCheck size={18} />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.formGrid}>
        {/* Left Primary Column */}
        <div style={styles.leftCol}>
          {/* Card 1: Información Esencial */}
          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>Detalles Esenciales</h3>
            <p style={styles.cardSubtitle}>Información general y comercial de la prenda.</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre de la Prenda *</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Ej. Vestido Midi Satén Vainilla"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={styles.row2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>SKU / Código de Identificación *</label>
                <input
                  type="text"
                  name="sku"
                  className="input-field"
                  placeholder="VES-VAIN-01"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Precio Base de Lista ($ ARS) *</label>
                <input
                  type="number"
                  name="originalPrice"
                  min="0"
                  className="input-field"
                  placeholder="55000"
                  value={formData.originalPrice || formData.price}
                  onChange={handlePriceChange}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descripción Editorial & Calce</label>
              <textarea
                name="description"
                className="input-field"
                rows="4"
                placeholder="Describe la composición textil, caída, detalles de terminación y ocasión de uso..."
                value={formData.description}
                onChange={handleInputChange}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Card 2: Apartado de Promociones & Descuentos Especiales */}
          <div className="card" style={{ ...styles.card, border: formData.isPromo ? '1px solid var(--color-accent-secondary)' : '1px solid rgba(125, 110, 101, 0.08)' }}>
            <div style={styles.promoHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiTag size={20} style={{ color: formData.isPromo ? 'var(--color-accent-alert)' : 'var(--color-text-muted)' }} />
                <div>
                  <h3 style={styles.cardTitle}>Promoción & Descuento Especial</h3>
                  <p style={styles.cardSubtitle}>Activa ofertas especiales, precios tachados y badges promocionales.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label style={styles.switchWrapper}>
                <input
                  type="checkbox"
                  checked={formData.isPromo}
                  onChange={handlePromoToggle}
                  style={styles.switchInput}
                />
                <span style={{ ...styles.switchSlider, ...(formData.isPromo ? styles.switchSliderActive : {}) }}>
                  <span style={{ ...styles.switchKnob, ...(formData.isPromo ? styles.switchKnobActive : {}) }} />
                </span>
                <strong style={{ fontSize: '13px', color: formData.isPromo ? 'var(--color-accent-alert)' : 'var(--color-text-muted)' }}>
                  {formData.isPromo ? 'PROMO ACTIVA' : 'Desactivado'}
                </strong>
              </label>
            </div>

            {formData.isPromo && (
              <div style={styles.promoBody}>
                <div style={styles.row2}>
                  {/* Discount percentage presets */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>% Porcentaje de Descuento</label>
                    <div style={styles.discountInputGroup}>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        className="input-field"
                        placeholder="20"
                        value={formData.discountPercent || ''}
                        onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      />
                      <span style={styles.percentSymbol}>%</span>
                    </div>

                    {/* Quick discount chips */}
                    <div style={styles.quickPercents}>
                      {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleDiscountPercentChange(pct)}
                          style={{
                            ...styles.pctChip,
                            ...(formData.discountPercent === pct ? styles.pctChipActive : {})
                          }}
                        >
                          {pct}% OFF
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo Badge text */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Etiqueta / Badge Promocional</label>
                    <input
                      type="text"
                      name="promoBadge"
                      className="input-field"
                      placeholder="Ej: SALE 20% OFF, SPECIAL PRICE"
                      value={formData.promoBadge}
                      onChange={handleInputChange}
                    />
                    <div style={styles.quickBadges}>
                      {[`${formData.discountPercent || 20}% OFF`, `SALE ${formData.discountPercent || 20}% OFF`, `PROMO ${formData.discountPercent || 20}% OFF`, 'SPECIAL PRICE', 'FLASH SALE', 'LIQUIDACIÓN'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, promoBadge: b })}
                          style={{
                            ...styles.badgeChip,
                            ...(formData.promoBadge === b ? { backgroundColor: 'var(--color-text-main)', color: 'white', borderColor: 'var(--color-text-main)' } : {})
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Promo Price Calculator */}
                <div style={styles.priceCalculationBox}>
                  <div style={styles.calcRow}>
                    <span>Precio de Lista Original:</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                      ${Number(formData.originalPrice || formData.price || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div style={styles.calcRow}>
                    <span>Descuento Aplicado ({formData.discountPercent}%):</span>
                    <span style={{ color: 'var(--color-accent-alert)', fontWeight: '600' }}>
                      -${Math.round((Number(formData.originalPrice || formData.price || 0) * (formData.discountPercent / 100))).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div style={styles.finalCalcRow}>
                    <span>Precio Final de Venta en Tienda:</span>
                    <strong style={{ fontSize: '20px', color: 'var(--color-accent-alert)' }}>
                      ${Number(formData.price || 0).toLocaleString('es-AR')}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Matriz de Inventario Dinámica */}
          <div className="card" style={styles.card}>
            <div style={styles.matrixHeaderRow}>
              <div>
                <h3 style={styles.cardTitle}>Control de Stock & Matriz de Inventario</h3>
                <p style={styles.cardSubtitle}>
                  Ingresa las cantidades disponibles por color y talle para actualizar el stock que se publicará.
                </p>
              </div>
              <div style={styles.totalStockBadgeBig}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stock Total:</span>
                <strong style={{ fontSize: '18px', color: totalMatrixStock === 0 ? '#6B7280' : totalMatrixStock < 5 ? 'var(--color-accent-alert)' : 'var(--color-text-main)' }}>
                  {totalMatrixStock} {totalMatrixStock === 1 ? 'unidad' : 'unidades'}
                </strong>
              </div>
            </div>

            {/* Quick Quantity Distributor Bar */}
            <div style={styles.quickDistributorBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-main)' }}>
                  ⚡ Carga Rápida de Cantidad:
                </span>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  style={{ width: '70px', padding: '6px 8px', textAlign: 'center', fontWeight: '700' }}
                  value={quickQuantity}
                  onChange={(e) => setQuickQuantity(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleApplyQuickQuantityToAll(quickQuantity)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Asignar a todos los talles
                </button>
              </div>

              {/* Fast Presets */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Preajustes:</span>
                {[0, 2, 5, 10, 20].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => {
                      setQuickQuantity(qty);
                      handleApplyQuickQuantityToAll(qty);
                    }}
                    style={styles.presetQtyBtn}
                  >
                    {qty === 0 ? 'Vaciar (0)' : `${qty} c/u`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddColorRow}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', marginLeft: 'auto' }}
                >
                  <FiPlus size={14} />
                  <span>+ Agregar Color</span>
                </button>
              </div>
            </div>

            <div style={styles.tableResponsive}>
              <table style={styles.matrixTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.matrixTh, textAlign: 'left', width: '220px' }}>Color & Muestra</th>
                    {SIZES.map((size) => (
                      <th key={size} style={styles.matrixTh}>{size}</th>
                    ))}
                    <th style={{ ...styles.matrixTh, width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((row, index) => (
                    <tr key={index}>
                      <td style={styles.matrixTd}>
                        <div style={styles.colorInputGroup}>
                          <input
                            type="color"
                            value={row.hex || '#000000'}
                            onChange={(e) => handleInventoryChange(index, 'hex', e.target.value)}
                            style={styles.colorPicker}
                            title="Seleccionar color cromático"
                          />
                          <input
                            type="text"
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                            placeholder="Nombre Color"
                            value={row.color}
                            onChange={(e) => handleInventoryChange(index, 'color', e.target.value)}
                          />
                        </div>
                      </td>

                      {SIZES.map((size) => (
                        <td key={size} style={styles.matrixTd}>
                          <input
                            type="number"
                            min="0"
                            className="input-field"
                            style={styles.sizeInputCell}
                            value={row.sizes?.[size] ?? 0}
                            onChange={(e) => handleInventoryChange(index, size, e.target.value)}
                          />
                        </td>
                      ))}

                      <td style={styles.matrixTd}>
                        <button
                          type="button"
                          onClick={() => handleRemoveColorRow(index)}
                          style={styles.deleteRowBtn}
                          title="Eliminar este color"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Fotografía Editorial & Carga de Fotos */}
          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>Fotografía Editorial (Carga de Fotos)</h3>
            <p style={styles.cardSubtitle}>
              Sube fotos desde tu computadora (JPG, PNG, WebP) o ingresa URLs directas. Proporción recomendada: 3:4 vertical.
            </p>

            {/* Drag & Drop / File Input Zone */}
            <div
              style={styles.dropZone}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <FiUploadCloud size={38} style={{ color: 'var(--color-accent-secondary)', marginBottom: '10px' }} />
              <strong style={{ fontSize: '15px', color: 'var(--color-text-main)' }}>
                Haz clic aquí para seleccionar fotos desde tu computadora
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Puedes seleccionar una o múltiples imágenes a la vez.
              </p>
            </div>

            {/* Direct URL input */}
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>O pegar enlace URL de imagen:</label>
              <div style={styles.addImageInputRow}>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleAddImage(newImageUrl)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  + Añadir URL
                </button>
              </div>
            </div>

            {/* Presets */}
            <div style={styles.presetSection}>
              <span style={styles.presetLabel}>O elegir fotos de muestra editorial:</span>
              <div style={styles.presetsList}>
                {sampleImagePresets.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    onClick={() => handleAddImage(preset)}
                    style={styles.presetThumb}
                    title="Click para añadir"
                  />
                ))}
              </div>
            </div>

            {/* Images Preview Grid */}
            {formData.images.length > 0 && (
              <div style={styles.galleryGrid}>
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} style={styles.galleryItem}>
                    <img src={imgUrl} alt={`Foto ${idx + 1}`} style={styles.galleryImg} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={styles.removeImgBtn}
                      title="Eliminar foto"
                    >
                      <FiTrash2 size={14} />
                    </button>
                    {idx === 0 && <span style={styles.coverBadge}>PORTADA</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Secondary Column (Categorías & Publicación) */}
        <div style={styles.rightCol}>
          {/* Card: Categoría Dinámica */}
          <div className="card" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ ...styles.cardTitle, fontSize: '18px' }}>Categoría</h3>
              <button
                type="button"
                onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                style={styles.addCategoryBtn}
              >
                <FiPlus size={13} />
                <span>+ Nueva Categoría</span>
              </button>
            </div>

            {/* Dynamic Category Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Seleccionar Categoría</label>
              <select
                name="category"
                className="input-field"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Inline New Category Creator */}
            {isAddingNewCategory && (
              <div style={styles.newCategoryBox}>
                <label style={styles.label}>Nombre de la Nueva Categoría:</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. Vestidos, Calzado, Accesorios"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    Crear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card: Estado de Publicación */}
          <div className="card" style={styles.card}>
            <h3 style={{ ...styles.cardTitle, fontSize: '18px', marginBottom: '14px' }}>Estado & Destacados</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Visibilidad en Tienda</label>
              <select
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Activo">Activo (Visible para clientes)</option>
                <option value="Borrador">Borrador (Oculto en tienda)</option>
              </select>
            </div>

            {/* Featured in Home Switch */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-surface-soft)' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-main)', display: 'block' }}>
                    Destacar en Inicio (Home)
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Aparecerá en los lanzamientos del Home
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-text-main)', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Card: Resumen Rápido de Prenda */}
          <div className="card" style={{ ...styles.card, backgroundColor: 'var(--color-bg-base)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', marginBottom: '8px' }}>
              Resumen de Prenda
            </h4>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--color-text-muted)' }}>
              <div>Fotos cargadas: <strong>{formData.images.length}</strong></div>
              <div>Colores disponibles: <strong>{inventory.length}</strong></div>
              <div>Stock total: <strong>{totalMatrixStock} unid.</strong></div>
              <div>
                Precio final: <strong style={{ color: formData.isPromo ? 'var(--color-accent-alert)' : 'var(--color-text-main)' }}>
                  ${Number(formData.price || formData.originalPrice || 0).toLocaleString('es-AR')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    paddingBottom: '80px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    fontWeight: '600'
  },
  saveBtn: {
    padding: '12px 28px'
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FDE8E8',
    color: 'var(--color-accent-alert)',
    padding: '14px 20px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#EDF7ED',
    color: '#1E4620',
    padding: '14px 20px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '28px',
    alignItems: 'start'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  card: {
    padding: '28px'
  },
  cardTitle: {
    fontSize: '20px',
    margin: 0
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  promoHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  switchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  switchInput: {
    display: 'none'
  },
  switchSlider: {
    width: '44px',
    height: '24px',
    backgroundColor: '#E5E7EB',
    borderRadius: '12px',
    position: 'relative',
    transition: 'background-color 0.2s ease',
    display: 'inline-block'
  },
  switchSliderActive: {
    backgroundColor: 'var(--color-accent-alert)'
  },
  switchKnob: {
    width: '18px',
    height: '18px',
    backgroundColor: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '3px',
    left: '3px',
    transition: 'transform 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  switchKnobActive: {
    transform: 'translateX(20px)'
  },
  promoBody: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    marginTop: '10px'
  },
  discountInputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  percentSymbol: {
    position: 'absolute',
    right: '14px',
    fontWeight: '700',
    color: 'var(--color-text-muted)'
  },
  quickPercents: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },
  pctChip: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    color: 'var(--color-text-main)',
    cursor: 'pointer'
  },
  pctChipActive: {
    backgroundColor: 'var(--color-accent-alert)',
    color: 'white',
    borderColor: 'var(--color-accent-alert)'
  },
  quickBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },
  badgeChip: {
    padding: '3px 8px',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '3px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer'
  },
  priceCalculationBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  finalCalcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--color-surface-soft)',
    fontSize: '14px',
    fontWeight: '700'
  },
  matrixHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  tableResponsive: {
    overflowX: 'auto',
    border: '1px solid var(--color-surface-soft)',
    borderRadius: 'var(--radius-sm)'
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  matrixTh: {
    padding: '12px',
    backgroundColor: 'var(--color-bg-base)',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  matrixTd: {
    padding: '10px',
    borderBottom: '1px solid var(--color-surface-soft)',
    verticalAlign: 'middle'
  },
  colorInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  colorPicker: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  sizeInputCell: {
    width: '56px',
    padding: '6px',
    textAlign: 'center',
    fontWeight: '600',
    margin: '0 auto',
    display: 'block'
  },
  deleteRowBtn: {
    color: 'var(--color-accent-alert)',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  dropZone: {
    border: '2px dashed var(--color-accent-secondary)',
    borderRadius: 'var(--radius-md)',
    padding: '36px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--color-bg-base)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },
  addImageInputRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px'
  },
  presetSection: {
    marginTop: '16px'
  },
  presetLabel: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    display: 'block',
    marginBottom: '8px'
  },
  presetsList: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '6px'
  },
  presetThumb: {
    width: '50px',
    height: '66px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-xs)',
    cursor: 'pointer',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    transition: 'transform 0.15s ease'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '14px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid var(--color-surface-soft)'
  },
  galleryItem: {
    position: 'relative',
    aspectRatio: '3/4',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    border: '1px solid rgba(125, 110, 101, 0.15)'
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeImgBtn: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    backgroundColor: 'rgba(56, 41, 35, 0.75)',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coverBadge: {
    position: 'absolute',
    bottom: '6px',
    left: '6px',
    backgroundColor: 'var(--color-text-main)',
    color: 'white',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  addCategoryBtn: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-accent-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer'
  },
  newCategoryBox: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    marginTop: '10px'
  },
  totalStockBadgeBig: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    border: '1px solid rgba(125, 110, 101, 0.12)'
  },
  quickDistributorBox: {
    backgroundColor: 'var(--color-surface-soft)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  presetQtyBtn: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--color-text-main)',
    cursor: 'pointer'
  }
};

export default AdminNewProduct;
