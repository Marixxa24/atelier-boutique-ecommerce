import React, { useState } from 'react';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { FiX, FiMail, FiLock, FiUser, FiPhone, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const CustomerAuthModal = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, loginCustomer } = useCustomerAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const isLogin = authModalTab === 'login';
    const endpoint = isLogin ? 'http://localhost:5000/api/customers/login' : 'http://localhost:5000/api/customers/register';
    const payload = isLogin ? { email, password } : { name, email, password, phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(isLogin ? '¡Sesión iniciada con éxito!' : '¡Cuenta creada con éxito!');
        setTimeout(() => {
          loginCustomer(data);
          closeAuthModal();
        }, 600);
      } else {
        setErrorMessage(data.message || 'Error en la autenticación.');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor de Atelier.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Simulation / Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');

    // Prepopulate realistic user demo or prompt
    const googleUser = {
      name: name || 'Sofía Alvear',
      email: email || 'sofia.alvear@gmail.com',
      googleId: `google_oauth_${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };

    try {
      const res = await fetch('http://localhost:5000/api/customers/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('¡Ingresaste con Google exitosamente!');
        setTimeout(() => {
          loginCustomer(data);
          closeAuthModal();
        }, 600);
      } else {
        setErrorMessage(data.message || 'Error al autenticar con Google.');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al autenticar con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>MI CUENTA ATELIER</span>
            <h2 style={styles.title}>
              {authModalTab === 'login' ? 'Bienvenida de nuevo' : 'Crear tu Cuenta'}
            </h2>
            <p style={styles.subtitle}>
              {authModalTab === 'login'
                ? 'Accede a tus compras, seguimiento de envíos y promociones exclusivas.'
                : 'Únete para una experiencia de compra más ágil, segura y personalizada.'}
            </p>
          </div>
          <button onClick={closeAuthModal} style={styles.closeBtn} aria-label="Cerrar modal">
            <FiX size={22} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => {
              openAuthModal('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(authModalTab === 'login' ? styles.tabBtnActive : {})
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              openAuthModal('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(authModalTab === 'register' ? styles.tabBtnActive : {})
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div style={styles.alertError}>
            <FiAlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.alertSuccess}>
            <FiCheck size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={styles.body}>
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={styles.googleBtn}
          >
            <FcGoogle size={20} />
            <span>Continuar con Google</span>
          </button>

          <div style={styles.dividerRow}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>o con tu correo electrónico</span>
            <span style={styles.dividerLine} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={styles.form}>
            {authModalTab === 'register' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre Completo *</label>
                  <div style={styles.inputWithIcon}>
                    <FiUser style={styles.inputIcon} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. Sofía Alvear"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono / WhatsApp</label>
                  <div style={styles.inputWithIcon}>
                    <FiPhone style={styles.inputIcon} />
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+54 9 11 2345-6789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Correo Electrónico *</label>
              <div style={styles.inputWithIcon}>
                <FiMail style={styles.inputIcon} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña *</label>
              <div style={styles.inputWithIcon}>
                <FiLock style={styles.inputIcon} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '14px' }}
            >
              {isLoading
                ? 'Procesando...'
                : authModalTab === 'login'
                ? 'Entrar a Mi Cuenta'
                : 'Registrarme y Continuar'}
            </button>
          </form>

          {/* Security note */}
          <div style={styles.securityNote}>
            <span>🔒 Tus datos están protegidos con encriptación SSL de grado bancario.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '460px',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    animation: 'modalScaleUp 0.2s ease'
  },
  header: {
    padding: '24px 28px 16px 28px',
    backgroundColor: 'var(--color-bg-base)',
    borderBottom: '1px solid var(--color-surface-soft)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  badge: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.1em',
    color: 'var(--color-accent-secondary)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    margin: 0,
    fontWeight: '600'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    padding: '4px'
  },
  tabsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderBottom: '1px solid var(--color-surface-soft)'
  },
  tabBtn: {
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease'
  },
  tabBtnActive: {
    color: 'var(--color-text-main)',
    borderBottom: '2px solid var(--color-text-main)',
    backgroundColor: 'var(--color-surface-soft)'
  },
  body: {
    padding: '24px 28px 28px 28px'
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'all 0.15s ease',
    cursor: 'pointer'
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0 16px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(125, 110, 101, 0.15)'
  },
  dividerText: {
    padding: '0 10px',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--color-text-muted)',
    fontSize: '16px'
  },
  alertError: {
    margin: '16px 28px 0 28px',
    padding: '10px 14px',
    backgroundColor: '#FDE8E8',
    color: 'var(--color-accent-alert)',
    borderRadius: 'var(--radius-xs)',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  alertSuccess: {
    margin: '16px 28px 0 28px',
    padding: '10px 14px',
    backgroundColor: '#EDF7ED',
    color: '#1E4620',
    borderRadius: 'var(--radius-xs)',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  securityNote: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '11px',
    color: 'var(--color-text-muted)'
  }
};

export default CustomerAuthModal;
