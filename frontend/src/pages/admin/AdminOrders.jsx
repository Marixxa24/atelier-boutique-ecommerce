import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { 
  FiSearch, FiShoppingBag, FiTruck, FiCheckCircle, 
  FiClock, FiXCircle, FiMessageCircle, FiChevronDown 
} from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);

  const token = useAuthStore((state) => state.admin?.token);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert('Error al actualizar estado del pedido.');
      }
    } catch (err) {
      alert('Error de conexión al actualizar estado.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.dni?.includes(searchTerm) ||
      o._id?.includes(searchTerm);

    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pagado':
        return { bg: '#EDF7ED', color: '#1E4620', label: 'Pagado' };
      case 'Enviado':
        return { bg: '#EBF5FF', color: '#1E429F', label: 'Enviado' };
      case 'Completado':
        return { bg: '#F3E8FF', color: '#6B21A8', label: 'Completado' };
      case 'Cancelado':
        return { bg: '#FDE8E8', color: '#9B1C1C', label: 'Cancelado' };
      default:
        return { bg: '#FEF08A', color: '#854D0E', label: 'Pendiente' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Pedidos</h1>
          <p style={styles.subtitle}>Supervisa las órdenes de compra entrantes y actualiza su estado de despacho.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por cliente, email, DNI o # Orden..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Enviado">Enviado</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Cargando pedidos...</p>
      ) : filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <FiShoppingBag size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
          <h3>No se encontraron pedidos</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Cuando los clientes compren en la tienda aparecerán aquí.</p>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const waCleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');

            return (
              <div key={order._id} className="card" style={styles.orderCard}>
                {/* Header Row */}
                <div style={styles.orderHeaderRow}>
                  <div>
                    <span style={styles.orderIdText}>ORDEN #{order._id?.slice(-8).toUpperCase()}</span>
                    <span style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div style={styles.statusDropdownContainer}>
                    <span style={{ ...styles.statusBadge, backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      style={styles.changeStatusSelect}
                    >
                      <option value="Pendiente">Cambiar a: Pendiente</option>
                      <option value="Pagado">Cambiar a: Pagado</option>
                      <option value="Enviado">Cambiar a: Enviado</option>
                      <option value="Completado">Cambiar a: Completado</option>
                      <option value="Cancelado">Cambiar a: Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Customer & Items Split */}
                <div style={styles.orderBodyGrid}>
                  {/* Customer Info */}
                  <div style={styles.customerBox}>
                    <h4 style={styles.boxTitle}>Datos del Comprador</h4>
                    <p style={styles.customerName}><strong>{order.customer?.name}</strong></p>
                    <p style={styles.customerMeta}>Email: {order.customer?.email}</p>
                    <p style={styles.customerMeta}>DNI: {order.customer?.dni}</p>
                    <p style={styles.customerMeta}>Tel/WhatsApp: {order.customer?.phone}</p>
                    
                    <div style={styles.deliveryBox}>
                      <strong>Dirección de Entrega:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                        {order.deliveryMethod === 'retiro' 
                          ? 'Retiro en Boutique Recoleta (Av. Alvear 1750)'
                          : `${order.customer?.address?.street} ${order.customer?.address?.number}, ${order.customer?.address?.city} (${order.customer?.address?.province})`
                        }
                      </p>
                    </div>

                    {waCleanPhone && (
                      <a
                        href={`https://wa.me/${waCleanPhone}?text=Hola%20${encodeURIComponent(order.customer?.name)}%2C%20te%20escribimos%20desde%20Atelier%20sobre%20tu%20pedido%20%23${order._id?.slice(-8).toUpperCase()}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.waContactBtn}
                      >
                        <FiMessageCircle size={16} />
                        <span>Abrir Chat de WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Items List */}
                  <div style={styles.itemsBox}>
                    <h4 style={styles.boxTitle}>Prendas Solicitadas ({order.items?.length})</h4>
                    <div style={styles.itemsScroll}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={styles.itemRow}>
                          <div style={styles.itemThumb}>
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.name} style={styles.itemImg} />
                            ) : (
                              <div style={styles.itemImgPlaceholder}>IMG</div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '14px' }}>{item.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Color: {item.color} • Talle: {item.size} • Cantidad: {item.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.orderTotals}>
                      <div style={styles.totalLine}>
                        <span>Subtotal:</span>
                        <span>${order.subtotal?.toLocaleString('es-AR')}</span>
                      </div>
                      <div style={styles.totalLine}>
                        <span>Envío:</span>
                        <span>{order.shippingCost === 0 ? 'Gratis' : `$${order.shippingCost?.toLocaleString('es-AR')}`}</span>
                      </div>
                      {order.discount > 0 && (
                        <div style={{ ...styles.totalLine, color: 'var(--color-accent-alert)' }}>
                          <span>Descuento Transferencia:</span>
                          <span>-${order.discount?.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                      <div style={styles.finalTotalLine}>
                        <span>Total del Pedido:</span>
                        <span>${order.total?.toLocaleString('es-AR')}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Método: <strong>{order.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : order.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Mercado Pago'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
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
  filters: {
    display: 'flex',
    gap: '12px'
  },
  select: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(125, 110, 101, 0.2)',
    backgroundColor: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-main)',
    outline: 'none',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderCard: {
    padding: '24px'
  },
  orderHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--color-surface-soft)',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  orderIdText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '15px',
    color: 'var(--color-text-main)',
    display: 'block'
  },
  orderDate: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  statusDropdownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 'var(--radius-xs)',
    fontSize: '12px',
    fontWeight: '700'
  },
  changeStatusSelect: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid rgba(125, 110, 101, 0.25)',
    backgroundColor: 'var(--color-surface)',
    outline: 'none',
    cursor: 'pointer'
  },
  orderBodyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: '32px'
  },
  customerBox: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '20px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  boxTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    marginBottom: '10px'
  },
  customerName: {
    fontSize: '15px',
    margin: 0
  },
  customerMeta: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    margin: 0
  },
  deliveryBox: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(125, 110, 101, 0.15)',
    fontSize: '13px'
  },
  waContactBtn: {
    marginTop: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#25D366',
    color: 'white',
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600'
  },
  itemsBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  itemsScroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    marginBottom: '16px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  itemThumb: {
    width: '42px',
    height: '52px',
    borderRadius: 'var(--radius-xs)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-surface-soft)'
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  itemImgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: 'var(--color-text-muted)'
  },
  orderTotals: {
    backgroundColor: 'var(--color-surface-soft)',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  finalTotalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--color-text-main)',
    borderTop: '1px solid rgba(125, 110, 101, 0.15)',
    paddingTop: '8px',
    marginTop: '4px'
  }
};

export default AdminOrders;
