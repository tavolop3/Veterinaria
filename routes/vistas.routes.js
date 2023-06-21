const express = require('express');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');
const router = express.Router();
const { User } = require('../models/user');
const { Perro } = require('../models/perro');
const { Adopcion } = require('../models/adopcion');
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

    .get('/usuarios/visualizar-tablon-adopcion', async (req, res) => {
        try {
            let adopciones = await Adopcion.find({});
            if (!adopciones) {
                res.render('tablonAdopcion', { error: 'No hay adopciones cargadas en el sistema.' })
            }
            else {
                let mail = "";
                if (req.isAuthenticated())
                    mail = req.user.mail;
                res.render('tablonAdopcion', { adopciones: adopciones, usuarioActual: mail });
            }
        } catch (error) {
            console.log('Error al obtener las adopciones:', error);
            return res.status(400).send('Error al obtener las adopciones');
        }
    })

    .get('/usuarios/visualizar-tablon-servicios', async (req, res) => {
        try {
            let servicios = await Servicio.find({});
            if (!servicios) {
                res.render('tablonServiciosCliente', { error: 'No hay paseadores o cuidadores cargados' })
            }
            else {
                res.render('tablonServiciosCliente', { servicios: servicios });
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
                res.render('tablonServiciosCliente', { error: 'No hay postulaciones cargadas en el sistema.' })
            }
            else {
                let mail = "";
                if (req.isAuthenticated())
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
        let usuario = {};
        usuario.nombre = req.user.nombre;
        usuario.rol = 'Usuario'
        res.render('indexCliente', { usuario })
    })

    .get('/clientes/turno', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user.id).populate('perrosId')
        const perros = usuario.perrosId;
        res.render('turno', { perros });
    })

    .get('/clientes/modificar-datos', autenticado, (req, res) => {
        res.render('modificar-datos');
    })

    .get('/clientes/cargar-adopcion', autenticado, (req, res) => {
        res.render('cargar-adopcion')
    })

    .get('/clientes/listar-adopciones', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user._id).populate('perrosEnAdopcion')
        const perros = usuario.perrosEnAdopcion;
        res.render('listarAdopcion', { perros })
    })

    .get('/clientes/modificar-adopcion', autenticado, async (req, res) => {
        let id = req.query.dato;
        let perro = await Adopcion.findById(id);
        res.render('modificar-adopcion', { perro });
    })

    .get('/clientes/adopcion', autenticado, (req, res) => {
        res.render('funcionesCliente/adopcion');
    })

    .get('/clientes/turnos', autenticado, (req, res) => {
        res.render('funcionesCliente/turnos');
    })

    // ------------------- ADMIN -------------------------

    .get('/admin', [autenticado, esAdmin], (req, res) => {
        let usuario = {};
        usuario.nombre = req.user.nombre;
        usuario.rol = 'Administrador'
        res.render('indexAdmin', { usuario });
    })

    .get('/admin/registrar-usuario', [autenticado, esAdmin], (req, res) => {
        res.render('registro-usuario');
    })

    .get('/admin/modificar-usuario', [autenticado, esAdmin], async (req, res) => {
        let userMail = req.query.dato;
        let usuario = await User.findOne({ mail: userMail })
        res.render('modificar-usuario', { usuario, userMail })
    })

    .get('/admin/modificar-perro', [autenticado, esAdmin], async (req, res) => {
        mailUsuario = req.query.mailUsuario
        let perro = await Perro.findById({ _id: req.query.id });
        console.log(mailUsuario);
        res.render('modificar-perro', { perro, mailUsuario });
    })

    .get('/admin/registrar-perro', [autenticado, esAdmin], (req, res) => {
        res.render('registro-perro');
    })

    .get('/admin/eliminar-perro', [autenticado, esAdmin], (req, res) => {
        res.render('eliminar-perro');
    })

    .get('/admin/cargar/paseador-cuidador', [autenticado, esAdmin], async (req, res) => {
        res.render('cargar-paseador-cuidador');
    })

    .get('/admin/modificar-servicio', [autenticado, esAdmin], async (req, res) => {
        let servicio = await Servicio.findById(req.query.id);
        res.render('modificar-servicio', { servicio });
    })

    .get('/admin/cargar/paseador-cuidador', [autenticado, esAdmin], async (req, res) => {
        res.render('cargar-paseador-cuidador');
    })

    .get('/admin/modificar-servicio', [autenticado, esAdmin], async (req, res) => {
        let servicio = await Servicio.findById(req.query.id);
        res.render('modificar-servicio', { servicio });
    })

    .get('/admin/usuarios', [autenticado, esAdmin], async (req, res) => {
        res.render('funcionesAdmin/usuarios');
    })

    .get('/admin/turnos', [autenticado, esAdmin], async (req, res) => {
        res.render('funcionesAdmin/turnos');
    })

    .get('/admin/servicios', [autenticado, esAdmin], async (req, res) => {
        res.render('funcionesAdmin/servicios');
    })

    .get('/admin/cargar-servicio', [autenticado, esAdmin], async (req, res) => {
        res.render('cargar-paseador-cuidador');
    })

module.exports = router;