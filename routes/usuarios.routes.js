const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const Joi = require('joi');

// Para ver el usuario actual
router.get('/yo', autenticado, async(req,res) => {
    res.send(req.user);
})

// Endpoint para la autenticación
.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true,
    passReqToCallback: true
    // TODO ver si es admin o usuario comun y redireccionar acorde
}))

// Para modificar la contraseña en el primer ingreso
.post('/modificar-pass',autenticado,async(req,res) => {
  const contraseña1 = req.body.contraseña1;
  const contraseña2 = req.body.contraseña2;

  const { error } = Joi.object({
    contraseña1: Joi.string().min(3).max(255).required(),
    contraseña2: Joi.any().valid(Joi.ref('contraseña1')).required().messages({'any.only': 'Las contraseñas deben coincidir'})
  }).validate(req.body)
  // TODO seguir con modificar pass, habria que mostrar el mensaje o modificarla y redirijir a /cliente o /admin que podria reutilizar la logica del otro modulo 
  if(error)
    res.render('/usuarios/modificar-pass', { error : error.message })
  
  const usuario = User.findById(req.user._id);

  usuario.contraseña = await encriptarContraseña(req.body.contraseña1);
  usuario.primerLogin = false;

  await user.save();
})

module.exports = router;

