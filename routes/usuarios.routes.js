const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const { default: mongoose } = require('mongoose');
const {User, encriptarContraseña} = require('../models/user');
const bcrypt = require('bcrypt');

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

/*  el metodo permite que un usuario
    realize la modificacion
    de su mail o contraseña
*/
.post('/modificar-datos', async (req, res) => {
    let { mailNuevo, contraseña1, contraseña2 } = req.body;
    let mailActual = req.user.mail;
    let user = await User.findOne({ mail: mailActual });
    if (!await bcrypt.compare(contraseña1, user.contraseña)) return res.status(400).json('La contraseña ingresada no es correcta');
    try {
      if (mailNuevo === "") mailNuevo = mailActual;
      if (contraseña2 !== "") {
        contraseña2 = await encriptarContraseña(contraseña2);
      }
      else {
        contraseña2 = contraseña1;
        contraseña2 = await encriptarContraseña(contraseña2);
      }
      await User.updateOne({ mail: mailActual }, { $set: {
        mail: mailNuevo,
        contraseña: contraseña2
      }});
      return res.redirect('/');
    } catch (error) {
      return res.json({
        resultado: false,
        msg: 'El usuario no se pudo modificar',
        error
      });
    }
})
  
.get('/cerrar-sesion', function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


module.exports = router;

