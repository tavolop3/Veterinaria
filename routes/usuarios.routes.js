const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const { default: mongoose } = require('mongoose');
const {User} = require('../models/user');
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

/*  el metodo permite que un usuari
    realize la modificacion
    de su mail o contraseña
*/
.post('/modificar-datos', async (req, res) => {
    const { mail1, mail2, contraseña1, contraseña2 } = req.body;
    let user = await User.findOne({ mail: mail1 });
    if (!user) return res.status(400).send('El mail ingresado no pertenece a ningun usuario en el sistema');
    if (!await bcrypt.compare(contraseña1, user.contraseña)) return res.status(400).send('La contraseña ingresada no es correcta');
    if (mail2 === "") mail2 = mail1;
    if (contraseña2 === "") contraseña2 = contraseña1;
    try {
      const salt = await bcrypt.genSalt(10);
      user.contraseña = bcrypt.hash(salt);
      await User.updateOne({ mail: mail1 }, { $set: {
        mail: mail2,
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

