const db = require('../config/db.js');

const getServicios = async () => {
    const [rows] = await db.query("SELECT * FROM servicios");
    return rows;
};

const crearServicio = async (data) => {
    const nombre = data.nombre || '';
    const precio = data.precio || 0;
    const Descripcion = data.Descripcion || data.descripcion || '';
    const Estado = data.Estado || data.estado || 'activo';
    const imagen = data.imagen || '';

    const [result] = await db.query(
        "INSERT INTO servicios (nombre, precio, Descripcion, Estado, imagen) VALUES (?, ?, ?, ?, ?)",
        [nombre, precio, Descripcion, Estado, imagen]
    );
    return { IDServicio: result.insertId, ...data };
};

const actualizarServicio = async (id, data) => {
    const nombre = data.nombre || '';
    const precio = data.precio || 0;
    const Descripcion = data.Descripcion || data.descripcion || '';
    const Estado = data.Estado || data.estado || 'activo';
    const imagen = data.imagen || '';

    await db.query(
        "UPDATE servicios SET nombre=?, precio=?, Descripcion=?, Estado=?, imagen=? WHERE IDServicio=?",
        [nombre, precio, Descripcion, Estado, imagen, id]
    );
    const [rows] = await db.query("SELECT * FROM servicios WHERE IDServicio=?", [id]);
    return rows[0];
};

const eliminarServicio = async (id) => {
    await db.query("DELETE FROM servicios WHERE IDServicio=?", [id]);
};

module.exports = {
    getServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio
};
