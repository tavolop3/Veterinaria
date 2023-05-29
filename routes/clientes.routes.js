const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { Turno } = require('../models/turno')
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { Perro } = require('../models/perro')
const { Adopcion } = require('../models/adopcion')
const { sendEmail } = require('../emails');

/* Endpoint para
   guardar un turno solicitado
*/
router.post('/solicitar-turno', async (req, res) => {
  const nuevoTurno = {
    nombreDelPerro: req.body.nombreDelPerro,
    rangoHorario: req.body.rango,
    dni: req.body.dni,
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
  fechaLimite.setMonth(nuevoTurno.fecha.getMonth() - 4);
  if (perroEncontrado.fecha > fechaLimite) return res.status(400).send('El perro debe tener al menos 4 meses para solicitar un turno.');
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

.get('/mis-perros', async(req,res) => {
  const usuario = await User.findById(req.user.id)
                            .populate('perrosId')
  const perros = usuario.perrosId;
  res.render('listaPerros', { perros })
})

.post('/cargar-adopcion', async(req, res) => {
  perroParaAdoptar = {
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
      return res.send('<script>alert("La adopcion se cargo correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      return res.send('<script>alert("La adopcion no puedo cargarse."); window.location.href = "/clientes";</script>');
    }
})

.post('/adopcion/solicitar', (req,res) => {
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  // await sendEmail(req.user.mail,'OhMyDog - Solicitud de adpopción enviada',
  //     'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mail + ' para poder coordinar la adopción.' 
  // );

  res.send('La solicitud fue enviada.');
})

.post('/adopcion/confirmar', async(req,res) => {
  await Adopcion.findByIdAndUpdate(req.body.id, { confirmado: true });

  res.send('La solicitud fue enviada.');
})

.post('/modificar-adopcion', async(req, res) => {
  const { dato, nombre, sexo, color, tamaño, origen } = req.body;   
    try {
      await Adopcion.updateOne({ _id: dato }, { $set: {
        nombre: nombre,
        edad: edad,
        sexo: sexo,
        color: color,
        tamaño: tamaño,
        origen: origen
      } 
    });
      return res.send('<script>alert("El perro en adopcion se cargo correctamente."); window.location.href = "/clientes";</script>');
    } catch (error) {
      return res.send('<script>alert("El perro en adopcion no pudo modificarse"); window.location.href = "/clientes";</script>');
    }
})

module.exports = router;