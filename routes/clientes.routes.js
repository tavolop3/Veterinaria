const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { default: mongoose } = require('mongoose');
const Turno = require('../models/turno')

// Para modificar la contraseña en el primer ingreso
router.post('/modificar-pass',autenticado,async(req,res) => {
    const user = User.findById(req.user._id);

    if(req.body.contraseña1 != req.body.contraseña2)
      res.redirect('/usuarios/modificar-pass', { error : 'Las contraseñas deben ser iguales' })
    
    user.contraseña = await encriptarContraseña(req.body.contraseña1);
    user.primerLogin = false;

    await user.save();
})

/* Endpoint para
   guardar un turno solicitado
*/
.post('/solicitar-turno', async(req, res) => {
  const nuevoTurno = {
    nombreDelPerro: req.body.nombreDelPerro,
    rangoHorario: req.body.rango,
    dni: req.body.dni,
    motivo: req.body.motivo,
    estado: 'Pendiente',
    fecha: req.body.fecha
  };
  try {
    const turno = new Turno(nuevoTurno);
    await turno.save();
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

module.exports = router;