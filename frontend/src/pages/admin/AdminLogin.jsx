import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FiLock, FiMail, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@atelier.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate('/admin/stock');
      } else {
        setError(data.message || 'Credenciales de acceso no válidas.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor de Atelier. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Centered Login Card */}
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <span style={styles.brandBadge}>PANEL DE CONTROL</span>
          <h1 style={styles.logo}>ATELIER ADMIN</h1>
          <p style={styles.subtitle}>Gestión interna de inventario, pedidos y catálogo de tienda.</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico Corporativo</label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.inputIcon} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="admin@atelier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña de Seguridad</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
            <FiArrowRight size={16} />
          </button>
        </form>

        <div style={styles.footerNote}>
          <p style={styles.hint}>
            Credenciales de prueba: <strong>admin@atelier.com</strong> / <strong>password123</strong>
          </p>
          <a href="/" style={styles.storeLink}>← Volver a la Tienda Pública</a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg-base)',
    padding: '24px'
  },
  loginCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '48px 40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '460px',
    border: '1px solid rgba(125, 110, 101, 0.12)',
    animation: 'modalScaleUp 0.35s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  brandBadge: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: 'var(--color-accent-secondary)',
    display: 'block',
    marginBottom: '8px'
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    letterSpacing: '4px',
    color: 'var(--color-text-main)',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginTop: '8px',
    lineHeight: 1.5
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FDE8E8',
    color: 'var(--color-accent-alert)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    marginBottom: '24px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--color-text-muted)',
    fontSize: '16px'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    color: 'var(--color-text-muted)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '10px',
    fontSize: '14px'
  },
  footerNote: {
    marginTop: '32px',
    textAlign: 'center',
    borderTop: '1px solid var(--color-surface-soft)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  hint: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    margin: 0
  },
  storeLink: {
    fontSize: '13px',
    color: 'var(--color-text-main)',
    fontWeight: '600'
  }
};

export default AdminLogin;
