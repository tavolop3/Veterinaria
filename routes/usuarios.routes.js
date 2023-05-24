const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');

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
    req.login(user, async loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        if(user.contraseña === user.contraseñaDefault) {
          res.render('modificar-datos',{ error : 'Debe modificar su contraseña por seguridad.', primerLogin: true})
        } else {
          res.redirect('/');
        }     
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

