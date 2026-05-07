const express = require('express');
const router = express.Router();
const { getAllPaquetes, getPaqueteById, createPaquete, updatePaquete, deletePaquete } = require('../controllers/paquete.Controller.js');

// Rutas CRUD de paquetes
router.get('/', getAllPaquetes);
router.get('/:id', getPaqueteById);
router.post('/', createPaquete);
router.put('/:id', updatePaquete);
router.delete('/:id', deletePaquete);

module.exports = router;