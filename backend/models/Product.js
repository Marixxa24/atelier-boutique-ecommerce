const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  color: { type: String, required: true },
  hex: { type: String, default: '#382923' }, // e.g. #241E1C
  sizes: {
    XS: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 }
  }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true }, // Precio final de venta
  compareAtPrice: { type: Number }, // Precio original tachado (si hay promo)
  isPromo: { type: Boolean, default: false }, // Switch de promoción activa
  discountPercent: { type: Number, default: 0 }, // Porcentaje de descuento (ej: 20%)
  promoBadge: { type: String, default: '' }, // Texto del badge (ej: 'SALE 20% OFF', 'SPECIAL PRICE')
  isFeatured: { type: Boolean, default: false }, // Destacar en la página de inicio (Home)
  images: [{ type: String }], // URLs o Base64 Data URLs
  category: { type: String, required: true, default: 'Tops' },
  status: { type: String, enum: ['Activo', 'Borrador'], default: 'Activo' },
  inventory: [inventorySchema]
}, { timestamps: true });

// Helper virtual para calcular el stock total
productSchema.virtual('totalStock').get(function() {
  if (!this.inventory || this.inventory.length === 0) return 0;
  return this.inventory.reduce((total, item) => {
    const s = item.sizes || {};
    return total + (s.XS || 0) + (s.S || 0) + (s.M || 0) + (s.L || 0) + (s.XL || 0);
  }, 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
