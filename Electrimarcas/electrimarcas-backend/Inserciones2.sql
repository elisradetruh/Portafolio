-- Usar la base de datos
USE ELECTRIMARCASS;
GO

-- ===================================================================
-- EJEMPLO DE INSERTS PARA TARIFAS (CFE Tarifa 1F - Sinaloa)
-- Estos datos son un ejemplo basado en las tarifas de CFE y deben ser actualizados
-- según las publicaciones oficiales en el Diario Oficial de la Federación.
-- ===================================================================

/* -----------------------------------------------------------
   2.1 Insertar reglas DAC (Prerrequisito)
   -----------------------------------------------------------
   Tabla: reglas_dac(clave_tarifa_base, limite_promedio_mensual_kwh)
   - Define el umbral de kWh promedio mensual que dispara la DAC
   - PRERREQUISITO: Debe existir antes de usar la clave 'DAC'
------------------------------------------------------------ */
INSERT INTO reglas_dac (clave_tarifa_base, limite_promedio_mensual_kwh) VALUES
('1D', 1000),
('1E', 2000),
('1F', 2500);
GO

/* -----------------------------------------------------------
   2.2 Insertar municipios y su tarifa base
   -----------------------------------------------------------
   Tabla: tarifa_municipios(estado, municipio, clave_tarifa_base, inicio_verano, fin_verano)
   - 'clave_tarifa_base' mapea el municipio a 1D/1E/1F por CFE
   - 'inicio_verano'/'fin_verano' se guardan como 'MMDD' (asumido CHAR(4))
   - PRERREQUISITO para crear planes: necesitamos IDs de municipios
------------------------------------------------------------ */
INSERT INTO tarifa_municipios (estado, municipio, clave_tarifa_base, inicio_verano, fin_verano) VALUES
('Sinaloa', 'Ahome', '1F', '0501', '1031'),
('Sinaloa', 'Angostura', '1F', '0501', '1031'),
('Sinaloa', 'Badiraguato', '1E', '0501', '1031'),
('Sinaloa', 'Concordia', '1D', '0501', '1031'),
('Sinaloa', 'Cosalá', '1D', '0501', '1031'),
('Sinaloa', 'Culiacán', '1F', '0501', '1031'),
('Sinaloa', 'Choix', '1F', '0501', '1031'),
('Sinaloa', 'Elota', '1E', '0501', '1031'),
('Sinaloa', 'Escuinapa', '1E', '0501', '1031'),
('Sinaloa', 'El Fuerte', '1F', '0501', '1031'),
('Sinaloa', 'Guasave', '1F', '0501', '1031'),
('Sinaloa', 'Mazatlán', '1E', '0501', '1031'),
('Sinaloa', 'Mocorito', '1F', '0501', '1031'),
('Sinaloa', 'Rosario', '1E', '0501', '1031'),
('Sinaloa', 'Salvador Alvarado', '1F', '0501', '1031'),
('Sinaloa', 'San Ignacio', '1E', '0501', '1031'),
('Sinaloa', 'Sinaloa', '1F', '0501', '1031'),
('Sinaloa', 'Navolato', '1F', '0501', '1031'),
('Sinaloa', 'El Dorado', '1F', '0501', '1031'),
('Sinaloa', 'Juan José Ríos', '1F', '0501', '1031');
GO

/* -----------------------------------------------------------
   2.3 Insertar planes_tarifa y bloques_tarifa
   -----------------------------------------------------------
   - Usamos variables para capturar id_plan (IDENTITY) y
     vincular sin romper la FK de bloques_tarifa(id_plan)
   - Cada plan es una combinación (clave_tarifa, es_verano)
   - DAC se define como plan independiente
------------------------------------------------------------ */

-- Variables para IDs de Plan
DECLARE @id_plan_1D_FV INT, @id_plan_1D_V INT;
DECLARE @id_plan_1E_FV INT, @id_plan_1E_V INT;
DECLARE @id_plan_1F_FV INT, @id_plan_1F_V INT;
DECLARE @id_plan_DAC   INT;

-- Variables para IDs de municipios “representativos” por clave base
DECLARE @id_municipio_1D INT;
DECLARE @id_municipio_1E INT;
DECLARE @id_municipio_1F INT;

-- Elegimos un municipio por cada clave base (el de menor id_municipio)
-- Nota: esto hace el script determinista: siempre toma el primero insertado.
SELECT TOP 1 @id_municipio_1D = id_municipio
FROM tarifa_municipios
WHERE clave_tarifa_base = '1D'
ORDER BY id_municipio;

SELECT TOP 1 @id_municipio_1E = id_municipio
FROM tarifa_municipios
WHERE clave_tarifa_base = '1E'
ORDER BY id_municipio;

SELECT TOP 1 @id_municipio_1F = id_municipio
FROM tarifa_municipios
WHERE clave_tarifa_base = '1F'
ORDER BY id_municipio;

-- Guardas defensivas: si falta alguno, abortamos
IF @id_municipio_1D IS NULL OR @id_municipio_1E IS NULL OR @id_municipio_1F IS NULL
BEGIN
    RAISERROR('ERROR CRÍTICO: No se encontraron IDs de municipios para 1D/1E/1F. Verifique tarifa_municipios.', 16, 1);
    RETURN;
END

/* ==============================
   INSERCIÓN DE PLANES_TARIFA
   ==============================
   Tabla: planes_tarifa(clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
   - es_verano: 1 = Verano, 0 = Fuera de Verano
   - vigente_desde: fecha de vigencia del plan
   - id_municipio: FK para anclar el plan a un municipio (criterio operativo)
   - SCOPE_IDENTITY() captura el id_plan recién creado
*/

-- 1D Fuera de Verano (FV)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1D', 0, '2025-01-01', N'1D fuera de verano', @id_municipio_1D);
SET @id_plan_1D_FV = SCOPE_IDENTITY();

-- 1D Verano (V)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1D', 1, '2025-05-01', N'1D verano', @id_municipio_1D);
SET @id_plan_1D_V = SCOPE_IDENTITY();

-- 1E Fuera de Verano (FV)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1E', 0, '2025-01-01', N'1E fuera de verano', @id_municipio_1E);
SET @id_plan_1E_FV = SCOPE_IDENTITY();

-- 1E Verano (V)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1E', 1, '2025-05-01', N'1E verano', @id_municipio_1E);
SET @id_plan_1E_V = SCOPE_IDENTITY();

-- 1F Fuera de Verano (FV)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1F', 0, '2025-01-01', N'1F fuera de verano', @id_municipio_1F);
SET @id_plan_1F_FV = SCOPE_IDENTITY();

-- 1F Verano (V)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('1F', 1, '2025-05-01', N'1F verano', @id_municipio_1F);
SET @id_plan_1F_V = SCOPE_IDENTITY();

-- Plan DAC (se ancla a un municipio con 1F por conveniencia operativa)
INSERT INTO planes_tarifa (clave_tarifa, es_verano, vigente_desde, notas, id_municipio)
VALUES ('DAC', 0, '2025-01-01', N'Doméstica de Alto Consumo', @id_municipio_1F);
SET @id_plan_DAC = SCOPE_IDENTITY();

/* ==============================
   INSERCIÓN DE BLOQUES_TARIFA
   ==============================
   Tabla: bloques_tarifa(id_plan, orden_bloque, limite_kwh, precio_mxn)
   - 'orden_bloque' define la prioridad/escalón (recomendado UQ con id_plan)
   - 'limite_kwh' NULL significa "bloque abierto" (sin tope superior)
   - Los precios están normalizados por bloque
*/

-- Bloques 1D VERANO (V)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1D_V, 1, 175 , 0.9770),
(@id_plan_1D_V, 2, 400 , 1.1310),
(@id_plan_1D_V, 3, 600 , 1.4590),
(@id_plan_1D_V, 4, NULL, 3.8890);

-- Bloques 1D FUERA DE VERANO (FV)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1D_FV, 1, 75 , 1.1030),
(@id_plan_1D_FV, 2, 200, 1.3400),
(@id_plan_1D_FV, 3, NULL, 3.9170);

-- Bloques 1E VERANO (V)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1E_V, 1, 300 , 0.8890),
(@id_plan_1E_V, 2, 750 , 1.0120),
(@id_plan_1E_V, 3, 900 , 1.3130),
(@id_plan_1E_V, 4, NULL, 3.8890);

-- Bloques 1E FUERA DE VERANO (FV)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1E_FV, 1, 75 , 1.0950),
(@id_plan_1E_FV, 2, 200, 1.3300),
(@id_plan_1E_FV, 3, NULL, 3.8890);

-- Bloques 1F VERANO (V)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1F_V, 1, 300 , 0.8150),
(@id_plan_1F_V, 2, 1200, 0.9960),
(@id_plan_1F_V, 3, 2500, 2.4230),
(@id_plan_1F_V, 4, NULL, 3.8330);

-- Bloques 1F FUERA DE VERANO (FV)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_1F_FV, 1, 75 , 1.1030),
(@id_plan_1F_FV, 2, 200, 1.3400),
(@id_plan_1F_FV, 3, NULL, 3.9170);

-- Bloque DAC (tarifa plana por kWh en todo el consumo)
INSERT INTO bloques_tarifa (id_plan, orden_bloque, limite_kwh, precio_mxn) VALUES
(@id_plan_DAC, 1, NULL, 6.0100);
GO

/* -----------------------------------------------------------
   Consulta de verificación:
   - Lista planes con sus bloques, ordenados por clave y temporada
------------------------------------------------------------ */
SELECT  P.id_plan,
        P.clave_tarifa,
        P.es_verano,
        B.orden_bloque,
        B.limite_kwh,
        B.precio_mxn
FROM planes_tarifa AS P
JOIN bloques_tarifa AS B
  ON P.id_plan = B.id_plan
ORDER BY P.clave_tarifa, P.es_verano DESC, B.orden_bloque;
GO

-- Verificación de los datos insertados
SELECT * FROM categoria;
SELECT * FROM marca;
SELECT * FROM modelo;
SELECT * FROM electrodomestico;
SELECT * FROM tarifa_municipios;
SELECT * FROM planes_tarifa;
SELECT * FROM bloques_tarfia;
SELECT * FROM reglas_dac;
SELECT * FROM consumo;
GO
