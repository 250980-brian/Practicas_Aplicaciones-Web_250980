-- COMANDOS PARA CREAR LA BASE DE DATOS
-- PARA MECAGEST Y SU INTERACCIÓN CON PHP

-- 1. Crear la Base de Datos
CREATE DATABASE db_mecagest;

-- 2. Usar/Activar la Base de Datos
USE db_mecagest;

-- 3 Crear la Tabla de Usuarios
CREATE TABLE usuario (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL  UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
	status TINYINT DEFAULT 1
);

-- 4. Visualizar la estructura de la tabla
DESCRIBE usuario;

-- 5. Seleccionar los registros de la tabla 
SELECT * FROM usuario;

-- 6. Ejemplo de inserción de un nuevo usuario
INSERT INTO usuario VALUES(DEFAULT,"Brian Ramirez", "brianisael@gmail.com",
md5("birc070907"), now(), null, 1);


-- 7. Inserción multiple de otros dos usuarios
INSERT INTO usuario (nombre,email,password) values
("Juan Pérez", "j.perez@gmail.com", md5("12345")),
("Patricia Reyes", "patty.reyes48@outlook.com", md5("67890"));