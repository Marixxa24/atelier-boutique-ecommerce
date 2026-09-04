const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route GET /api/products/categories
// @desc Get all unique categories across products
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    // Ensure standard categories are present
    const defaultCategories = ['Tops', 'Pantalones', 'Sets', 'Colección'];
    const merged = Array.from(new Set([...defaultCategories, ...categories])).filter(Boolean);
    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
});

// @route GET /api/products
// @desc Get all products (supports search, category, status filter)
router.get('/', async (req, res) => {
  try {
    const { status, category, search, promo, featured } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (category && category !== 'Todos' && category !== 'Todas las categorías' && category !== 'Todas') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }
    if (promo === 'true') {
      filter.isPromo = true;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener productos', error: error.message });
  }
});

// @route POST /api/products/validate-stock
// @desc Check stock availability for an array of cart items in real time
router.post('/validate-stock', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Formato de items inválido' });
    }

    const validationResults = [];
    let allAvailable = true;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        validationResults.push({
          ...item,
          available: false,
          availableStock: 0,
          reason: 'Producto no encontrado'
        });
        allAvailable = false;
        continue;
      }

      if (product.status !== 'Activo') {
        validationResults.push({
          ...item,
          available: false,
          availableStock: 0,
          reason: 'Producto no disponible actualmente'
        });
        allAvailable = false;
        continue;
      }

      const invColor = product.inventory.find(i => i.color.toLowerCase() === item.color.toLowerCase());
      if (!invColor) {
        validationResults.push({
          ...item,
          available: false,
          availableStock: 0,
          reason: `Color ${item.color} no disponible`
        });
        allAvailable = false;
        continue;
      }

      const sizeStock = invColor.sizes[item.size] || 0;
      const isEnough = sizeStock >= item.quantity;
      if (!isEnough) {
        allAvailable = false;
      }

      validationResults.push({
        ...item,
        available: isEnough,
        availableStock: sizeStock,
        price: product.price,
        name: product.name,
        reason: isEnough ? 'OK' : `Solo quedan ${sizeStock} unidades del talle ${item.size}`
      });
    }

    res.json({
      valid: allAvailable,
      items: validationResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al validar stock', error: error.message });
  }
});

// @route GET /api/products/:id
// @desc Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al buscar producto', error: error.message });
  }
});

// @route POST /api/products
// @desc Create a product
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const { 
      name, sku, description, price, compareAtPrice, 
      isPromo, discountPercent, promoBadge, isFeatured,
      images, category, status, inventory 
    } = req.body;
    
    // Check if sku exists
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: `Ya existe un producto con el SKU: ${sku}` });
    }

    const product = new Product({
      name,
      sku,
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      isPromo: Boolean(isPromo),
      discountPercent: Number(discountPercent) || 0,
      promoBadge: promoBadge || '',
      isFeatured: Boolean(isFeatured),
      images: images || [],
      category: category || 'Tops',
      status: status || 'Activo',
      inventory: inventory || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear producto. Verifica los campos requeridos.', error: error.message });
  }
});

// @route PUT /api/products/:id
// @desc Update a product
// @access Private
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // If changing SKU, ensure unique
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingSku = await Product.findOne({ sku: req.body.sku });
      if (existingSku) {
        return res.status(400).json({ message: `Ya existe otro producto con el SKU: ${req.body.sku}` });
      }
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

// @route PATCH /api/products/:id/stock
// @desc Quick update stock for a specific color and size
// @access Private
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { color, size, quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const inv = product.inventory.find(i => i.color.toLowerCase() === color.toLowerCase());
    if (!inv) {
      return res.status(400).json({ message: `No se encontró la variante de color ${color}` });
    }

    if (inv.sizes[size] === undefined) {
      return res.status(400).json({ message: `Talle ${size} no válido` });
    }

    inv.sizes[size] = Math.max(0, parseInt(quantity) || 0);
    product.markModified('inventory');
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar stock rápido', error: error.message });
  }
});

// @route DELETE /api/products/:id
// @desc Delete a product
// @access Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Producto eliminado correctamente', id: req.params.id });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;
