require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Order = require('./models/Order');

const sampleProducts = [
  {
    name: "Blusa de Seda Noir",
    sku: "TOP-NOIR-01",
    description: "Blusa confeccionada en satén de seda pura con caída fluida, escote drapeado sutil y terminaciones a mano. La prenda esencial para un look nocturno atemporal y sofisticado.",
    price: 48500,
    category: "Tops",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Negro Moca",
        hex: "#241E1C",
        sizes: { XS: 4, S: 8, M: 6, L: 2, XL: 1 }
      },
      {
        color: "Marfil Seda",
        hex: "#F7F3EE",
        sizes: { XS: 2, S: 5, M: 4, L: 0, XL: 0 }
      }
    ]
  },
  {
    name: "Pantalón Sastrería Lino Crudo",
    sku: "PAN-LINO-02",
    description: "Pantalón wide leg de tiro alto confeccionado en 100% lino orgánico pesado. Pinzas frontales pronunciadas, bolsillos laterales ojal y caída estructurada pero relajada.",
    price: 64900,
    category: "Pantalones",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Lino Crudo",
        hex: "#E7DFC6",
        sizes: { XS: 1, S: 2, M: 1, L: 0, XL: 0 } // ¡Stock bajo! (4 total)
      },
      {
        color: "Terracota Cálido",
        hex: "#B86B53",
        sizes: { XS: 3, S: 6, M: 5, L: 3, XL: 2 }
      }
    ]
  },
  {
    name: "Set Minimalista Vainilla (Top + Falda Midi)",
    sku: "SET-VAIN-03",
    description: "Conjunto de dos piezas en punto milano elastizado de tacto aterciopelado. Crop top estructurado con cuello redondo cerrado y falda midi tubo con tajo lateral profundo.",
    price: 89000,
    category: "Sets",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Vainilla Nube",
        hex: "#F9F5EC",
        sizes: { XS: 2, S: 4, M: 3, L: 1, XL: 0 }
      },
      {
        color: "Rosa Nube",
        hex: "#ECCDC5",
        sizes: { XS: 1, S: 0, M: 0, L: 0, XL: 0 } // ¡Última unidad!
      }
    ]
  },
  {
    name: "Trench Coat Oversized Arena",
    sku: "ABR-TREN-04",
    description: "Gabardina premium impermeable en corte oversized contemporáneo con cinturón con hebilla forrada en cuero al tono, solapas anchas y forrería interior de satén.",
    price: 135000,
    category: "Colección",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Arena Desierto",
        hex: "#D6C7B2",
        sizes: { XS: 3, S: 5, M: 4, L: 2, XL: 1 }
      },
      {
        color: "Verde Oliva Sage",
        hex: "#7A8274",
        sizes: { XS: 1, S: 2, M: 2, L: 1, XL: 0 }
      }
    ]
  },
  {
    name: "Top Asimétrico Escultura",
    sku: "TOP-ASIM-05",
    description: "Diseño vanguardista de un solo hombro con frunce lateral ajustable y doble forro para máxima sujeción. Confeccionado en microfibra premium con acabado mate.",
    price: 36000,
    category: "Tops",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Marrón Moca",
        hex: "#382923",
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 } // Agotado
      },
      {
        color: "Blanco Lino",
        hex: "#FAF7F2",
        sizes: { XS: 2, S: 4, M: 3, L: 1, XL: 0 }
      }
    ]
  },
  {
    name: "Pantalón Palazzo Terracota",
    sku: "PAN-PALA-06",
    description: "Palazzo de tiro súper alto con cintura elastizada oculta y tela crepe con excelente peso y movimiento. Ideal tanto para el día con sandalias planas como para eventos con stilettos.",
    price: 59000,
    category: "Pantalones",
    status: "Activo",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=80"
    ],
    inventory: [
      {
        color: "Terracota Cálido",
        hex: "#BF775D",
        sizes: { XS: 2, S: 3, M: 2, L: 1, XL: 0 }
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atelier-ecommerce';
    const conn = await mongoose.connect(MONGO_URI);
    console.log(` Conectado a MongoDB Atlas (${conn.connection.host}) de forma segura.`);

    // 1. Admin Seed
    let admin = await Admin.findOne({ email: 'admin@atelier.com' });
    if (!admin) {
      admin = new Admin({
        name: 'Valentina Atelier',
        email: 'admin@atelier.com',
        password: 'password123'
      });
      await admin.save();
      console.log(' Admin creado: admin@atelier.com / password123');
    } else {
      console.log(' Admin ya existe (admin@atelier.com)');
    }

    // 2. Products Seed
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      console.log(' Sembrando catálogo de productos boutique...');
      await Product.insertMany(sampleProducts);
      console.log(` ${sampleProducts.length} productos sembrados con éxito.`);
    } else {
      console.log(` El catálogo ya cuenta con ${existingCount} productos.`);
    }

    // 3. Sample Order Seed
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const firstProduct = await Product.findOne();
      if (firstProduct) {
        const sampleOrder = new Order({
          customer: {
            name: "Camila Rodríguez",
            email: "camila.rodriguez@example.com",
            phone: "+54 9 11 4455-6677",
            dni: "38920112",
            address: {
              street: "Av. Alvear",
              number: "1750",
              zipCode: "1014",
              city: "Recoleta",
              province: "Ciudad Autónoma de Buenos Aires"
            }
          },
          items: [
            {
              product: firstProduct._id,
              name: firstProduct.name,
              color: firstProduct.inventory[0]?.color || "Negro Moca",
              size: "S",
              quantity: 1,
              price: firstProduct.price
            }
          ],
          subtotal: firstProduct.price,
          shippingCost: 0,
          discount: 0,
          total: firstProduct.price,
          paymentMethod: "mercadopago",
          deliveryMethod: "envio",
          status: "Pendiente"
        });
        await sampleOrder.save();
        console.log(' Orden de prueba inicial creada.');
      }
    }

    console.log('✨ Sembrado de datos completado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error(' Error durante el sembrado de MongoDB:', error.message);
    process.exit(1);
  }
};

seedDatabase();
