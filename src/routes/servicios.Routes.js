const express = require('express');
const router = express.Router();
const { getServicios, postServicio, putServicio, deleteServicio } = require('../controllers/servicios.Controller.js');

// Rutas CRUD de servicios
router.get('/', getServicios);
router.post('/', postServicio);
router.put('/:id', putServicio);
router.delete('/:id', deleteServicio);

module.exports = router;