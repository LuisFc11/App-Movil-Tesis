// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 60000,
  heartbeatFrequencyMS: 10000,
})
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  });

// Esquema de Producto
const productSchema = new mongoose.Schema({
  codeqr: { type: String, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema, 'productos');

// Middleware para loggear solicitudes (para depurar)
app.use((req, res, next) => {
  console.log(`📥 Solicitud recibida: ${req.method} ${req.url} desde ${req.ip}`);
  next();
});

// Ruta GET para la raíz (prueba simple)
app.get('/', (req, res) => {
  res.json({ message: 'API de Qhatu Marca - Backend activo' });
});

// Ruta para agregar producto (POST /products)
app.post('/products', async (req, res) => {
  try {
    const { codeqr, nombre, descripcion, precio } = req.body;
    if (!codeqr || !nombre || !descripcion || precio <= 0) {
      return res.status(400).json({ message: '❌ Todos los campos son requeridos y precio debe ser mayor a 0' });
    }
    const newProduct = new Product({ codeqr, nombre, descripcion, precio });
    await newProduct.save();
    console.log('✅ Producto agregado:', newProduct);
    res.status(201).json({ message: '✅ Producto agregado', product: newProduct });
  } catch (err) {
    console.error('❌ Error al guardar producto:', err);
    res.status(500).json({ message: '❌ Error al guardar el producto', error: err.message });
  }
});

// Iniciar servidor escuchando en todas las interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT} (accesible desde cualquier IP)`);
});