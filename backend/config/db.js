const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atelier-ecommerce');
    console.log(` MongoDB Conectado: ${conn.connection.host} / BD: ${conn.connection.name}`);
  } catch (error) {
    console.error(` Error al conectar a MongoDB: ${error.message}`);
    console.error(` Asegúrate de tener MongoDB ejecutándose localmente o configurar una URI válida de MongoDB Atlas en el archivo .env`);
    process.exit(1);
  }
};

module.exports = connectDB;
