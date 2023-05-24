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
    successRedirect: '/usuarios/redirigirLogin',
    failWithError: true,
    failureFlash: true,
    passReqToCallback: true
    // TODO ver si es admin o usuario comun y redireccionar acorde
    // TODO redirigir a /usuarios/modificar/datos si tiene la contraseña default
}), (req,res) => {
    res.render("login", { error: "Unable to login, the password or the username are wrong" });// TODO arreglar esto
})

.get('/redirigirLogin', (req,res) => {
    if(req.user.isAdmin === true){
      res.render('indexAdmin');
    } else {
      res.render('indexCliente');
    }
})

module.exports = router;

