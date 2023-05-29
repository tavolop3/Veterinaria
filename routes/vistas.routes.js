const express = require('express');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');
const router = express.Router();
const { User } = require('../models/user');
const { Perro } = require('../models/perro')

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

    .get('/clientes/turno', autenticado, (req, res) => {
        res.render('turno')
    })

    .get('/clientes/modificar-datos', autenticado, (req, res) => {
        res.render('modificar-datos')
    })

    .get('/clientes/cargar-adopcion', autenticado, (req, res) => {
        res.render('cargar-adopcion')
    })

    .get('/clientes/listar-adopciones', autenticado, async(req, res) => {
        const usuario = await User.findById(req.user._id).populate('perrosEnAdopcion')
        console.log(usuario)
        const perros = usuario.perrosEnAdopcion;
        res.render('listarAdopcion', { perros })
    })

    .get('/clientes/modificar-adopcion', autenticado, async(req, res) => {
        let perro = await Perro.findById(req.query.id);
        res.render('modificar-adopcion', { perro });
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

    .get('/admin/modificar-usuario', [autenticado, esAdmin], async (req, res) => {
        let userMail = req.query.dato;
        let usuario = await User.findOne({ mail: userMail });
        res.render('modificar-usuario', {usuario, userMail});
    })

    .get('/admin/modificar-perro', [autenticado, esAdmin], async (req, res) => {
        let perro = await Perro.findById({ _id: req.query.id});
        res.render('modificar-perro', {perro});
    })

module.exports = router;