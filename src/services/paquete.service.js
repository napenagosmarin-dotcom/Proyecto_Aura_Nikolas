const db = require('../database/connection.js');

const getAll = async () => {
    const [rows] = await db.query("SELECT * FROM paquetes");
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM paquetes WHERE IDPaquete = ?", [id]
    );
    return rows[0];
};

const create = async (data) => {
    const nombre = data.nombre || '';
    const Descripcion = data.Descripcion || data.descripcion || '';
    const IDHabitacion = data.IDHabitacion || null;
    const IDServicio = data.IDServicio || null;
    const Precio = data.Precio || data.precio || 0;
    const Estado = 1;
    const imagen = data.imagen || '';

    const [result] = await db.query(
        `INSERT INTO paquetes (nombre, Descripcion, IDHabitacion, IDServicio, Precio, Estado, imagen)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, Descripcion, IDHabitacion, IDServicio, Precio, Estado, imagen]
    );
    return { IDPaquete: result.insertId, ...data };
};

const update = async (id, data) => {
    const nombre = data.nombre || '';
    const Descripcion = data.Descripcion || data.descripcion || '';
    const IDHabitacion = data.IDHabitacion || null;
    const IDServicio = data.IDServicio || null;
    const Precio = data.Precio || data.precio || 0;
    const Estado = 1;
    const imagen = data.imagen || '';

    await db.query(
        `UPDATE paquetes 
         SET nombre=?, Descripcion=?, IDHabitacion=?, IDServicio=?, Precio=?, Estado=?, imagen=?
         WHERE IDPaquete=?`,
        [nombre, Descripcion, IDHabitacion, IDServicio, Precio, Estado, imagen, id]
    );
    return getById(id);
};

const remove = async (id) => {
    await db.query("DELETE FROM paquetes WHERE IDPaquete=?", [id]);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
