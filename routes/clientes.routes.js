const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { Turno, modificarEstado } = require('../models/turno')
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { Perro } = require('../models/perro');
const { Adopcion } = require('../models/adopcion');
const { Servicio } = require('../models/servicio');
const { sendEmail } = require('../emails');

/* Endpoint para
   guardar un turno solicitado
*/
router.post('/solicitar-turno', async (req, res) => {
  const nuevoTurno = {
    nombreDelPerro: req.body.nombreDelPerro,
    rangoHorario: req.body.rango,
    dni: req.user.dni,
    motivo: req.body.motivo,
    estado: 'Pendiente',
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
    let { mailNuevo, contraseña1, contraseña2 } = req.body;
    let mailActual = req.user.mail;
    let user = await User.findOne({ mail: mailActual });
    if (!await compararContraseñas(contraseña1, user.contraseña)) return res.status(400).send('<script>alert("La contraseña ingresada no es correcta."); window.location.href = "/clientes";</script>');
    let usuarioConMail = await User.findOne({ mail: mailNuevo });
    if (usuarioConMail) {
      if (usuarioConMail.mail !== user.mail) return res.status(400).send('<script>alert("El mail ingresado ya se encuentra en uso."); window.location.href = "/clientes";</script>');
    }
    try {
      if (mailNuevo === "") mailNuevo = mailActual;
      if (contraseña2 !== "") {
        contraseña2 = await encriptarContraseña(contraseña2);
      }
      else {
        contraseña2 = contraseña1;
        contraseña2 = await encriptarContraseña(contraseña2);
      }
      await User.updateOne({ mail: mailActual }, {
        $set: {
          mail: mailNuevo,
          contraseña: contraseña2
        }
      });
      return res.send('<script>alert("La modificación se realizó correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      return res.send('<script>alert("La modificación no pudo realizarse."); window.location.href = "/clientes";</script>');
    }
  })

  .get('/mis-perros', async (req, res) => {
    const usuario = await User.findById(req.user.id)
      .populate('perrosId')
    const perros = usuario.perrosId;
    res.render('listaPerros', { perros })
  })


  .get('/historial-turnos', async (req, res) => {
    try {
      const usuario = await User.findById(req.user.id).populate('turnosId')
      const turnos = usuario.turnosId;
      if (turnos.length === 0) {
        res.render('historialTurnosCliente', { error: 'La lista esta vacia' });
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
        res.render('tablonAdopcion', { adopciones: adopciones });
      }
    } catch (error) {
      console.log('Error al obtener las adopciones:', error);
      return res.status(400).send('Error al obtener las adopciones');
    }
  })

  .get('/visualizar-tablon-servicios', async (req, res) => {
    try {
      let servicios = await Servicio.find({});
      if (!servicios) {
        res.render('tablonServiciosCliente', { error: 'La lista esta vacia' })
      }
      else {
        res.render('tablonServiciosCliente', { servicios: servicios });
      }
    } catch (error) {
      console.log('Error al obtener los servicios:', error);
      return res.status(400).send('Error al obtener los servicios');
    }
  })

  .post('/confirmar-adopcion', async (req, res) => {
    try {
      let adopcion = await Adopcion.findById(req.body.id);
      if ((adopcion) && (adopcion.mail == req.user.mail)) {
        adopcion.confirmado = true;
        adopcion.save();
        res.send('<script>alert("La adopcion se confirmo exitosamente.");window.location.href = "/";</script>');
      }
    }
    catch {
      res.send('<script>alert("La adopcion no se confirmo.");window.location.href = "/";</script>');
    }
  })


function compararFechas(a, b) {
  const fechaA = new Date(a.fecha);
  const fechaB = new Date(b.fecha);
  return fechaA - fechaB;
}
module.exports = router;