require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'API funcionando 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

require('dotenv').config();

const { pool, poolConnect } = require('./db');

app.get('/api/db-ping', async (_req, res) => {
  try {
    await poolConnect;
    // prueba contra tu base y tabla
    const r = await pool.request().query('SELECT COUNT(*) AS categorias FROM categoria');
    res.json({ ok: true, db: process.env.DB_NAME, categorias: r.recordset[0].categorias });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});
