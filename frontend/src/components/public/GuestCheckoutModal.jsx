import React, { useState, useEffect } from 'react';
import { 
  FiX, FiCheck, FiArrowRight, FiArrowLeft, FiCreditCard, 
  FiDollarSign, FiMessageCircle, FiTruck, FiMapPin, 
  FiAlertCircle, FiLock, FiShield 
} from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import useCustomerAuthStore from '../../store/customerAuthStore';

const GuestCheckoutModal = () => {
  const { isCheckoutOpen, closeCheckout, items, clearCart, getSubtotal, getShippingCost } = useCartStore();
  const loggedInCustomer = useCustomerAuthStore((state) => state.customer);

  const [step, setStep] = useState(1); // 1: Contact & Address, 2: Payment & Delivery, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stockValidation, setStockValidation] = useState({ valid: true, items: [] });
  const [completedOrder, setCompletedOrder] = useState(null);

  // Form State
  const [customer, setCustomer] = useState({
    name: loggedInCustomer?.name || '',
    email: loggedInCustomer?.email || '',
    phone: loggedInCustomer?.phone || '',
    dni: loggedInCustomer?.dni || '',
    street: loggedInCustomer?.address?.street || '',
    number: loggedInCustomer?.address?.number || '',
    zipCode: loggedInCustomer?.address?.zipCode || '',
    city: loggedInCustomer?.address?.city || '',
    province: loggedInCustomer?.address?.province || 'Buenos Aires'
  });

  // Sync if customer logs in
  useEffect(() => {
    if (loggedInCustomer) {
      setCustomer({
        name: loggedInCustomer.name || '',
        email: loggedInCustomer.email || '',
        phone: loggedInCustomer.phone || '',
        dni: loggedInCustomer.dni || '',
        street: loggedInCustomer.address?.street || '',
        number: loggedInCustomer.address?.number || '',
        zipCode: loggedInCustomer.address?.zipCode || '',
        city: loggedInCustomer.address?.city || '',
        province: loggedInCustomer.address?.province || 'Buenos Aires'
      });
    }
  }, [loggedInCustomer]);

  const [deliveryMethod, setDeliveryMethod] = useState('envio'); // 'envio' | 'retiro'
  const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // 'mercadopago' | 'transferencia' | 'whatsapp'

  // Validate stock on modal open
  useEffect(() => {
    if (isCheckoutOpen && items.length > 0) {
      validateRealtimeStock();
    }
  }, [isCheckoutOpen, items]);

  const validateRealtimeStock = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (res.ok) {
        setStockValidation(data);
        if (!data.valid) {
          setErrorMsg('Algunos artículos en tu bolsa tienen stock limitado o no están disponibles.');
        } else {
          setErrorMsg('');
        }
      }
    } catch (err) {
      console.error('Error validating stock:', err);
    }
  };

  if (!isCheckoutOpen) return null;

  const rawSubtotal = getSubtotal();
  const baseShipping = deliveryMethod === 'retiro' ? 0 : getShippingCost();
  
  // 10% discount if Bank Transfer
  const discount = (paymentMethod === 'transferencia') ? Math.round(rawSubtotal * 0.10) : 0;
  const finalTotal = rawSubtotal + baseShipping - discount;

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!customer.name.trim()) return 'Por favor ingresa tu nombre completo.';
    if (!customer.email.trim() || !customer.email.includes('@')) return 'Por favor ingresa un email válido para enviarte el comprobante.';
    if (!customer.phone.trim()) return 'Por favor ingresa tu número de WhatsApp / Teléfono.';
    if (!customer.dni.trim()) return 'Por favor ingresa tu DNI para la facturación y despacho.';
    if (deliveryMethod === 'envio') {
      if (!customer.street.trim() || !customer.number.trim()) return 'Por favor completa la calle y altura de entrega.';
      if (!customer.city.trim() || !customer.zipCode.trim()) return 'Por favor completa la ciudad y código postal.';
    }
    return '';
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const orderPayload = {
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        dni: customer.dni,
        address: deliveryMethod === 'retiro' ? {
          street: 'Boutique Atelier Recoleta',
          number: 'Av. Alvear 1750',
          city: 'Recoleta',
          province: 'CABA',
          zipCode: '1014'
        } : {
          street: customer.street,
          number: customer.number,
          zipCode: customer.zipCode,
          city: customer.city,
          province: customer.province
        }
      },
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryMethod,
      paymentMethod
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok) {
        setCompletedOrder(data);
        clearCart();
        setStep(3); // Go to success step
      } else {
        setErrorMsg(data.message || 'Error al procesar el pedido.');
      }
    } catch (err) {
      setErrorMsg('No se pudo conectar con el servidor para confirmar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (order) => {
    if (!order) return '#';
    const message = `¡Hola Atelier! Acabo de realizar el pedido #${order._id?.slice(-6).toUpperCase()} por un total de $${order.total?.toLocaleString('es-AR')}. Mi nombre es ${order.customer?.name} y elegí abonar mediante ${order.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : order.paymentMethod === 'whatsapp' ? 'Coordinación por WhatsApp' : 'Mercado Pago'}.`;
    return `https://wa.me/5491144556677?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="modal-backdrop">
      <div style={styles.modalCard}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.headerTitleGroup}>
            <span style={styles.brandTitle}>ATELIER CHECKOUT</span>
            <span style={styles.guestBadge}>COMPRA COMO INVITADO</span>
          </div>
          <button onClick={closeCheckout} style={styles.closeBtn} aria-label="Cerrar checkout">
            <FiX size={22} />
          </button>
        </div>

        {/* Step Wizard Indicator */}
        {step < 3 && (
          <div style={styles.stepsIndicator}>
            <div style={{ ...styles.stepItem, ...(step >= 1 ? styles.stepItemActive : {}) }}>
              <span style={styles.stepNumber}>1</span>
              <span style={styles.stepLabel}>Contacto & Envío</span>
            </div>
            <div style={styles.stepConnector} />
            <div style={{ ...styles.stepItem, ...(step >= 2 ? styles.stepItemActive : {}) }}>
              <span style={styles.stepNumber}>2</span>
              <span style={styles.stepLabel}>Pago & Confirmación</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div style={styles.alertError}>
            <FiAlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body: Split in 2 columns (Form + Sticky Order Summary) */}
        {step < 3 ? (
          <div style={styles.gridContainer}>
            {/* Form Column */}
            <div style={styles.formColumn}>
              {step === 1 && (
                <div style={styles.stepContent}>
                  <h3 style={styles.sectionTitle}>1. Datos de Contacto y Facturación</h3>
                  <p style={styles.sectionSubtitle}>No necesitas contraseña. Te enviaremos el comprobante a tu email.</p>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre y Apellido Completo *</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Ej. Sofía Martínez"
                      value={customer.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div style={styles.row2}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Correo Electrónico *</label>
                      <input
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="sofia@ejemplo.com"
                        value={customer.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>WhatsApp / Celular *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="input-field"
                        placeholder="+54 9 11 5566-7788"
                        value={customer.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>DNI / CUIT (Facturación y Despacho) *</label>
                    <input
                      type="text"
                      name="dni"
                      className="input-field"
                      placeholder="38.555.999"
                      value={customer.dni}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Delivery Selection */}
                  <h3 style={{ ...styles.sectionTitle, marginTop: '28px' }}>Método de Entrega</h3>
                  <div style={styles.deliveryOptions}>
                    <label style={{ ...styles.optionCard, ...(deliveryMethod === 'envio' ? styles.optionCardActive : {}) }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="envio"
                        checked={deliveryMethod === 'envio'}
                        onChange={() => setDeliveryMethod('envio')}
                        style={{ display: 'none' }}
                      />
                      <div style={styles.optionHeader}>
                        <FiTruck size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                        <strong>Envío a Domicilio</strong>
                      </div>
                      <span style={styles.optionDesc}>
                        {rawSubtotal >= 50000 ? '¡Envío Gratis!' : 'Costo: $3.500 a todo el país'}
                      </span>
                    </label>

                    <label style={{ ...styles.optionCard, ...(deliveryMethod === 'retiro' ? styles.optionCardActive : {}) }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="retiro"
                        checked={deliveryMethod === 'retiro'}
                        onChange={() => setDeliveryMethod('retiro')}
                        style={{ display: 'none' }}
                      />
                      <div style={styles.optionHeader}>
                        <FiMapPin size={20} style={{ color: 'var(--color-accent-sage)' }} />
                        <strong>Retiro en Boutique</strong>
                      </div>
                      <span style={styles.optionDesc}>Recoleta (Av. Alvear 1750) • Sin Cargo</span>
                    </label>
                  </div>

                  {/* Address fields if delivery is 'envio' */}
                  {deliveryMethod === 'envio' && (
                    <div style={styles.addressFields}>
                      <div style={styles.row2}>
                        <div style={{ ...styles.formGroup, flex: 2 }}>
                          <label style={styles.label}>Calle *</label>
                          <input
                            type="text"
                            name="street"
                            className="input-field"
                            placeholder="Av. Santa Fe"
                            value={customer.street}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div style={{ ...styles.formGroup, flex: 1 }}>
                          <label style={styles.label}>Altura *</label>
                          <input
                            type="text"
                            name="number"
                            className="input-field"
                            placeholder="2140, Piso 4B"
                            value={customer.number}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div style={styles.row3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Código Postal *</label>
                          <input
                            type="text"
                            name="zipCode"
                            className="input-field"
                            placeholder="1425"
                            value={customer.zipCode}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Ciudad / Localidad *</label>
                          <input
                            type="text"
                            name="city"
                            className="input-field"
                            placeholder="Palermo / CABA"
                            value={customer.city}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Provincia *</label>
                          <select
                            name="province"
                            className="input-field"
                            value={customer.province}
                            onChange={handleInputChange}
                          >
                            <option>CABA</option>
                            <option>Buenos Aires</option>
                            <option>Córdoba</option>
                            <option>Santa Fe</option>
                            <option>Mendoza</option>
                            <option>Entre Ríos</option>
                            <option>Otras Provincias</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={styles.stepActions}>
                    <button onClick={handleNextStep} className="btn-accent" style={styles.nextBtn}>
                      <span>Continuar al Pago</span>
                      <FiArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={styles.stepContent}>
                  <h3 style={styles.sectionTitle}>2. Selecciona tu Método de Pago</h3>
                  <p style={styles.sectionSubtitle}>Transacciones seguras y encriptadas con los estándares de la industria.</p>

                  <div style={styles.paymentOptionsList}>
                    {/* Option 1: Mercado Pago */}
                    <label style={{ ...styles.paymentCard, ...(paymentMethod === 'mercadopago' ? styles.paymentCardActive : {}) }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={() => setPaymentMethod('mercadopago')}
                        style={{ display: 'none' }}
                      />
                      <div style={styles.paymentCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FiCreditCard size={22} style={{ color: 'var(--color-text-main)' }} />
                          <div>
                            <strong>Mercado Pago / Tarjeta de Crédito y Débito</strong>
                            <p style={styles.paymentSubtext}>Hasta 3 cuotas sin interés con todas las tarjetas bancarias.</p>
                          </div>
                        </div>
                        {paymentMethod === 'mercadopago' && <FiCheck style={styles.checkIcon} />}
                      </div>
                    </label>

                    {/* Option 2: Transferencia Bancaria (-10% OFF) */}
                    <label style={{ ...styles.paymentCard, ...(paymentMethod === 'transferencia' ? styles.paymentCardActive : {}) }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transferencia"
                        checked={paymentMethod === 'transferencia'}
                        onChange={() => setPaymentMethod('transferencia')}
                        style={{ display: 'none' }}
                      />
                      <div style={styles.paymentCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FiDollarSign size={22} style={{ color: 'var(--color-accent-alert)' }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong>Transferencia Bancaria Directa</strong>
                              <span style={styles.discountBadge}>10% OFF</span>
                            </div>
                            <p style={styles.paymentSubtext}>Ahorras ${Math.round(rawSubtotal * 0.10).toLocaleString('es-AR')}. Te facilitamos el CBU al confirmar.</p>
                          </div>
                        </div>
                        {paymentMethod === 'transferencia' && <FiCheck style={styles.checkIcon} />}
                      </div>
                    </label>

                    {/* Option 3: WhatsApp Checkout */}
                    <label style={{ ...styles.paymentCard, ...(paymentMethod === 'whatsapp' ? styles.paymentCardActive : {}) }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        style={{ display: 'none' }}
                      />
                      <div style={styles.paymentCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FiMessageCircle size={22} style={{ color: '#25D366' }} />
                          <div>
                            <strong>Coordinar y Pagar por WhatsApp</strong>
                            <p style={styles.paymentSubtext}>Atención personalizada con una asesora de la boutique.</p>
                          </div>
                        </div>
                        {paymentMethod === 'whatsapp' && <FiCheck style={styles.checkIcon} />}
                      </div>
                    </label>
                  </div>

                  <div style={styles.securityBadge}>
                    <FiShield size={18} style={{ color: 'var(--color-accent-secondary)' }} />
                    <span>Tu compra está protegida con garantía oficial de cambio y devolución Atelier.</span>
                  </div>

                  <div style={styles.stepActions}>
                    <button onClick={() => setStep(1)} style={styles.backBtn}>
                      <FiArrowLeft size={16} />
                      <span>Modificar Datos de Envío</span>
                    </button>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || !stockValidation.valid}
                      className="btn-accent"
                      style={styles.submitBtn}
                    >
                      {isSubmitting ? 'Procesando Pedido...' : `Confirmar Compra • $${finalTotal.toLocaleString('es-AR')}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sticky Column */}
            <div style={styles.summaryColumn}>
              <h4 style={styles.summaryTitle}>Resumen del Pedido ({items.length})</h4>

              <div style={styles.itemsScroll}>
                {items.map((item, idx) => (
                  <div key={idx} style={styles.summaryItem}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80'}
                      alt={item.name}
                      style={styles.summaryThumb}
                    />
                    <div style={styles.summaryItemInfo}>
                      <span style={styles.summaryItemName}>{item.name}</span>
                      <span style={styles.summaryItemMeta}>{item.color} | Talle {item.size} • Cant: {item.quantity}</span>
                      <span style={styles.summaryItemPrice}>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.breakdownBox}>
                <div style={styles.breakdownRow}>
                  <span>Subtotal</span>
                  <span>${rawSubtotal.toLocaleString('es-AR')}</span>
                </div>
                <div style={styles.breakdownRow}>
                  <span>Envío ({deliveryMethod === 'retiro' ? 'Retiro en Boutique' : 'A Domicilio'})</span>
                  <span style={{ color: baseShipping === 0 ? 'var(--color-accent-sage)' : 'var(--color-text-main)', fontWeight: '600' }}>
                    {baseShipping === 0 ? '¡GRATIS!' : `$${baseShipping.toLocaleString('es-AR')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div style={{ ...styles.breakdownRow, color: 'var(--color-accent-alert)' }}>
                    <span>Descuento Transferencia (10%)</span>
                    <span>-${discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div style={styles.finalTotalRow}>
                  <span>Total a Pagar</span>
                  <span style={styles.finalTotalValue}>${finalTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div style={styles.stockStatusNotice}>
                <FiLock size={14} />
                <span>Stock verificado en tiempo real con depósito central.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Step 3: Success Screen */
          <div style={styles.successContainer}>
            <div style={styles.successCheckCircle}>
              <FiCheck size={36} />
            </div>

            <h2 style={styles.successTitle}>¡Gracias por tu compra, {completedOrder?.customer?.name}!</h2>
            <p style={styles.successSubtitle}>
              Hemos recibido tu orden correctamente. Te enviamos un correo de confirmación a <strong>{completedOrder?.customer?.email}</strong>.
            </p>

            <div style={styles.orderBadgeCard}>
              <div style={styles.orderIdRow}>
                <span>Número de Pedido:</span>
                <strong style={styles.orderCode}>#{completedOrder?._id?.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={styles.orderIdRow}>
                <span>Total Abonado:</span>
                <strong style={{ fontSize: '18px', color: 'var(--color-text-main)' }}>
                  ${completedOrder?.total?.toLocaleString('es-AR')}
                </strong>
              </div>
              <div style={styles.orderIdRow}>
                <span>Método de Pago:</span>
                <span>{completedOrder?.paymentMethod === 'transferencia' ? 'Transferencia Bancaria (10% OFF)' : completedOrder?.paymentMethod === 'whatsapp' ? 'WhatsApp Boutique' : 'Mercado Pago / Tarjetas'}</span>
              </div>
            </div>

            <div style={styles.successActions}>
              <a
                href={getWhatsAppLink(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
                style={{ ...styles.waButton, backgroundColor: '#25D366' }}
              >
                <FiMessageCircle size={20} />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>

              <button onClick={closeCheckout} className="btn-secondary" style={{ padding: '14px 28px' }}>
                Volver a la Tienda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modalCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-lg)',
    animation: 'modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '20px 28px',
    borderBottom: '1px solid var(--color-surface-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-bg-base)'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  brandTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: 'var(--color-text-main)'
  },
  guestBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-accent-secondary)',
    border: '1px solid var(--color-accent-secondary)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-xs)',
    letterSpacing: '0.06em'
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepsIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 28px',
    backgroundColor: 'var(--color-surface-soft)',
    gap: '24px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    fontWeight: '500'
  },
  stepItemActive: {
    color: 'var(--color-text-main)',
    fontWeight: '700'
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid rgba(125, 110, 101, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px'
  },
  stepConnector: {
    width: '40px',
    height: '1px',
    backgroundColor: 'rgba(125, 110, 101, 0.25)'
  },
  alertError: {
    margin: '16px 28px 0 28px',
    padding: '12px 16px',
    backgroundColor: '#FDE8E8',
    color: 'var(--color-accent-alert)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '32px',
    padding: '28px'
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    marginBottom: '4px'
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  row2: {
    display: 'flex',
    gap: '14px'
  },
  row3: {
    display: 'flex',
    gap: '12px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  deliveryOptions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '20px'
  },
  optionCard: {
    padding: '14px',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--color-surface)'
  },
  optionCardActive: {
    borderColor: 'var(--color-text-main)',
    backgroundColor: 'var(--color-bg-base)',
    boxShadow: '0 2px 8px rgba(56, 41, 35, 0.08)'
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  optionDesc: {
    fontSize: '11px',
    color: 'var(--color-text-muted)'
  },
  addressFields: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '20px'
  },
  paymentOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '20px'
  },
  paymentCard: {
    padding: '16px',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--color-surface)'
  },
  paymentCardActive: {
    borderColor: 'var(--color-text-main)',
    backgroundColor: 'var(--color-bg-base)',
    boxShadow: '0 2px 10px rgba(56, 41, 35, 0.08)'
  },
  paymentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  paymentSubtext: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    marginTop: '2px'
  },
  discountBadge: {
    backgroundColor: 'var(--color-accent-alert)',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  checkIcon: {
    color: 'var(--color-text-main)',
    fontSize: '18px'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '24px'
  },
  stepActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '16px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-muted)'
  },
  nextBtn: {
    marginLeft: 'auto',
    padding: '14px 28px'
  },
  submitBtn: {
    padding: '16px 32px',
    fontSize: '15px'
  },
  summaryColumn: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content'
  },
  summaryTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    marginBottom: '16px'
  },
  itemsScroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '6px',
    marginBottom: '16px'
  },
  summaryItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  summaryThumb: {
    width: '46px',
    height: '58px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  summaryItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px'
  },
  summaryItemName: {
    fontWeight: '600'
  },
  summaryItemMeta: {
    color: 'var(--color-text-muted)',
    fontSize: '11px'
  },
  summaryItemPrice: {
    fontWeight: '700',
    marginTop: '2px'
  },
  breakdownBox: {
    borderTop: '1px solid rgba(125, 110, 101, 0.15)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  finalTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    paddingTop: '12px',
    borderTop: '1px solid rgba(125, 110, 101, 0.15)',
    color: 'var(--color-text-main)',
    marginTop: '4px'
  },
  finalTotalValue: {
    fontSize: '19px'
  },
  stockStatusNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--color-accent-sage)',
    marginTop: '16px'
  },
  successContainer: {
    padding: '48px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  successCheckCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-accent-sage)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(138, 154, 134, 0.25)'
  },
  successTitle: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  successSubtitle: {
    fontSize: '15px',
    color: 'var(--color-text-muted)',
    maxWidth: '540px',
    lineHeight: 1.6,
    marginBottom: '28px'
  },
  orderBadgeCard: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '20px 32px',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '32px',
    border: '1px solid rgba(125, 110, 101, 0.12)'
  },
  orderIdRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--color-text-muted)'
  },
  orderCode: {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: 'var(--color-text-main)'
  },
  successActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  waButton: {
    padding: '14px 28px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default GuestCheckoutModal;
