const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { Turno, modificarEstado } = require('../models/turno')
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { Perro } = require('../models/perro');
const { Adopcion } = require('../models/adopcion');
const { Cruza } = require('../models/cruza');
const { Servicio } = require('../models/servicio');
const { sendEmail } = require('../emails');
const { Perdida } = require('../models/perdida');
const _ = require('lodash');
const moment = require('moment');

/* Endpoint para
   guardar un turno solicitado
*/
router.post('/solicitar-turno', async (req, res) => {
  const nuevoTurno = {
    nombreDelPerro: req.body.nombreDelPerro,
    rangoHorario: req.body.rango,
    dni: req.user.dni,
    motivo: req.body.motivo,
    estado: 'pendiente',
    fecha: req.body.fecha
  };
  // encuentra el usuario logueado
  let usuario = await User.findById(req.user._id);
  if (!usuario) return res.status(400).send('<script>alert("El usuario no se encontro."); window.location.href = "/clientes";</script>');
  // verifica que el perro para el cual se solicita el turno existe y este asignado en usuario
  let perrosDelUsuario = await Perro.find({ _id: { $in: usuario.perrosId } });
  let perroEncontrado = perrosDelUsuario.find(perro => perro.nombre === nuevoTurno.nombreDelPerro);
  if (!perroEncontrado) return res.status(400).send('<script>alert("No se encontro el perro con el nombre especificado."); window.location.href = "/clientes";</script>');
  // verifica que el perro tiene mas de 4 meses
  let fechaLimite = new Date(nuevoTurno.fecha);
  fechaLimite.setMonth(fechaLimite.getMonth() - 4);
  if (perroEncontrado.fechaDeNacimiento > fechaLimite) {
    if (nuevoTurno.motivo === "Vacunacion antirrabica") return res.status(400).send('<script>alert("El perro debe de tener mas de 4 meses para darse la vacuna antirrabica."); window.location.href = "/clientes";</script>');
  }
  // crea el turno
  try {
    const turno = new Turno(nuevoTurno);
    await turno.save();
    usuario.turnosId.push(turno._id);
    await usuario.save();
    return res.send('<script>alert("El turno se solicito correctamente."); window.location.href = "/clientes";</script>');
  } catch (error) {
    return res.send('<script>alert("El turno no pudo guardarse."); window.location.href = "/clientes";</script>');
  }
})

  .post('/modificar-datos', async (req, res) => {
    let { mailNuevo, contraseña1, contraseñaNueva, contraseñaNueva2 } = req.body;
    let mailActual = req.user.mail;
    let user = await User.findOne({ mail: mailActual });
    if (contraseñaNueva !== contraseñaNueva2) return res.status(400).send('<script>alert("Las contraseñas ingresadas no son iguales."); window.location.href = "/clientes";</script>');
    if (!await compararContraseñas(contraseña1, user.contraseña)) return res.status(400).send('<script>alert("La contraseña ingresada no es correcta."); window.location.href = "/clientes";</script>');
    let usuarioConMail = await User.findOne({ mail: mailNuevo });
    if (usuarioConMail) {
      if (usuarioConMail.mail !== user.mail) return res.status(400).send('<script>alert("El mail ingresado ya se encuentra en uso."); window.location.href = "/";</script>');
    }
    try {
      if (mailNuevo === "") mailNuevo = mailActual;
      if (contraseñaNueva !== "") {
        contraseñaNueva = await encriptarContraseña(contraseñaNueva);
      }
      else {
        contraseñaNueva = contraseña1;
        contraseñaNueva = await encriptarContraseña(contraseñaNueva);
      }
      await User.updateOne({ mail: mailActual }, {
        $set: {
          mail: mailNuevo,
          contraseña: contraseñaNueva
        }
      });
      return res.send('<script>alert("La modificación se realizó correctamente."); window.location.href = "/";</script>');
    } catch (error) {
      return res.send('<script>alert("La modificación no pudo realizarse."); window.location.href = "/";</script>');
    }
  })

  .get('/mis-perros', async (req, res) => {
    const usuario = await User.findById(req.user.id)
      .populate('perrosId')
    const perros = usuario.perrosId;
    res.render('listaPerros', { perros })
  })

  .post('/cargar-adopcion', async (req, res) => {
    let perroParaAdoptar = {
      nombre: req.body.nombre,
      edad: req.body.edad,
      sexo: req.body.sexo,
      color: req.body.color,
      tamaño: req.body.tamaño,
      origen: req.body.origen,
      confirmado: false,
      mail: req.user.mail
    }
    try {
      let adopcion = new Adopcion(perroParaAdoptar);
      await adopcion.save();
      req.user.perrosEnAdopcion.push(adopcion._id);
      await req.user.save();
      return res.send('<script>alert("La adopcion se cargo correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      console.log(error);
      return res.send('<script>alert("La adopcion no puedo cargarse."); window.location.href = "/clientes";</script>');
    }
  })

  .post('/modificar-adopcion', async (req, res) => {
    const { dato, nombre, edad, sexo, color, tamaño, origen } = req.body;
    try {
      await Adopcion.updateOne({ _id: dato }, {
        $set: {
          nombre: nombre,
          edad: edad,
          sexo: sexo,
          color: color,
          tamaño: tamaño,
          origen: origen
        }
      });
      return res.send('<script>alert("El perro en adopcion se modifico correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      return res.send('<script>alert("El perro en adopcion no pudo modificarse"); window.location.href = "/clientes";</script>');
    }
  })


  .get('/historial-turnos', async (req, res) => {
    try {
      const usuario = await User.findById(req.user.id).populate('turnosId')
      const turnos = usuario.turnosId;
      if (turnos.length === 0) {
        res.render('historialTurnosCliente', { turnos: turnos });
      }
      else {
        turnos.sort(compararFechas);
        res.render('historialTurnosCliente', { turnos: turnos });
      }
    } catch (error) {
      console.log('Error al obtener los turnos:', error);
      return res.status(400).send('Error al obtener los turnos');
    }
  })

  .post('/aceptar-modificacion', async (req, res) => {
    await modificarEstado(req.body.id, 'aceptado');

    res.send('<script>alert("Se aceptó la modificación.");window.location.href = "/";</script>');
  })

  .post('/rechazar-modificacion', async (req, res) => {
    await modificarEstado(req.body.id, 'rechazado');

    res.send('<script>alert("Se rechazó la modificación.");window.location.href = "/";</script>');
  })

  .get('/visualizar-tablon-adopcion', async (req, res) => {
    try {
      let adopciones = await Adopcion.find({});
      if (!adopciones) {
        res.render('tablonAdopcion', { error: 'La lista esta vacia' })
      }
      else {
        console.log(adopciones);
        res.render('tablonAdopcion', { adopciones: adopciones, usuarioActual: req.user.mail });
      }
    } catch (error) {
      console.log('Error al obtener las adopciones:', error);
      return res.status(400).send('Error al obtener las adopciones');
    }
  })

  .post('/confirmar-adopcion', async (req, res) => {
    try {
      let adopcion = await Adopcion.findById(req.body.id);
      if ((adopcion) && (adopcion.mail == req.user.mail)) {
        adopcion.confirmado = true;
        adopcion.save();
        res.send('<script>alert("La adopcion se confirmo exitosamente.");window.location.href = "/clientes/listar-adopciones";</script>');
      }
    }
    catch {
      res.send('<script>alert("La adopcion no se confirmo.");window.location.href = "/clientes/listar-adopciones";</script>');
    }
  })

  .post('/cargar-cruza', async (req, res) => {
    let camposCruza = {};
    console.log(req.body);
    if (req.body.id != 'otro') {
      const perro = await Perro.findById(req.body.id);
      camposCruza = _.pick(perro, ['sexo', 'fechaDeNacimiento', 'raza']);
      camposCruza.fechaDeCelo = req.body.fechaDeCelo;
    } else {
      camposCruza = _.pick(req.body, ['sexo', 'fechaDeNacimiento', 'raza', 'fechaDeCelo']);
    }
    camposCruza.mail = req.user.mail;

    const cruza = new Cruza(camposCruza);
    await cruza.save();
    console.log('cruza : ', cruza.fechaDeNacimiento);
    req.user.perrosEnCruza.push(cruza._id);
    await req.user.save();

    return res.send('<script>alert("La cruza se cargó correctamente."); window.location.href = "/clientes";</script>');
  })


  .post('/modificar-cruza', async (req, res) => {
    const { id, raza, sexo, fechaDeCelo, fechaDeNacimiento } = req.body;
    //const cruzaModificar = await Cruza.findById(id);
    console.log("fechaDeCelo de req", req.body.fechaDeCelo, "fechaDeCelo de coso", fechaDeCelo);
    try {
      await Cruza.updateOne({ _id: id }, {
        $set: {
          raza: raza,
          sexo: sexo,
          fechaDeCelo: fechaDeCelo,
          fechaDeNacimiento: fechaDeNacimiento,
          mail: req.user.mail
        }
      });
      return res.send('<script>alert("La modificacion de la cruza se realizo correctamente"); window.location.href = "/clientes/listar-cruza";</script>');
    } catch (error) {
      console.log(error);
      return res.send('<script>alert("La modificacion de la cruza no pudo realizarse"); window.location.href = "/clientes/listar-cruza";</script>');
    }
  })

  .post('/eliminar-cruza', async (req, res) => {//IMPORTANTE recibir el mail asociado a la cruza a eliminar.
    try {
      // Obtener la cruza que deseas eliminar
      const cruza = await Cruza.findOneAndDelete({ _id: req.body.id }); //Ver esto, creo q el mail que hay en cruza es del usuario dueño de la publi
      if (cruza) {
        return res.status(400).send('<script>alert("La publicacion de cruza fue eliminada exitosamente."); window.location.href = "/clientes/listar-cruza";</script>');//esto no deberia pasar porque ejecutas desde el listar,tonces no falla
      }
      //elimino
      //await Cruza.deleteOne({ mail: req.body.dato });
      return res.status(400).send('<script>alert("La publicacion de cruza fue eliminada exitosamente."); window.location.href = "/clientes/listar-cruza";</script>');//VER ESTO, arreglar endpoint al visualizar tablon
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/recomendar-perro', async (req, res) => {
    try {
      const cruzaUsuario = await Cruza.findOne({ _id: req.body.id });

      if (cruzaUsuario) {
        const fechaCeloPerro = Math.floor(cruzaUsuario.fechaDeCelo.getTime() / (1000 * 60 * 60 * 24));

        const perroRecomendado = await Cruza.findOne({
          _id: { $ne: cruzaUsuario._id },
          sexo: { $ne: cruzaUsuario.sexo },
          raza: cruzaUsuario.raza,
          fechaDeCelo: {
            $gte: new Date(cruzaUsuario.fechaDeCelo.getTime() - 5 * 24 * 60 * 60 * 1000),
            $lte: new Date(cruzaUsuario.fechaDeCelo.getTime() + 5 * 24 * 60 * 60 * 1000)
          }
        });

        if (perroRecomendado) {
          res.render('recomendarPerro', { perroRecomendado: perroRecomendado });
        } else {
          return res.status(400).send('<script>alert("El sistema no tiene un perro que cumpla los requisitos para ser recomendado."); window.location.href = "/clientes/listar-cruza";</script>');
        }
      } else {
        return res.status(400).send('<script>alert("No se encontró la cruza solicitada."); window.location.href = "/clientes/listar-cruza";</script>');
      }
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/confirmar-anuncio', async (req, res) => {
    try {
      Perdida.findByIdAndUpdate(req.body.id, { confirmado: true })
        .then(documentoActualizado => {
          console.log('Documento actualizado:', documentoActualizado);
          res.send('<script>alert("El anuncio fue confirmado con exito"); window.location.href = "/clientes/listar-anuncios";</script>');
        })
        .catch(error => {
          console.error('Error al actualizar el documento:', error);
          res.status(500).send('<script>alert("Error al confirmar el anuncio"); window.location.href = "/clientes/listar-anuncios";</script>');
        });
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/cargar-anuncio', async (req, res) => {
    let perroPerdido = {
      nombre: req.body.nombre,
      sexo: req.body.sexo,
      raza: req.body.raza,
      color: req.body.color,
      confirmado: false,
      mail: req.user.mail,
      foto: req.body.foto
    }
    try {
      let perdido = new Perdida(perroPerdido);
      await perdido.save();
      req.user.anuncios.push(perdido._id);
      await req.user.save();
      return res.send('<script>alert("El anuncio se cargo correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      console.log(error);
      return res.send('<script>alert("El anuncio no puedo cargarse."); window.location.href = "/clientes";</script>');
    }
  })

  .post('/modificar-anuncio', async (req, res) => {
    const { dato, nombre, sexo, raza, color, foto } = req.body;
    try {
      await Perdida.updateOne({ _id: dato }, {
        $set: {
          nombre: nombre,
          sexo: sexo,
          raza: raza,
          color: color,
          foto: foto
        }
      });
      return res.send('<script>alert("El perro en anuncio se modifico correctamente."); window.location.href = "/clientes/listar-anuncios";</script>');
    } catch (error) {
      return res.send('<script>alert("El perro en anuncio no pudo modificarse"); window.location.href = "/clientes/listar-anuncios";</script>');
    }
  })

function compararFechas(a, b) {
  const fechaA = new Date(a.fecha);
  const fechaB = new Date(b.fecha);
  return fechaA - fechaB;
}
module.exports = router;