const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dni: { type: String, required: true },
    address: {
      street: String,
      number: String,
      zipCode: String,
      city: String,
      province: String
    }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // 'mercadopago', 'transferencia', 'whatsapp'
  deliveryMethod: { type: String, required: true }, // 'envio', 'retiro'
  status: { type: String, enum: ['Pendiente', 'Pagado', 'Enviado', 'Completado', 'Cancelado'], default: 'Pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
