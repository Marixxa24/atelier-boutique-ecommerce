import React, { useState } from 'react';
import { FiSave, FiCheck } from 'react-icons/fi';

const AdminSettings = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'ATELIER Boutique',
    whatsappNumber: '+54 9 11 4455-6677',
    freeShippingThreshold: '50000',
    flatShippingCost: '3500',
    transferDiscountPercent: '10',
    address: 'Av. Alvear 1750, Recoleta, Buenos Aires'
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>Configuración de Tienda</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Ajustes comerciales, promociones y datos de contacto de Atelier.
        </p>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#EDF7ED', color: '#1E4620', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <FiCheck size={18} />
          <span>Configuración guardada correctamente.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Nombre de Fantasía de la Tienda</label>
          <input
            type="text"
            name="storeName"
            className="input-field"
            value={settings.storeName}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Umbral de Envío Gratis ($ ARS)</label>
            <input
              type="number"
              name="freeShippingThreshold"
              className="input-field"
              value={settings.freeShippingThreshold}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Costo Fijo de Envío Estándar ($ ARS)</label>
            <input
              type="number"
              name="flatShippingCost"
              className="input-field"
              value={settings.flatShippingCost}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Descuento por Transferencia (%)</label>
            <input
              type="number"
              name="transferDiscountPercent"
              className="input-field"
              value={settings.transferDiscountPercent}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Número de WhatsApp para Pedidos</label>
            <input
              type="text"
              name="whatsappNumber"
              className="input-field"
              value={settings.whatsappNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Dirección de la Boutique / Retiro</label>
          <input
            type="text"
            name="address"
            className="input-field"
            value={settings.address}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '14px 28px', alignSelf: 'flex-start' }}>
          <FiSave size={16} />
          <span>Guardar Configuración</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
