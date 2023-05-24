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
// .post('/login', passport.authenticate('local', {
//     successRedirect: '/usuarios/redirigirLogin',
//     failureFlash: true,
//     passReqToCallback: true
//     // TODO ver si es admin o usuario comun y redireccionar acorde
//     // TODO redirigir a /usuarios/modificar/datos si tiene la contraseña default
// }), (req,res) => {
//     if(!req.user)
//       res.render("login", { error: "Unable to login, the password or the username are wrong" });// TODO arreglar esto
// })

.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.render('login', { error: req.flash('signinMessage')});
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        if(req.user.isAdmin){
          res.render('indexAdmin');
        } else {
          res.render('indexCliente');
        }
      }
    });      
  })(req, res, next);
})

module.exports = router;

