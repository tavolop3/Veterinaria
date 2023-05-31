const express = require('express');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');
const router = express.Router();
const { User } = require('../models/user');
const { Perro } = require('../models/perro');
const { Servicio } = require('../models/servicio');

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

    .get('/usuarios/visualizar-tablon-servicios', async (req, res) => {
        try {
            let servicios = await Servicio.find({});
            if (!servicios) {
                res.render('tablonServiciosCliente', { error: 'No hay postulaciones cargadas en el sistema.' })
            }
            else {
                let mail = "";
                if(req.isAuthenticated())
                    mail = req.user.mail;    
                res.render('tablonServiciosCliente', { servicios, usuarioActual: mail });
            }
        } catch (error) {
            console.log('Error al obtener los servicios:', error);
            return res.status(400).send('Error al obtener los servicios');
        }
        })

        .get('/usuarios/visualizar-tablon-servicios', async (req, res) => {
            try {
                let servicios = await Servicio.find({});
                if (!servicios) {
                res.render('tablonServiciosCliente', { error: 'No hay paseadores o cuidadores cargados' })
                }
                else {
                res.render('tablonServiciosCliente', { servicios });
                }
            } catch (error) {
                console.log('Error al obtener los servicios:', error);
                return res.status(400).send('Error al obtener los servicios');
            }
        })

    // ------------------- CLIENTES -------------------------

    .get('/clientes', autenticado, (req, res) => {
        res.render('indexCliente')
    })

    .get('/clientes/turno', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user.id).populate('perrosId')
        const perros = usuario.perrosId;
        res.render('turno', { perros });
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

    .get('/admin/cargar/paseador-cuidador', [autenticado, esAdmin], async(req, res) => {
        res.render('cargar-paseador-cuidador');
    })

    .get('/admin/modificar-servicio', [autenticado, esAdmin], async(req, res) => {
        let servicio = await Servicio.findById(req.query.id);
        res.render('modificar-servicio', {servicio});
    })

    .get('/admin/cargar/paseador-cuidador', [autenticado, esAdmin], async(req, res) => {
        res.render('cargar-paseador-cuidador');
    })
    
    .get('/admin/modificar-servicio', [autenticado, esAdmin], async(req, res) => {
        let servicio = await Servicio.findById(req.query.id);
        res.render('modificar-servicio', {servicio});
    })

module.exports = router;