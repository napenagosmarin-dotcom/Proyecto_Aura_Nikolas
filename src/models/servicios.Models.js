const db = require('../config/db.js');

const obtenerServicios = async () => {
    const [rows] = await db.query("SELECT * FROM servicios");
    return rows;
};

const crearServicio = async (servicio) => {
    const { nombre, precio, Descripcion, Estado, imagen } = servicio;

    const [result] = await db.query(
        "INSERT INTO servicios (nombre, precio, Descripcion, Estado, imagen) VALUES (?, ?, ?, ?, ?)",
        [nombre, precio, Descripcion, Estado, imagen]
    );

    return result;
};

const actualizarServicio = async (id, servicio) => {
    const { nombre, precio, Descripcion, Estado, imagen } = servicio;

    const [result] = await db.query(
        "UPDATE servicios SET nombre=?, precio=?, Descripcion=?, Estado=?, imagen=? WHERE IDServicio=?",
        [nombre, precio, Descripcion, Estado, imagen, id]
    );

    return result;
};

const eliminarServicio = async (id) => {
    const [result] = await db.query(
        "DELETE FROM servicios WHERE IDServicio=?",
        [id]
    );

    return result;
};

module.exports = {
    obtenerServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio
};