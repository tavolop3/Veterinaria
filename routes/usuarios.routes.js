const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');

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

module.exports = router;

