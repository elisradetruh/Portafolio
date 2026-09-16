// backend/server.js
const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 3001; // Puerto de la API

// 1. MIDDLEWARE: Permite a Express leer JSON en el cuerpo de las peticiones POST/PUT
app.use(express.json());

// 2. MIDDLEWARE: Configuración de CORS
// Esto permite que el frontend de Vue (ej. en http://localhost:5173 o 8080) acceda a esta API.
app.use(cors()); 

// 3. Rutas de API (¡donde estará tu endpoint!)
const apiRoutes = require('./routes/api.js');
app.use('/api', apiRoutes); 

app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});