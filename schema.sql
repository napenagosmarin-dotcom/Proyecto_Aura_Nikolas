-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS aura;
USE aura;

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    IDUsuario INT AUTO_INCREMENT PRIMARY KEY,
    NombreUsuario VARCHAR(255) NOT NULL,
    Apellido VARCHAR(255),
    Email VARCHAR(255) UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
    TipoDocumento VARCHAR(50),
    NumeroDocumento VARCHAR(50),
    Telefono VARCHAR(50),
    Pais VARCHAR(100),
    Direccion TEXT,
    IDRol INT DEFAULT 1
);

-- Tabla estadosreserva
CREATE TABLE IF NOT EXISTS estadosreserva (
    IdEstadoReserva INT AUTO_INCREMENT PRIMARY KEY,
    NombreEstadoReserva VARCHAR(255) NOT NULL
);

-- Tabla cabanas
CREATE TABLE IF NOT EXISTS cabanas (
    IDCabana INT AUTO_INCREMENT PRIMARY KEY,
    NombreCabana VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    CapacidadPersonas INT,
    PrecioNoche DECIMAL(10,2),
    Estado INT DEFAULT 1,
    ImagenCabana VARCHAR(255)
);

-- Tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
    IDCliente INT AUTO_INCREMENT PRIMARY KEY,
    NroDocumento VARCHAR(50) UNIQUE,
    Nombre VARCHAR(255),
    Apellido VARCHAR(255),
    Direccion TEXT,
    Email VARCHAR(255),
    Telefono VARCHAR(50),
    Estado INT DEFAULT 1,
    IDRol INT DEFAULT 1
);

-- Tabla metodopago
CREATE TABLE IF NOT EXISTS metodopago (
    IdMetodoPago INT AUTO_INCREMENT PRIMARY KEY,
    NomMetodoPago VARCHAR(255) NOT NULL
);

-- Tabla habitacion
CREATE TABLE IF NOT EXISTS habitacion (
    IDHabitacion INT AUTO_INCREMENT PRIMARY KEY,
    NombreHabitacion VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2),
    descripcion TEXT,
    Estado INT DEFAULT 1,
    numero INT,
    imagen VARCHAR(255),
    Costo DECIMAL(10,2)
);

-- Tabla paquetes
CREATE TABLE IF NOT EXISTS paquetes (
    IDPaquete INT AUTO_INCREMENT PRIMARY KEY,
    NombrePaquete VARCHAR(255) NOT NULL,
    Precio DECIMAL(10,2),
    IDHabitacion INT,
    FOREIGN KEY (IDHabitacion) REFERENCES habitacion(IDHabitacion)
);

-- Tabla reserva
CREATE TABLE IF NOT EXISTS reserva (
    IdReserva INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioIdusuario INT,
    IdEstadoReserva INT,
    MetodoPago INT,
    FechaReserva DATE,
    FechaInicio DATE,
    FechaFin DATE,
    Total DECIMAL(10,2),
    FOREIGN KEY (UsuarioIdusuario) REFERENCES usuarios(IDUsuario),
    FOREIGN KEY (IdEstadoReserva) REFERENCES estadosreserva(IdEstadoReserva),
    FOREIGN KEY (MetodoPago) REFERENCES metodopago(IdMetodoPago)
);

-- Tabla detallereservapaquetes
CREATE TABLE IF NOT EXISTS detallereservapaquetes (
    IDReserva INT,
    IDPaquete INT,
    PRIMARY KEY (IDReserva, IDPaquete),
    FOREIGN KEY (IDReserva) REFERENCES reserva(IdReserva),
    FOREIGN KEY (IDPaquete) REFERENCES paquetes(IDPaquete)
);

-- Tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
    IDServicio INT AUTO_INCREMENT PRIMARY KEY,
    NombreServicio VARCHAR(255),
    nombre VARCHAR(255),
    precio DECIMAL(10,2),
    Descripcion TEXT,
    Estado INT DEFAULT 1,
    imagen VARCHAR(255),
    Costo DECIMAL(10,2)
);

-- Tabla detallereservaservicio
CREATE TABLE IF NOT EXISTS detallereservaservicio (
    IDReserva INT,
    IDServicio INT,
    PRIMARY KEY (IDReserva, IDServicio),
    FOREIGN KEY (IDReserva) REFERENCES reserva(IdReserva),
    FOREIGN KEY (IDServicio) REFERENCES servicios(IDServicio)
);

-- Insertar datos de ejemplo
INSERT INTO usuarios (NombreUsuario, Apellido, Email, Contrasena, IDRol) VALUES
('Admin', 'Sistema', 'admin@example.com', 'password', 2),
('User1', 'Prueba', 'user1@example.com', 'password', 1);

INSERT INTO estadosreserva (NombreEstadoReserva) VALUES
('Pendiente'),
('Confirmada'),
('Cancelada');

INSERT INTO metodopago (NomMetodoPago) VALUES
('Efectivo'),
('Tarjeta'),
('Transferencia');

INSERT INTO habitacion (NombreHabitacion, precio, descripcion, Estado, numero, imagen, Costo) VALUES
('Habitación Simple', 50.00, 'Habitación básica', 1, 101, '', 50.00),
('Habitación Doble', 80.00, 'Habitación para dos', 1, 102, '', 80.00);

INSERT INTO paquetes (NombrePaquete, Precio, IDHabitacion) VALUES
('Paquete Básico', 100.00, 1),
('Paquete Premium', 150.00, 2);

INSERT INTO servicios (NombreServicio, nombre, precio, Descripcion, Estado, imagen, Costo) VALUES
('Desayuno', 'Desayuno', 10.00, 'Desayuno continental', 1, '', 10.00),
('Lavandería', 'Lavandería', 5.00, 'Servicio de lavandería', 1, '', 5.00);