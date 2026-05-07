const db = require('../database/connection.js');

const getAll = async () => {
    const [rows] = await db.query("SELECT * FROM habitacion");
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM habitacion WHERE IDHabitacion = ?", [id]
    );
    return rows[0];
};

const create = async (data) => {
    const NombreHabitacion = data.tipo || data.nombre || data.NombreHabitacion || '';
    const precio = data.precio || 0;
    const descripcion = data.descripcion || '';
    const Estado = 1;
    const numero = data.numero || null;
    const imagen = data.imagen || '';

    const [result] = await db.query(
        "INSERT INTO habitacion (NombreHabitacion, precio, descripcion, Estado, numero, imagen) VALUES (?, ?, ?, ?, ?, ?)",
        [NombreHabitacion, precio, descripcion, Estado, numero, imagen]
    );
    return { IDHabitacion: result.insertId, ...data };
};

const update = async (id, data) => {
    const NombreHabitacion = data.tipo || data.nombre || data.NombreHabitacion || '';
    const precio = data.precio || 0;
    const descripcion = data.descripcion || '';
    const Estado = 1;
    const numero = data.numero || null;
    const imagen = data.imagen || '';

    await db.query(
        "UPDATE habitacion SET NombreHabitacion=?, precio=?, descripcion=?, Estado=?, numero=?, imagen=? WHERE IDHabitacion=?",
        [NombreHabitacion, precio, descripcion, Estado, numero, imagen, id]
    );
    return getById(id);
};

const remove = async (id) => {
    await db.query("DELETE FROM habitacion WHERE IDHabitacion = ?", [id]);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
