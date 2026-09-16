USE master
drop database if exists ELECTRIMARCAS 
create database ELECTRIMARCAS
go
use ELECTRIMARCAS
go

CREATE TABLE categoria(
	id_categoria char(6) not null,
	nombre_categoria varchar(50)not null ,
	PRIMARY KEY(id_categoria)
)
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

create table marca(
	id_marca char(6) not null,
	nombre_marca varchar(30)not null,
	PRIMARY KEY(id_marca)
)
create table modelo(
	id_modelo char(6) not null,
	id_marca char(6) not null,
	nombre_modelo varchar(40)not null,
	año_fabricacion int not null,
	PRIMARY KEY(id_modelo),
	FOREIGN KEY(id_marca) references marca(id_marca)
)

create table tarifa(
	id_tarifa char(6) not null,
	estado varchar(30)not null,
	estacion_anio varchar(20) not null,
	costo_kwh int not null,
	fecha date not null,
	PRIMARY KEY(id_tarifa)
)
alter table tarifa
ALTEr COLUMN costo_kwh int not null
insert into tarifa values('T01','Sinaloa','Verano',800,'2025-06-01')
insert into tarifa values('T02','Sinaloa','Invierno',0.1250,'2025-12-01')

/*
T01 - Sinaloa - Verano - 600 - 2023-06-01
T02 - Sinaloa - Invierno - 0.1250 - 2023-12-01
*/

create table electrodomestico(
	id_electrodomestico char(6) not null,
	id_categoria char(6) not null,
	id_modelo char(6) not null,
	voltaje INT not null,
	potencia INT not null,
	nombre_electrodomestico varchar(60) not null,
	descripcion varchar(150) not null,
	PRIMARY KEY(id_electrodomestico),
	FOREIGN KEY(id_categoria) references categoria(id_categoria),
	FOREIGN KEY(id_modelo) references modelo(id_modelo)
)

alter table electrodomestico
ALTEr COLUMN descripcion varchar(200) 

create table consumo(
	id_consumo char(6) not null,
	id_electrodomestico char(6) not null,
	horas_uso int not null,
	dias_uso_mes int not null,
	id_tarifa char(6) not null,
	PRIMARY KEY(id_consumo),
	FOREIGN KEY(id_electrodomestico) references electrodomestico(id_electrodomestico),
	FOREIGN KEY(id_tarifa) references tarifa(id_tarifa)
)

-- ================================
-- Tabla de municipios y su tarifa base
-- ================================
CREATE TABLE tarifa_municipios (
    id_tarifa_municipios INT PRIMARY KEY,                   -- número asignado manualmente
    estado VARCHAR(64) NOT NULL,          -- "Sinaloa"
    municipio VARCHAR(64) NOT NULL,       -- "Culiacán"
    clave_tarifa_base VARCHAR(3) NOT NULL,-- '1D', '1E', '1F'
    inicio_verano CHAR(4),                -- '0501' (01 mayo)
    fin_verano CHAR(4)                    -- '1031' (31 octubre)
);

-- ================================
-- Tabla de planes tarifarios
-- (cada versión según temporada/mes)
-- ================================
CREATE TABLE planes_tarifa (
    id_planes_tarifa INT PRIMARY KEY,                   -- número asignado manualmente
    clave_tarifa VARCHAR(3) NOT NULL,     -- '1D', '1E', '1F', 'DAC'
    es_verano BIT NOT NULL,               -- 1 = verano, 0 = fuera de verano
    vigente_desde DATE NOT NULL,          -- Fecha inicio vigencia
    vigente_hasta DATE,                   -- NULL = actual
    notas NVARCHAR(MAX)
);

-- ================================
-- Tabla de bloques de consumo por plan
-- ================================
CREATE TABLE bloques_tarifa (
    id_bloques_tarifa INT PRIMARY KEY,                   -- número asignado manualmente
    id_planes_tarifa INT NOT NULL,                 -- FK a planes_tarifa
    orden_bloque INT NOT NULL,            -- 1=básico, 2=intermedio, 3=excedente
    limite_kwh INT,                       -- NULL = sin límite (excedente)
    precio_mxn DECIMAL(10,4) NOT NULL,    -- precio $/kWh
    FOREIGN KEY (id_planes_tarifa) REFERENCES planes_tarifa(id_planes_tarifa)
);

-- ================================
-- Tabla de reglas DAC
-- (límites promedio mensual)
-- ================================
CREATE TABLE reglas_dac (
    clave_tarifa_base VARCHAR(3) PRIMARY KEY,
    limite_promedio_mensual_kwh INT NOT NULL
);

-- Cambiar la longitud de varchar en tablas existentes
ALTER TABLE categoria 
ALTER COLUMN id_categoria char(6);

ALTER TABLE marca 
ALTER COLUMN nombre_marca VARCHAR(30) NOT NULL;

ALTER TABLE modelo 
ALTER COLUMN nombre_modelo VARCHAR(40) NOT NULL;

ALTER TABLE tarifa 
ALTER COLUMN estado VARCHAR(30) NOT NULL;

ALTER TABLE tarifa 
ALTER COLUMN estacion_anio VARCHAR(20) NOT NULL;

-- Cambiar decimal para mayor precisión
ALTER TABLE tarifa 
ALTER COLUMN costo_kwh DECIMAL(6,4) NOT NULL;

ALTER TABLE electrodomestico 
ALTER COLUMN potencia DECIMAL(8,2) NOT NULL;

ALTER TABLE electrodomestico
add nombre_electrodomestico varchar(60) not null;

ALTER TABLE electrodomestico
add descripcion varchar(150) not null;

select * from electrodomestico

SELECT * FROM #temp_electrodomestico

BULK INSERT #temp_electrodomestico
FROM 'C:\USB Santiago\Semestre 7 Tec\Taller de Investigación II\ElectriMarcas\tabla_electrodomesticos.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,              -- omitir encabezado si el CSV lo tiene
    FIELDTERMINATOR = ',',     -- separador de columnas
    ROWTERMINATOR = '\n',      -- salto de línea
    TABLOCK
);

