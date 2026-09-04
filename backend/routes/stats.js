const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

// @route GET /api/stats
// @desc Get overview dashboard statistics
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find({});
    const orders = await Order.find({});
    const totalCustomers = await Customer.countDocuments({});

    const totalProducts = products.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const stock = p.totalStock;
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock < 5) {
        lowStockCount++;
      }
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const recentOrders = orders.slice(0, 5);

    res.json({
      totalProducts,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

module.exports = router;
