const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { Turno, modificarEstado } = require('../models/turno')
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { Perro } = require('../models/perro');
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
  if (!usuario) return res.status(400).send('No se encontro el usuario.');
  // verifica que el perro para el cual se solicita el turno existe y este asignado en usuario
  let perrosDelUsuario = await Perro.find({ _id: { $in: usuario.perrosId } });
  let perroEncontrado = perrosDelUsuario.find(perro => perro.nombre === nuevoTurno.nombreDelPerro);
  if (!perroEncontrado) return res.status(400).send('No se encontró el perro con el nombre especificado.');
  // verifica que el perro tiene mas de 4 meses
  let fechaLimite = new Date(nuevoTurno.fecha);
  fechaLimite.setMonth(fechaLimite.getMonth() - 4);
  if (perroEncontrado.fechaDeNacimiento > fechaLimite) {
    if (nuevoTurno.motivo === "Vacunacion antirrabica") return res.status(400).send('El perro debe tener al menos 4 meses para recibir la vacunación antirrábica.');
  }
    // crea el turno
  try {
    const turno = new Turno(nuevoTurno);
    await turno.save();
    usuario.turnosId.push(turno._id);
    res.redirect('/');
  } catch (error) {
    console.log(error)
    return res.json({
      resultado: false,
      msg: 'El turno no se pudo guardar',
      error: error
    });
  }
})

.post('/modificar-datos', async (req, res) => {
  let { mailNuevo, contraseña1, contraseña2 } = req.body;
  let mailActual = req.user.mail;
  let user = await User.findOne({ mail: mailActual });
  if (!await compararContraseñas(contraseña1, user.contraseña)) return res.status(400).json('La contraseña ingresada no es correcta')
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
    return res.redirect('/');
  } catch (error) {
    return res.json({
      resultado: false,
      msg: 'El usuario no se pudo modificar',
      error
    });
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
      res.render('historialTurnos', { error: 'La lista esta vacia' });
    }
    else {
      res.render('historialTurnos', { turnos: turnos });
    }
  } catch (error) {
    console.log('Error al obtener los turnos:', error);
    return res.status(400).send('Error al obtener los turnos');
  }
})


.post('/aceptar-modificacion', async(req,res) => {
  modificarEstado(req.body.turno.id, 'aceptado');
  
  res.send('Turno aceptado con exito.');
})

.post('/rechazar-modificacion', async(req,res) => {
  modificarEstado(req.body.turno.id, 'rechazado');
  
  res.send('Turno rechazado con exito.');
})

module.exports = router;