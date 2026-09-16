-- ================================
-- Creación y uso de la base de datos
-- ================================
CREATE DATABASE ELECTRIMARCASS;
GO


-- ===================================================================
-- Tablas de Catálogos (Se mantienen sin cambios)
-- ===================================================================

CREATE TABLE categoria (
    id_categoria CHAR(6) NOT NULL,
    nombre_categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_categoria)
);
select * from categoria


INSERT INTO categoria (id_categoria, nombre_categoria)
SELECT DISTINCT
    -- Asumimos un patrón para generar el id_categoria, por ejemplo 'C' + número.
    -- En un caso real, podrías tener una tabla de mapeo o una lógica más robusta.
    CASE WHEN tt.nombre_categoria = 'limpieza' THEN 'C01'
         WHEN tt.nombre_categoria = 'cocina' THEN 'C02'
         WHEN tt.nombre_categoria = 'entretenimiento' THEN 'C03'
         WHEN tt.nombre_categoria = 'climatizacion' THEN 'C04'
         WHEN tt.nombre_categoria = 'cuidado' THEN 'C05'
    ELSE 'C99' -- Categoría genérica para otros casos
    END AS id_categoria,
    tt.nombre_categoria
FROM #temp_electrodomestico tt
WHERE NOT EXISTS (SELECT 1 FROM categoria c WHERE c.nombre_categoria = tt.nombre_categoria);



CREATE TABLE marca (
    id_marca CHAR(6) NOT NULL,
    nombre_marca VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_marca)
);

CREATE TABLE modelo (
    id_modelo CHAR(6) NOT NULL,
    id_marca CHAR(6) NOT NULL,
    nombre_modelo VARCHAR(40) NOT NULL,
    año_fabricacion INT NOT NULL,
    PRIMARY KEY(id_modelo),
    FOREIGN KEY(id_marca) REFERENCES marca(id_marca)
);

CREATE TABLE electrodomestico (
    id_electrodomestico CHAR(6) NOT NULL,
    id_categoria CHAR(6) NOT NULL,
    id_modelo CHAR(6) NOT NULL,
    voltaje INT NOT NULL,
    potencia INT NOT NULL,
    nombre_electrodomestico VARCHAR(60) NOT NULL,
    descripcion VARCHAR(60) NOT NULL,
    PRIMARY KEY(id_electrodomestico),
    FOREIGN KEY(id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY(id_modelo) REFERENCES modelo(id_modelo)
);

INSERT INTO categoria (id_categoria, nombre_categoria) VALUES
('C01', 'cocina'),
('C02', 'limpieza'),
('C03', 'entretenimiento'),
('C04', 'climatizacion'),
('C05', 'cuidado')
SELECT * from categoria

--Tabla temporal para almacenar datos de un electrodomestico
create table #temp_electrodomestico(
	id_categoria char(6) not null,
	nombre_categoria varchar(50) not null,
	id_electrodomestico char(6) not null,
	nombre_electrodomestico varchar(60) not null,
	id_marca char(6) not null,
	nombre_marca varchar(30) not null,
	id_modelo char(6) not null,
	nombre_modelo varchar(40) not null,
	año_fabricacion int not null,
	descripcion varchar(150) not null,
	voltaje varchar(10) not null,
	potencia varchar(10) not null,
)

BULK INSERT #temp_electrodomestico
FROM 'C:\csv\tabla_electrodomesticos.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,              -- omitir encabezado si el CSV lo tiene
    FIELDTERMINATOR = ',',     -- separador de columnas
    ROWTERMINATOR = '\n',      -- salto de línea
    TABLOCK
);

INSERT INTO marca (id_marca, nombre_marca)
SELECT DISTINCT
    tt.id_marca,
    tt.nombre_marca
FROM #temp_electrodomestico tt
WHERE NOT EXISTS (SELECT 1 FROM marca m WHERE m.id_marca = tt.id_marca);

INSERT INTO modelo (id_modelo, id_marca, nombre_modelo, año_fabricacion)
SELECT DISTINCT
    tt.id_modelo,
    tt.id_marca,
    tt.nombre_modelo,
    tt.año_fabricacion
FROM #temp_electrodomestico tt
WHERE NOT EXISTS (SELECT 1 FROM modelo mo WHERE mo.id_modelo = tt.id_modelo);

INSERT INTO electrodomestico (id_electrodomestico, id_categoria, id_modelo, voltaje, potencia, nombre_electrodomestico, descripcion)
SELECT DISTINCT
    tt.id_electrodomestico,
    -- Obtenemos el id_categoria correspondiente al nombre de la categoría.
    (SELECT c.id_categoria FROM categoria c WHERE c.nombre_categoria = tt.nombre_categoria),
    tt.id_modelo,
    CAST(tt.voltaje AS INT),
    CAST(tt.potencia AS INT),
    tt.nombre_electrodomestico,
    tt.descripcion
FROM #temp_electrodomestico tt
WHERE NOT EXISTS (SELECT 1 FROM electrodomestico e WHERE e.id_electrodomestico = tt.id_electrodomestico);

ALTER TABLE electrodomestico
ALTER COLUMN descripcion varchar(150);

-- ================================
-- NUEVO MODELO DE TARIFAS
-- ================================

CREATE TABLE reglas_dac (
    clave_tarifa_base VARCHAR(3) PRIMARY KEY,
    limite_promedio_mensual_kwh INT NOT NULL
);

CREATE TABLE tarifa_municipios (
    id_municipio INT IDENTITY(1,1) PRIMARY KEY,
    estado VARCHAR(64) NOT NULL DEFAULT 'Sinaloa',
    municipio VARCHAR(64) NOT NULL UNIQUE,
    clave_tarifa_base VARCHAR(3) NOT NULL, -- '1D', '1E', '1F'
    inicio_verano CHAR(4), -- '0501' (01 mayo)
    fin_verano CHAR(4) -- '1031' (31 octubre)
);

CREATE TABLE planes_tarifa (
    id_plan INT IDENTITY(1,1) PRIMARY KEY,
    clave_tarifa VARCHAR(3) NOT NULL, -- '1D', '1E', '1F', 'DAC'
    es_verano BIT NOT NULL, -- 1 = verano, 0 = fuera de verano
    vigente_desde DATE NOT NULL,
    vigente_hasta DATE, -- NULL = actual
    notas TEXT,
    id_municipio INT NOT NULL,
    FOREIGN KEY (id_municipio) REFERENCES tarifa_municipios(id_municipio)
);

CREATE TABLE bloques_tarifa (
    id_bloque INT IDENTITY(1,1) PRIMARY KEY,
    id_plan INT NOT NULL,
    orden_bloque INT NOT NULL, -- 1=básico, 2=intermedio, 3=excedente
    limite_kwh INT, -- NULL = sin límite (excedente)
    precio_mxn money NOT NULL, -- precio $/kWh
    FOREIGN KEY (id_plan) REFERENCES planes_tarifa(id_plan),
    CONSTRAINT UQ_bloques_por_plan UNIQUE (id_plan, orden_bloque)
);

-- ===================================================================
-- Tablas de Usuario y Consumo
-- ===================================================================

-- 1. Tabla de Usuario. Ahora incluye la ubicación (municipio).
CREATE TABLE usuario (
    id_usuario CHAR(6) PRIMARY KEY,
    id_municipio INT NOT NULL, -- CAMBIO: Se añade la ubicación directamente al usuario
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contraseña_hash VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_municipio) REFERENCES tarifa_municipios(id_municipio)
);

-- 2. La tabla 'hogar' ha sido ELIMINADA.

-- ===================================================================
-- Tabla Transaccional de Consumo
-- ===================================================================

-- La tabla 'consumo' ahora se vincula directamente a un 'usuario'.
CREATE TABLE consumo (
    id_consumo char(6)  PRIMARY KEY,
    id_usuario char(6) NOT NULL, -- CAMBIO: Se vincula directamente con el usuario
    id_electrodomestico CHAR(6) NOT NULL,
    horas_uso_diario DECIMAL(4, 2) NOT NULL,
    dias_uso_mes INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_electrodomestico) REFERENCES electrodomestico(id_electrodomestico)
);

ALTER TABLE planes_tarifa
ADD id_municipio INT NOT NULL;

ALTER TABLE planes_tarifa
ADD CONSTRAINT FK_planes_tarifa_municipio FOREIGN KEY (id_municipio) REFERENCES tarifa_municipios(id_municipio);

ALTER TABLE tarifa_municipios
ADD CONSTRAINT FK_tarifa_municipios_reglasdac FOREIGN KEY (clave_tarifa_base) REFERENCES reglas_dac(clave_tarifa_base);
GO

INSERT INTO tarifa_municipios (estado, municipio, clave_tarifa_base, inicio_verano, fin_verano) VALUES
('Sinaloa', 'Ahome',             '1F', '0501', '1031'),
('Sinaloa', 'Angostura',         '1F', '0501', '1031'),
('Sinaloa', 'Badiraguato',       '1E', '0501', '1031'),
('Sinaloa', 'Concordia',         '1D', '0501', '1031'),
('Sinaloa', 'Cosalá',            '1D', '0501', '1031'),
('Sinaloa', 'Culiacán',          '1F', '0501', '1031'),
('Sinaloa', 'Choix',             '1F', '0501', '1031'),
('Sinaloa', 'Elota',             '1E', '0501', '1031'),
('Sinaloa', 'Escuinapa',         '1E', '0501', '1031'),
('Sinaloa', 'El Fuerte',         '1F', '0501', '1031'),
('Sinaloa', 'Guasave',           '1F', '0501', '1031'),
('Sinaloa', 'Mazatlán',          '1E', '0501', '1031'),
('Sinaloa', 'Mocorito',          '1F', '0501', '1031'),
('Sinaloa', 'Rosario',           '1E', '0501', '1031'),
('Sinaloa', 'Salvador Alvarado', '1F', '0501', '1031'),
('Sinaloa', 'San Ignacio',       '1E', '0501', '1031'),
('Sinaloa', 'Sinaloa',           '1F', '0501', '1031'),
('Sinaloa', 'Navolato',          '1F', '0501', '1031'),
('Sinaloa', 'El Dorado',         '1F', '0501', '1031'),
('Sinaloa', 'Juan José Ríos',    '1F', '0501', '1031');

select * from tarifa_municipios
