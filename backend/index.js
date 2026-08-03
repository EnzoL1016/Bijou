const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productoRoutes  = require('./routes/productoRoutes');
const authRoutes      = require('./routes/authRoutes');
const uploadRoutes    = require('./routes/uploadRoutes');
const checkoutRoutes  = require('./routes/checkoutRoutes');
const envioRoutes     = require('./routes/envioRoutes');

const app = express();

app.use(cors());

// El webhook de MP necesita el body RAW — debe ir ANTES de express.json()
app.use('/checkout/mp-webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/productos', productoRoutes);
app.use('/auth',      authRoutes);
app.use('/upload',    uploadRoutes);
app.use('/checkout',  checkoutRoutes);
app.use('/envios',    envioRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));