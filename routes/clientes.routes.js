const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');
const { default: mongoose } = require('mongoose');
const Turno = require('../models/turno')



/* Endpoint para
   guardar un turno solicitado
*/
router.post('/solicitar-turno', async(req, res) => {
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