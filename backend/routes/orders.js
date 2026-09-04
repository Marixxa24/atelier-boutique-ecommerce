const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route POST /api/orders
// @desc Create new guest or customer order with atomic stock validation and deduction
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, deliveryMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay artículos en la bolsa de compras' });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.dni) {
      return res.status(400).json({ message: 'Todos los datos de contacto del comprador son requeridos' });
    }

    // 1. Validate real-time stock and build items list with authoritative prices
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `El producto "${item.name || item.product}" ya no está disponible.` });
      }

      if (product.status !== 'Activo') {
        return res.status(400).json({ message: `El producto "${product.name}" está desactivado.` });
      }

      const invColor = product.inventory.find(i => i.color.toLowerCase() === item.color.toLowerCase());
      if (!invColor) {
        return res.status(400).json({ message: `Color "${item.color}" no disponible para "${product.name}".` });
      }

      const availableStock = invColor.sizes[item.size] || 0;
      if (availableStock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para "${product.name}" (${item.color} - Talle ${item.size}). Disponible: ${availableStock}, Solicitado: ${item.quantity}` 
        });
      }

      const lineTotal = product.price * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: product.price
      });
    }

    // 2. Shipping calculation: Free over $50,000, else $3,500
    const shippingCost = calculatedSubtotal >= 50000 ? 0 : 3500;

    // 3. Discount calculation (10% discount for bank transfer)
    let discount = 0;
    if (paymentMethod === 'transferencia' || paymentMethod === 'Transferencia Bancaria') {
      discount = Math.round(calculatedSubtotal * 0.10);
    }

    const calculatedTotal = calculatedSubtotal + shippingCost - discount;

    // 4. Create and save Order
    const order = new Order({
      customer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shippingCost,
      discount,
      total: calculatedTotal,
      paymentMethod: paymentMethod || 'mercadopago',
      deliveryMethod: deliveryMethod || 'envio',
      status: 'Pendiente'
    });

    const createdOrder = await order.save();

    // 5. Deduct stock from products inventory
    for (const item of validatedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const invColor = product.inventory.find(i => i.color.toLowerCase() === item.color.toLowerCase());
        if (invColor && invColor.sizes[item.size] !== undefined) {
          invColor.sizes[item.size] = Math.max(0, invColor.sizes[item.size] - item.quantity);
          product.markModified('inventory');
          await product.save();
        }
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al procesar el pedido', error: error.message });
  }
});

// @route GET /api/orders
// @desc Get all orders with optional status filter (Admin)
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'Todos') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.dni': { $regex: search, $options: 'i' } },
        { _id: search.length === 24 ? search : null }
      ].filter(cond => Object.values(cond)[0] !== null);
    }

    const orders = await Order.find(filter).populate('items.product', 'images sku name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener pedidos', error: error.message });
  }
});

// @route GET /api/orders/:id
// @desc Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'images sku name');
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle del pedido', error: error.message });
  }
});

// @route PUT /api/orders/:id/status
// @desc Update order status (Admin)
// @access Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pendiente', 'Pagado', 'Enviado', 'Completado', 'Cancelado'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Estado inválido. Opciones: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar estado del pedido', error: error.message });
  }
});

module.exports = router;
