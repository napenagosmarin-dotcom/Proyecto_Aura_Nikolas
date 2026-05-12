// services/reservation.service.js

const db = require('../config/db');

// Obtener todas las reservas
const getAllReservations = async () => {
  try {
    const sql = `SELECT r.*, u.NombreUsuario, u.NumeroDocumento AS NroDocumentoCliente, 
                        e.NombreEstadoReserva, m.NomMetodoPago,
                         p.IDPaquete, p.nombre AS NombrePaquete, p.precio AS PrecioPaquete,
                         COALESCE(h_direct.IDHabitacion, h_paq.IDHabitacion) AS IDHabitacion,
                         COALESCE(h_direct.NombreHabitacion, h_paq.NombreHabitacion) AS NombreHabitacion,
                         COALESCE(h_direct.precio, h_paq.precio) AS CostoHabitacion
                 FROM reserva r
                 JOIN usuarios u ON r.UsuarioIdusuario = u.IDUsuario
                 LEFT JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
                 LEFT JOIN metodopago m ON r.MetodoPago = m.IdMetodoPago
                 LEFT JOIN detallereservahabitacion drh ON r.IdReserva = drh.IdReserva
                 LEFT JOIN habitacion h_direct ON drh.IDHabitacion = h_direct.IDHabitacion
                 LEFT JOIN detallereservapaquetes drp ON drp.IDReserva = r.IdReserva
                 LEFT JOIN paquetes p ON drp.IDPaquete = p.IDPaquete
                 LEFT JOIN habitacion h_paq ON p.IDHabitacion = h_paq.IDHabitacion`;
    const [results] = await db.query(sql);
    return results;
  } catch (error) {
    throw error;
  }
};

// Obtener reserva por ID
const getReservationById = async (id) => {
  try {
    const sql = `SELECT r.*, u.NombreUsuario, u.NumeroDocumento AS NroDocumentoCliente, 
                        e.NombreEstadoReserva, m.NomMetodoPago,
                         p.IDPaquete, p.nombre AS NombrePaquete, p.precio AS PrecioPaquete,
                         COALESCE(h_direct.IDHabitacion, h_paq.IDHabitacion) AS IDHabitacion,
                         COALESCE(h_direct.NombreHabitacion, h_paq.NombreHabitacion) AS NombreHabitacion,
                         COALESCE(h_direct.precio, h_paq.precio) AS CostoHabitacion
                 FROM reserva r
                 JOIN usuarios u ON r.UsuarioIdusuario = u.IDUsuario
                 LEFT JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
                 LEFT JOIN metodopago m ON r.MetodoPago = m.IdMetodoPago
                 LEFT JOIN detallereservahabitacion drh ON r.IdReserva = drh.IdReserva
                 LEFT JOIN habitacion h_direct ON drh.IDHabitacion = h_direct.IDHabitacion
                 LEFT JOIN detallereservapaquetes drp ON drp.IDReserva = r.IdReserva
                 LEFT JOIN paquetes p ON drp.IDPaquete = p.IDPaquete
                 LEFT JOIN habitacion h_paq ON p.IDHabitacion = h_paq.IDHabitacion
                 WHERE r.IdReserva = ?`;

    const [results] = await db.query(sql, [id]);
    const reservation = results[0];
    if (!reservation) return null;

    const servicioSql = `SELECT s.IDServicio, s.nombre AS NombreServicio, s.precio AS Costo
                         FROM detallereservaservicio drs
                         JOIN servicios s ON drs.IDServicio = s.IDServicio
                         WHERE drs.IDReserva = ?`;

    const [servicioResults] = await db.query(servicioSql, [id]);
    return { ...reservation, servicios: servicioResults || [] };
  } catch (error) {
    throw error;
  }
};

// Obtener reservas por usuario
const getReservationsByUser = async (userId) => {
  try {
    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId)) return [];
 
    const sql = `SELECT r.*, u.NombreUsuario, u.NumeroDocumento AS NroDocumentoCliente, 
                        e.NombreEstadoReserva, m.NomMetodoPago,
                         p.IDPaquete, p.nombre AS NombrePaquete, p.precio AS PrecioPaquete,
                         COALESCE(h_direct.IDHabitacion, h_paq.IDHabitacion) AS IDHabitacion,
                         COALESCE(h_direct.NombreHabitacion, h_paq.NombreHabitacion) AS NombreHabitacion,
                         COALESCE(h_direct.precio, h_paq.precio) AS CostoHabitacion
                 FROM reserva r
                 JOIN usuarios u ON r.UsuarioIdusuario = u.IDUsuario
                 LEFT JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
                 LEFT JOIN metodopago m ON r.MetodoPago = m.IdMetodoPago
                 LEFT JOIN detallereservahabitacion drh ON r.IdReserva = drh.IdReserva
                 LEFT JOIN habitacion h_direct ON drh.IDHabitacion = h_direct.IDHabitacion
                 LEFT JOIN detallereservapaquetes drp ON drp.IDReserva = r.IdReserva
                 LEFT JOIN paquetes p ON drp.IDPaquete = p.IDPaquete
                 LEFT JOIN habitacion h_paq ON p.IDHabitacion = h_paq.IDHabitacion
                 WHERE r.UsuarioIdusuario = ?`;
    const [results] = await db.query(sql, [parsedUserId]);
    return results;
  } catch (error) {
    throw error;
  }
};

const getPackagePrice = async (IDPaquete) => {
  try {
    if (!IDPaquete) return 0;
    const [results] = await db.query('SELECT Precio FROM paquetes WHERE IDPaquete = ?', [IDPaquete]);
    if (!results.length) throw new Error('Paquete no encontrado');
    return Number(results[0].Precio) || 0;
  } catch (error) {
    throw error;
  }
};

const getHabitacionPrice = async (IDHabitacion) => {
  try {
    if (!IDHabitacion) return 0;
    const [results] = await db.query('SELECT Costo FROM habitacion WHERE IDHabitacion = ?', [IDHabitacion]);
    if (!results.length) throw new Error('Habitación no encontrada');
    return Number(results[0].Costo) || 0;
  } catch (error) {
    throw error;
  }
};

const getServicesPrices = async (servicioIds) => {
  try {
    if (!Array.isArray(servicioIds) || servicioIds.length === 0) return [];
    const [results] = await db.query('SELECT IDServicio, precio AS Costo FROM servicios WHERE IDServicio IN (?)', [servicioIds]);
    return results.map(r => ({ IDServicio: r.IDServicio, Costo: Number(r.Costo) || 0 }));
  } catch (error) {
    throw error;
  }
};

const insertPackageDetail = async (connection, reservaId, IDPaquete, precio) => {
  try {
    if (!IDPaquete) return;
    const data = {
      IDReserva: reservaId,
      IDPaquete,
      Cantidad: 1,
      Precio: precio,
      Estado: 1
    };
    await connection.query('INSERT INTO detallereservapaquetes SET ?', data);
  } catch (error) {
    throw error;
  }
};



const insertHabitacionDetail = async (connection, reservaId, IDHabitacion, precio) => {
  try {
    if (!IDHabitacion) return;
    const data = {
      IDReserva: reservaId,
      IDHabitacion,
      Cantidad: 1,
      precio,
      Estado: 1
    };
    await connection.query('INSERT INTO detallereservahabitacion SET ?', data);
  } catch (error) {
    throw error;
  }
};

const insertServiceDetails = async (connection, reservaId, serviceRows) => {
  try {
    if (!Array.isArray(serviceRows) || serviceRows.length === 0) return;
    const inserts = serviceRows.map(servicio => [reservaId, servicio.IDServicio, 1, servicio.Costo, 1]);
    await connection.query(
      'INSERT INTO detallereservaservicio (IDReserva, IDServicio, Cantidad, Precio, Estado) VALUES ?',
      [inserts]
    );
  } catch (error) {
    throw error;
  }
};

const calculateTotals = async (IDPaquete, IDHabitacion, servicioIds) => {
  const paquetePrecio = await getPackagePrice(IDPaquete);
  const habitacionPrecio = await getHabitacionPrice(IDHabitacion);
  const servicios = await getServicesPrices(servicioIds);
  const totalServicios = servicios.reduce((sum, servicio) => sum + servicio.Costo, 0);
  const subtotal = paquetePrecio + habitacionPrecio + totalServicios;
  const iva = parseFloat((subtotal * 0.19).toFixed(2));
  const total = parseFloat((subtotal + iva).toFixed(2));
  return {
    paquetePrecio,
    habitacionPrecio,
    servicios,
    subtotal,
    iva,
    total
  };
};

// Crear nueva reserva
const createReservation = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const servicioIds = Array.isArray(data.serviciosAdicionales) ? data.serviciosAdicionales : [];
    const totals = await calculateTotals(data.IDPaquete, data.IDHabitacion, servicioIds);

    // reservaData NO incluye IDPaquete ni IDHabitacion — se guardan en tablas de detalle
    const reservaData = {
      FechaReserva: data.FechaReserva || new Date(),
      FechaInicio: data.FechaInicio || null,
      FechaFinalizacion: data.FechaFinalizacion || null,
      SubTotal: totals.subtotal,
      Descuento: 0,
      IVA: totals.iva,
      MontoTotal: totals.total,
      MetodoPago: data.MetodoPago || null,
      IdEstadoReserva: data.IdEstadoReserva || 1,
      UsuarioIdusuario: data.UsuarioIdusuario || null
    };

    const [result] = await connection.query('INSERT INTO reserva SET ?', reservaData);
    const reservaId = result.insertId;

    // Guardar habitación o paquete en su tabla de detalle
    if (data.IDHabitacion) {
      await insertHabitacionDetail(connection, reservaId, data.IDHabitacion, totals.habitacionPrecio);
    } else if (data.IDPaquete) {
      await insertPackageDetail(connection, reservaId, data.IDPaquete, totals.paquetePrecio);
    }
    
    await insertServiceDetails(connection, reservaId, totals.servicios);

    await connection.commit();
    return { id: reservaId, ...reservaData };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Actualizar reserva
const updateReservation = async (id, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Si SOLO viene IdEstadoReserva, hacemos un update rápido y salimos
    const keys = Object.keys(data);
    if (keys.length === 1 && keys[0] === 'IdEstadoReserva') {
      await connection.query('UPDATE reserva SET IdEstadoReserva = ? WHERE IdReserva = ?', [data.IdEstadoReserva, id]);
      await connection.commit();
      return { id, ...data };
    }

    // 2. Si es un update completo (desde formulario)
    const servicioIds = Array.isArray(data.serviciosAdicionales) ? data.serviciosAdicionales : [];
    const totals = await calculateTotals(data.IDPaquete, data.IDHabitacion, servicioIds);

    const reservaData = {};
    if (data.FechaInicio) reservaData.FechaInicio = data.FechaInicio;
    if (data.FechaFinalizacion) reservaData.FechaFinalizacion = data.FechaFinalizacion;
    if (data.MetodoPago) reservaData.MetodoPago = data.MetodoPago;
    if (data.IdEstadoReserva) reservaData.IdEstadoReserva = data.IdEstadoReserva;
    
    // Totales siempre se actualizan si es un update completo
    reservaData.SubTotal = totals.subtotal;
    reservaData.Descuento = 0;
    reservaData.IVA = totals.iva;
    reservaData.MontoTotal = totals.total;

    const [result] = await connection.query('UPDATE reserva SET ? WHERE IdReserva = ?', [reservaData, id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    // Si se enviaron detalles (Habitación/Paquete/Servicios), los refrescamos
    if (data.IDHabitacion || data.IDPaquete || servicioIds.length > 0) {
      await connection.query('DELETE FROM detallereservahabitacion WHERE IDReserva = ?', [id]);
      await connection.query('DELETE FROM detallereservapaquetes WHERE IDReserva = ?', [id]);
      await connection.query('DELETE FROM detallereservaservicio WHERE IDReserva = ?', [id]);

      if (data.IDHabitacion) {
        await insertHabitacionDetail(connection, id, data.IDHabitacion, totals.habitacionPrecio);
      } else if (data.IDPaquete) {
        await insertPackageDetail(connection, id, data.IDPaquete, totals.paquetePrecio);
      }
      await insertServiceDetails(connection, id, totals.servicios);
    }

    await connection.commit();
    return { id, ...reservaData };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Eliminar reserva
const deleteReservation = async (id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM detallereservaservicio WHERE IDReserva = ?', [id]);
    await connection.query('DELETE FROM detallereservapaquetes WHERE IDReserva = ?', [id]);
    await connection.query('DELETE FROM reserva WHERE IdReserva = ?', [id]);

    await connection.commit();
    return { message: 'Reserva eliminada' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  getReservationsByUser,
  createReservation,
  updateReservation,
  deleteReservation
};