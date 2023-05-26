const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
  
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
})

.post('/modificar-datos', async (req, res) => {
  if (req.isAuthenticated()) {
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
  }
})

module.exports = router;

