# ElectriMarcas

Aplicación web para estimar y visualizar consumo eléctrico de electrodomésticos por marca, modelo y categoría.

## Objetivo

ElectriMarcas ayuda a:
- Registrar y consultar electrodomésticos.
- Estimar consumo energético (kWh) por uso.
- Visualizar dispositivos de mayor consumo.
- Calcular costo aproximado con tarifa doméstica (1F).

## Arquitectura del proyecto

El repositorio está dividido en dos aplicaciones principales:

- **Frontend**: `ELECTRIMARCAS-FRONTEND` (Vue 3 + Vite)
- **Backend**: `electrimarcas-backend` (Node.js + Express + SQL Server)

Además incluye archivos SQL y scripts auxiliares para carga/preparación de datos.

## Tecnologías

### Frontend
- Vue 3
- Vite
- Vue Router
- Axios
- Chart.js + vue-chartjs

### Backend
- Node.js
- Express
- mssql
- JSON Web Token (JWT)
- bcryptjs

### Base de datos
- Microsoft SQL Server

## Estructura general

```text
ElectriMarcas/
├─ README.md
├─ package.json                     # Script raíz para levantar frontend + backend
├─ ELECTRIMARCAS-FRONTEND/         # Cliente web (Vue)
└─ electrimarcas-backend/          # API REST + conexión SQL Server
```

## Requisitos previos

- Node.js 18+ (recomendado)
- npm 9+
- SQL Server activo y accesible

## Configuración inicial

### 1) Instalar dependencias

Desde la raíz del repositorio:

```bash
npm install
npm install --prefix ELECTRIMARCAS-FRONTEND
npm install --prefix electrimarcas-backend
```

### 2) Configurar backend

Revisa y ajusta estos parámetros del backend según tu entorno:

- Puerto de API (por defecto `3001`)
- Configuración de conexión SQL Server en `electrimarcas-backend/config.js`
- Secreto JWT con `JWT_SECRET` (variable de entorno recomendada)

### 3) Preparar base de datos

En `electrimarcas-backend/` encontrarás scripts como:
- `BD.sql`
- `setup_auth.sql`
- `consultas.sql`
- `Inserciones2.sql`

Úsalos para crear estructura, autenticación y datos de ejemplo según necesites.

## Ejecución

### Levantar frontend y backend juntos (recomendado)

Desde la raíz:

```bash
npm run dev
```

Esto ejecuta:
- Frontend en Vite (normalmente `http://localhost:5173`)
- Backend en Express (normalmente `http://localhost:3001`)

### Ejecución por separado

Frontend:

```bash
cd ELECTRIMARCAS-FRONTEND
npm run dev
```

Backend:

```bash
cd electrimarcas-backend
npm run dev
```

## Rutas principales de la API

Base URL: `http://localhost:3001/api`

- `POST /login` — Inicio de sesión
- `POST /register` — Registro de usuario
- `GET /verify-token` — Verificación de token
- `POST /logout` — Cierre de sesión
- `GET /municipios` — Catálogo de municipios
- `GET /data-grafica` — Datos para gráfica de consumo
- `GET /dispositivos-lista` — Lista de dispositivos
- `GET /dispositivos-lista/:categoriaId` — Dispositivos por categoría
- `POST /dispositivo/nuevo` — Alta de nuevo dispositivo

## Vistas principales del frontend

- Inicio de sesión
- Registro
- Inicio
- Mis dispositivos
- Estadísticas
- Consejos de ahorro
- Nuevo dispositivo
- Acerca de

## Notas

- El frontend usa proxy de Vite para enrutar `/api` al backend local.
- Parte de la lógica de consumo/costo se procesa en frontend (servicio de datos).
- Si cambias puertos, ajusta también la configuración de proxy/API.

## Próximas mejoras sugeridas

- Mover configuración sensible a variables de entorno en backend.
- Agregar pruebas automatizadas.
- Agregar un `.env.example` documentado para entorno local.
