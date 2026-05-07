/**
 * Controller: Clientes
 */

const Cliente = require('../models/models.cliente.js');

const ClientesController = {

    async getAllClientes(req, res) {
        try {
            const clientes = await Cliente.getAll();
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar clientes', details: error.message });
        }
    },

    async getClienteById(req, res) {
        try {
            const cliente = await Cliente.getById(req.params.IDCliente);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener cliente', details: error.message });
        }
    },

    async createCliente(req, res) {
        try {
            const nuevoCliente = await Cliente.create(req.body);
            res.status(201).json(nuevoCliente);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear cliente', details: error.message });
        }
    },

    async updateCliente(req, res) {
        try {
            const actualizado = await Cliente.update(req.params.IDCliente, req.body);
            if (!actualizado) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ message: 'Cliente actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
        }
    },

    // ✅ CORREGIDO: usa Cliente.updateEstado() en vez de Cliente.update()
    async updateEstadoCliente(req, res) {
        try {
            const { Estado } = req.body;
            if (Estado === undefined || Estado === null) {
                return res.status(400).json({ error: 'El campo Estado es requerido' });
            }
            const actualizado = await Cliente.updateEstado(req.params.IDCliente, Estado);
            if (!actualizado) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ message: 'Estado actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar estado', details: error.message });
        }
    },

    async deleteCliente(req, res) {
        try {
            const eliminado = await Cliente.delete(req.params.IDCliente);
            if (!eliminado) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ message: 'Cliente eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
        }
    }
};

module.exports = ClientesController;
