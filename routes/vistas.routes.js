const express = require('express');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');
const router = express.Router();
const { User } = require('../models/user')

router.get('', (req, res) => {
    if (!req.user)
        res.render('index');
    else {
        if (req.user.isAdmin)
            res.redirect('/admin');
        else
            res.redirect('/clientes');
    }
})

// ------------------- USUARIOS -------------------------

.get('/usuarios/login', (req, res) => {
    res.render('login');
})

// ------------------- CLIENTES -------------------------

.get('/clientes', autenticado, (req, res) => {
    res.render('indexCliente')
})

.get('/clientes/turno', autenticado, async (req, res) => {
    const usuario = await User.findById(req.user.id).populate('perrosId')
    const perros = usuario.perrosId;
    res.render('turno', {perros});
})

.get('/clientes/modificar-datos', autenticado, (req, res) => {
    res.render('modificar-datos');
})

// ------------------- ADMIN -------------------------

.get('/admin', [autenticado, esAdmin], (req, res) => {
    res.render('indexAdmin');
})

.get('/admin/registrar-usuario', [autenticado, esAdmin], (req, res) => {
    res.render('registro-usuario');
})

.get('/admin/registrar-perro', [autenticado, esAdmin], (req, res) => {
    res.render('registro-perro');
})

.get('/admin/eliminar-perro', [autenticado, esAdmin], (req, res) => {
    res.render('eliminar-perro');
})

.get('/admin/listar-turnos', [autenticado,esAdmin], (req,res) => {
    res.render('listarTurnosMock');
})


module.exports = router;