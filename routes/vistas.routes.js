const express = require('express');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');
const router = express.Router();
const { User } = require('../models/user');
const { Perro } = require('../models/perro');
const { Adopcion } = require('../models/adopcion');
const { Servicio } = require('../models/servicio');
const { Cruza } = require('../models/cruza');
const { Perdida } = require('../models/perdida');
const { Donacion } = require('../models/donacion');
const { Turno } = require('../models/turno');
const { PuntoUrgencia } = require('../models/puntoUrgencia');
const MailMessage = require('nodemailer/lib/mailer/mail-message');

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

    // .get('/usuarios/visualizar-tablon-servicios', async (req, res) => {
    //     try {
    //         let servicios = await Servicio.find({});
    //         if (!servicios) {
    //             res.render('tablonServiciosCliente', { error: 'No hay paseadores o cuidadores cargados' })
    //         }
    //         else {
    //             res.render('tablonServiciosCliente', { servicios: servicios });
    //         }
    //     } catch (error) {
    //         console.log('Error al obtener los servicios:', error);
    //         return res.status(400).send('Error al obtener los servicios');
    //     }
    // })

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


    /* .get('/usuarios/visualizar-tablon-servicios', async (req, res) => {
        let dato = req.isAuthenticated();
        console.log(req.isAuthenticated());
        console.log(dato);
        try {
            let servicios = await Servicio.find({});
            if (!servicios) {
                res.render('tablonServiciosCliente', { error: 'No hay paseadores o cuidadores cargados', dato })
            }
            else {
                res.render('tablonServiciosCliente', { servicios, dato });
            }
        } catch (error) {
            console.log('Error al obtener los servicios:', error);
            return res.status(400).send('Error al obtener los servicios');
        }
    })
    */

    .get('/usuarios/visualizar-tablon-cruza', async (req, res) => {
        try {
            let mail = "";
            if (req.isAuthenticated())
                mail = req.user.mail;
            let cruzas = (await Cruza.find({})).filter(cruza => cruza.mail !== mail);
            res.render('tablonCruza', { cruzas: cruzas, usuarioActual: mail });
        } catch (error) {
            console.log('Error al obtener las cruzas:', error);
            return res.status(400).send('Error al obtener las cruzas');
        }
    })
    .get('/usuarios/visualizar-tablon-perdida', async (req, res) => {
        try {
            let mail = "";
            if (req.isAuthenticated())
                mail = req.user.mail;
            let perdidas = (await Perdida.find({})).filter(perdida => perdida.mail !== mail);
            res.render('tablonPerdida', { perdidas: perdidas, usuarioActual: mail });
        } catch (error) {
            console.log('Error al obtener las busquedas/perdidas:', error);
            return res.status(400).send('Error al obtener las busquedas/perdidas');
        }
    })

    .get('/urgencias', async(req, res) => {
        var rol = '';
        if(req.user)
            rol = 'cliente'
    
        puntos = await PuntoUrgencia.find({});

        res.render('urgencias/urgencias', {puntos, rol});
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
        let dato = req.user.isAdmin;
        res.render('modificar-datos', { dato });
    })

    .get('/clientes/cargar-adopcion', autenticado, (req, res) => {
        res.render('cargar-adopcion')
    })

    .get('/clientes/listar-adopciones', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user._id).populate('perrosEnAdopcion')
        const perros = usuario.perrosEnAdopcion;
        res.render('listarAdopcion', { perros })
    })

    .get('/clientes/listar-cruza', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user._id).populate('perrosEnCruza')
        const perros = usuario.perrosEnCruza;
        res.render('listarCruza', { perros })
    })

    .get('/clientes/listar-anuncios', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user._id).populate('anuncios')
        const anuncios = usuario.anuncios;
        res.render('listarAnuncios', { anuncios })
    })

    .get('/clientes/modificar-adopcion', autenticado, async (req, res) => {
        let id = req.query.dato;
        let perro = await Adopcion.findById(id);
        res.render('modificar-adopcion', { perro });
    })



    .get('/clientes/modificar-cruza', autenticado, async (req, res) => {
        let id = req.query.dato;
        let cruza = await Cruza.findById(id);
        res.render('modificar-cruza', { cruza });
    })

    .get('/clientes/adopcion', autenticado, (req, res) => {
        res.render('funcionesCliente/adopcion');
    })

    .get('/clientes/turnos', autenticado, (req, res) => {
        res.render('funcionesCliente/turnos');
    })

    .get('/clientes/cruza', autenticado, (req, res) => {
        res.render('funcionesCliente/cruza');
    })

    .get('/clientes/cargar-cruza', autenticado, async (req, res) => {
        const usuario = await User.findById(req.user.id).populate('perrosId')
        const perros = usuario.perrosId;
        res.render('cargar-cruza', { perros });
    })

    .get('/clientes/anuncio', autenticado, (req, res) => {
        res.render('funcionesCliente/anuncio');
    })

    .get('/clientes/cargar-anuncio', autenticado, (req, res) => {
        res.render('cargar-anuncio')
    })

    .get('/clientes/modificar-anuncio', autenticado, async (req, res) => {
        let id = req.query.dato;
        let perro = await Perdida.findById(id);
        res.render('modificar-anuncio', { perro });
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
        res.render('registro-perro', { mail: req.query.mail });
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

    .get('/admin/donaciones', [autenticado, esAdmin], async (req, res) => {
        res.render('funcionesAdmin/donaciones');
    })

    .get('/admin/cargar-donacion', [autenticado, esAdmin], async (req, res) => {
        res.render('cargar-donacion');
    })

    .get('/admin/cargar-servicio', [autenticado, esAdmin], async (req, res) => {
        res.render('cargar-paseador-cuidador');
    })

    .get('/admin/urgencias',[autenticado, esAdmin], async(req, res) => {    
        puntos = await PuntoUrgencia.find({});

        res.render('funcionesAdmin/urgencias', {puntos});
    })

    .get('/admin/cargarSucursal', [autenticado, esAdmin], async(req, res) => {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        res.render('funcionesAdmin/cargarSucursal', { latlng: [lat,lng] } );
    })

    .get('/admin/modificar-sucursal', [autenticado, esAdmin], async(req, res) => {
        const sucursal = await PuntoUrgencia.findById(req.query.id);
        res.render('funcionesAdmin/modificarSucursal', { sucursal } );
    })

    .get('/admin/cobrar-turno', [autenticado, esAdmin], async (req, res) => {
        let id = req.query.id;
        let turno = await Turno.findById(id);
        let usuario = await User.findOne({ dni: turno.dni });
        console.log(usuario.montoDescuento);
        res.render('pagar-turno', { id: id, montoDescuento: usuario.montoDescuento });
    })

    .get('/admin/modificar-donacion', autenticado, async (req, res) => {
        let id = req.query.dato;
        let donacion = await Donacion.findById(id);
        res.render('modificar-donacion', { donacion });
    })

module.exports = router;