-- Consumo Diario Promedio por Electrodoméstico
SELECT 
    nombre,
    (potencia * horas_uso_dia * cantidad) / 1000.0 AS consumo_diario_kwh
FROM Electrodomesticos;

--Costo Mensual por Electrodoméstico
SELECT 
    nombre,
    ((potencia_w * horas_uso_dia * cantidad) / 1000.0) * 30 AS consumo_mensual_kwh
FROM Electrodomesticos;

--Costo Anual por Electrodoméstico
SELECT 
    nombre,
    ((potencia * horas_uso_dia * cantidad) / 1000.0) * 365 AS consumo_anual_kwh
FROM Electrodomesticos;

--Total general por periodos

SELECT 
    SUM((potencia_w * horas_uso_dia * cantidad) / 1000.0) AS total_diario_kwh,
    SUM(((potencia_w * horas_uso_dia * cantidad) / 1000.0) * 30) AS total_mensual_kwh,
    SUM(((potencia_w * horas_uso_dia * cantidad) / 1000.0) * 365) AS total_anual_kwh
FROM Electrodomesticos;

-- CONSUMO MENSUAL POR USUARIO Y ELECTRODOMÉSTICO
SELECT 
    c.id_usuario,
    u.nombre_completo,
    e.nombre_electrodomestico,
    e.potencia AS potencia_w,
    c.horas_uso_diario,
    c.dias_uso_mes,
    (e.potencia * c.horas_uso_diario * c.dias_uso_mes) / 1000.0 AS consumo_mensual_kwh
FROM consumo c
JOIN usuario u ON u.id_usuario = c.id_usuario
JOIN electrodomestico e ON e.id_electrodomestico = c.id_electrodomestico;

-- Obtener el plan tarifario actual del usuario 
--Supongamos que tus usuarios están en municipios con tarifa base “1F”.
SELECT 
    u.id_usuario,
    tm.municipio,
    pt.id_plan,
    pt.clave_tarifa,
    pt.es_verano
FROM usuario u
JOIN tarifa_municipios tm ON tm.id_municipio = u.id_municipio
JOIN planes_tarifa pt ON pt.id_municipio = tm.id_municipio
WHERE pt.vigente_hasta IS NULL  -- o fecha actual entre desde / hasta
  AND pt.clave_tarifa = '1F';

SELECT * FROM electrodomestico