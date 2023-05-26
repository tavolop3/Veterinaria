const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { Turno } = require('../models/turno')
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { Perro } = require('../models/perro')

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

.get('/mis-perros', (req,res) => {
  User.find(req.body.mail)
      .populate('perrosId')
      .exec((err,perros) => {
        if(err)
          console.error(err);
        else
          console.log(perros);
      })
    res.render('listaPerros', { perros : [] })
})

module.exports = router;