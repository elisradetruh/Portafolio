-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ELECTRIMARCASS')
BEGIN
    CREATE DATABASE ELECTRIMARCASS;
END
GO

-- Usar la base de datos
USE ELECTRIMARCASS;
GO

-- Crear tabla de municipios (necesaria para la tabla usuario)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tarifa_municipios')
BEGIN
    CREATE TABLE tarifa_municipios (
        id_municipio INT IDENTITY(1,1) PRIMARY KEY,
        estado VARCHAR(64) NOT NULL DEFAULT 'Sinaloa',
        municipio VARCHAR(64) NOT NULL UNIQUE,
        clave_tarifa_base VARCHAR(3) NOT NULL,
        inicio_verano CHAR(4),
        fin_verano CHAR(4)
    );
    
    -- Insertar algunos municipios de ejemplo
    INSERT INTO tarifa_municipios (estado, municipio, clave_tarifa_base, inicio_verano, fin_verano) VALUES
    ('Sinaloa', 'Culiacán', '1F', '0501', '1031'),
    ('Sinaloa', 'Mazatlán', '1E', '0501', '1031'),
    ('Sinaloa', 'Ahome', '1F', '0501', '1031');
END
GO

-- Crear tabla de usuario
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario')
BEGIN
    CREATE TABLE usuario (
        id_usuario CHAR(6) PRIMARY KEY,
        id_municipio INT NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        correo_electronico VARCHAR(100) NOT NULL UNIQUE,
        contraseña_hash VARCHAR(255) NOT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (id_municipio) REFERENCES tarifa_municipios(id_municipio)
    );
END
GO

-- Crear usuario de prueba
IF NOT EXISTS (SELECT * FROM usuario WHERE correo_electronico = 'admin@electrimarcas.com')
BEGIN
    -- Hashear la contraseña 'admin123' con bcrypt (necesitarás hacerlo desde Node.js)
    INSERT INTO usuario (id_usuario, id_municipio, nombre_completo, correo_electronico, contraseña_hash)
    VALUES ('U00001', 1, 'Administrador', 'admin@electrimarcas.com', 'PLACEHOLDER_HASH');
END
GO

PRINT 'Base de datos y tablas de autenticación creadas exitosamente';
