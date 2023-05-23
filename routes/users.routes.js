const bcrypt = require('bcrypt');
const {User, validateCreate, validateLogin} = require('../models/user');
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const passport = require('passport');
const { default: mongoose } = require('mongoose');
const { func } = require('joi');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    // Redirige a la página de inicio de sesión si el usuario no está autenticado
    res.render('login', { error: 'Se debe autenticar '}); 
  };

router.get('/yo', isAuthenticated, async(req,res) => {
    res.send(req.user);
})

.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true,
}))

.post('/registrar', async (req,res) => {
    const { error } = validateCreate(req.body); 
    if(error) return res.status(400).render('registro', { error });

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['nombre','apellido','mail','telefono','dni']));

    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash('contraRandom', salt);

    await user.save();    

    req.login(user, function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });

    // res.send(user);
})

module.exports = router;