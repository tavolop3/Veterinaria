const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const {compararContraseñas} = require('../models/user');

// Para ver el usuario actual
router.get('/yo', autenticado, async(req,res) => {
    res.send(req.user);
})

.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); 
    }
    if (!user) {
      return res.render('login', { error: req.flash('signinMessage')});
    }
    // TODO redirigir a /usuarios/modificar-datos si tiene la contraseña default
    req.login(user, async loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        tieneContraseñaOriginal = await compararContraseñas(user.contraseña,user.contraseñaDefault);
        if(tieneContraseñaOriginal) {
          res.render('modificar-datos',{ error: 'Debe modificar su contraseña por seguridad.', primerLogin: true})
        }
        res.redirect('/');     
      }
    });      
  })(req, res, next);
})

.get('/cerrar-sesion', function(req, res){
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
  });
});

module.exports = router;

