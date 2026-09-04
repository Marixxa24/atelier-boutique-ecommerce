import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { FiUsers, FiMail, FiPhone, FiShoppingBag, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, google: 0, withOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.admin?.token);

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch registered customers
      let registeredList = [];
      try {
        const custRes = await fetch('http://localhost:5000/api/customers', { headers });
        if (custRes.ok) {
          registeredList = await custRes.json();
        }
      } catch (e) {}

      // 2. Fetch orders to merge guest customers
      let ordersList = [];
      try {
        const ordRes = await fetch('http://localhost:5000/api/orders', { headers });
        if (ordRes.ok) {
          ordersList = await ordRes.json();
        }
      } catch (e) {}

      const customerMap = new Map();

      // Put registered users first
      registeredList.forEach((c) => {
        customerMap.set(c.email.toLowerCase(), {
          _id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'No especificado',
          dni: c.dni || 'Sin DNI',
          isGoogle: Boolean(c.googleId),
          ordersCount: c.ordersCount || 0,
          totalSpent: c.totalSpent || 0,
          city: c.address?.city || 'No registrada',
          createdAt: c.createdAt
        });
      });

      // Merge order buyers
      ordersList.forEach((o) => {
        if (!o.customer || !o.customer.email) return;
        const key = o.customer.email.toLowerCase();
        if (customerMap.has(key)) {
          const item = customerMap.get(key);
          item.ordersCount = Math.max(item.ordersCount, 1);
          item.totalSpent += (o.total || 0);
          if (o.customer.phone && item.phone === 'No especificado') item.phone = o.customer.phone;
          if (o.customer.dni && item.dni === 'Sin DNI') item.dni = o.customer.dni;
          if (o.customer.address?.city && item.city === 'No registrada') item.city = o.customer.address.city;
        } else {
          customerMap.set(key, {
            _id: o._id,
            name: o.customer.name,
            email: o.customer.email,
            phone: o.customer.phone || 'No especificado',
            dni: o.customer.dni || 'Sin DNI',
            isGoogle: false,
            ordersCount: 1,
            totalSpent: o.total || 0,
            city: o.customer.address?.city || 'CABA',
            createdAt: o.createdAt
          });
        }
      });

      const finalArray = Array.from(customerMap.values());
      setCustomers(finalArray);

      setStats({
        total: finalArray.length,
        google: finalArray.filter(c => c.isGoogle).length,
        withOrders: finalArray.filter(c => c.ordersCount > 0).length
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>Usuarios & Cartera de Clientes</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Registro de usuarios logeados con Google, cuentas registradas y compradores de la tienda.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconWrapper}>
            <FiUsers size={22} style={{ color: 'var(--color-text-main)' }} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Clientes en Base de Datos</span>
            <strong style={styles.kpiValue}>{stats.total}</strong>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
            <FcGoogle size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Usuarios Logeados con Google</span>
            <strong style={{ ...styles.kpiValue, color: '#1D4ED8' }}>{stats.google}</strong>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#EDF7ED', color: '#1E4620' }}>
            <FiShoppingBag size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Clientes con Compras</span>
            <strong style={{ ...styles.kpiValue, color: '#1E4620' }}>{stats.withOrders}</strong>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-surface-soft)' }}>
              <th style={styles.th}>CLIENTE</th>
              <th style={styles.th}>TIPO DE ACCESO</th>
              <th style={styles.th}>CONTACTO</th>
              <th style={styles.th}>CIUDAD / ZONA</th>
              <th style={styles.th}>COMPRAS</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>TOTAL HISTÓRICO</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Cargando cartera de clientes...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Aún no hay clientes registrados.
                </td>
              </tr>
            ) : (
              customers.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-surface-soft)' }}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={styles.avatarMini}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>DNI: {c.dni}</div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    {c.isGoogle ? (
                      <span style={styles.googleBadge}>
                        <FcGoogle size={14} />
                        <span>Google OAuth</span>
                      </span>
                    ) : (
                      <span style={styles.emailBadge}>
                        <FiMail size={12} />
                        <span>Email / Contraseña</span>
                      </span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div style={{ fontSize: '13px' }}>{c.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{c.phone}</div>
                  </td>

                  <td style={styles.td}>{c.city}</td>

                  <td style={styles.td}>
                    <span style={styles.ordersBadge}>
                      {c.ordersCount} {c.ordersCount === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </td>

                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--color-text-main)' }}>
                      ${(c.totalSpent || 0).toLocaleString('es-AR')}
                    </strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginBottom: '28px'
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
    color: 'var(--color-text-main)'
  },
  th: {
    padding: '16px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  td: {
    padding: '16px 20px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  avatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-main)',
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: '11px',
    fontWeight: '600'
  },
  emailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-muted)',
    fontSize: '11px',
    fontWeight: '600'
  },
  ordersBadge: {
    padding: '3px 8px',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--color-surface-soft)',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default AdminCustomers;
