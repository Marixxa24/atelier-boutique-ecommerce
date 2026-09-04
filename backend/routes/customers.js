const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const generateCustomerToken = (id) => {
  return jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '60d'
  });
};

// @route POST /api/customers/register
// @desc Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dni, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Ya existe una cuenta registrada con este email' });
    }

    const customer = new Customer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      dni: dni || '',
      address: address || {}
    });

    const savedCustomer = await customer.save();

    res.status(201).json({
      _id: savedCustomer._id,
      name: savedCustomer.name,
      email: savedCustomer.email,
      phone: savedCustomer.phone,
      dni: savedCustomer.dni,
      address: savedCustomer.address,
      token: generateCustomerToken(savedCustomer._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar cliente', error: error.message });
  }
});

// @route POST /api/customers/login
// @desc Authenticate customer with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (customer && (await customer.matchPassword(password))) {
      customer.lastLogin = new Date();
      await customer.save();

      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        dni: customer.dni,
        address: customer.address,
        ordersCount: customer.ordersCount,
        totalSpent: customer.totalSpent,
        token: generateCustomerToken(customer._id)
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas. Verifica tu email y contraseña' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor en login', error: error.message });
  }
});

// @route POST /api/customers/google-login
// @desc Authenticate or register with Google OAuth payload
router.post('/google-login', async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email de Google requerido' });
    }

    let customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (customer) {
      // Existing customer, update info
      customer.lastLogin = new Date();
      if (googleId) customer.googleId = googleId;
      if (avatar && !customer.avatar) customer.avatar = avatar;
      await customer.save();
    } else {
      // New customer registered via Google
      customer = new Customer({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        googleId: googleId || `google_${Date.now()}`,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        lastLogin: new Date()
      });
      await customer.save();
    }

    res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      avatar: customer.avatar,
      phone: customer.phone,
      dni: customer.dni,
      address: customer.address,
      ordersCount: customer.ordersCount,
      totalSpent: customer.totalSpent,
      token: generateCustomerToken(customer._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en autenticación con Google', error: error.message });
  }
});

// @route GET /api/customers
// @desc Get all customers for Admin Panel
// @access Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
});

// @route GET /api/customers/stats
// @desc Get customer statistics for Admin
// @access Private (Admin)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const googleUsers = await Customer.countDocuments({ googleId: { $exists: true, $ne: null } });
    const directUsers = totalCustomers - googleUsers;

    res.json({
      totalCustomers,
      googleUsers,
      directUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en estadísticas de clientes', error: error.message });
  }
});

module.exports = router;
