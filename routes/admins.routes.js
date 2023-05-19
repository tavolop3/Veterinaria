const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const {User, validateCreate, encriptarContraseña} = require('../models/user');
const _ = require('lodash');

router.post('/registrar-usuario', async (req,res) => {
    const { error } = validateCreate(req.body); 
    if(error) return res.status(400).render('registro', { error });

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['nombre','apellido','mail','telefono','dni']));

    user.primerLogin = true;
    const contraRandom = crypto.randomBytes(8).toString('hex');
    // TODO enviar mail con la contraseña
    console.log(contraRandom);
    user.contraseña = await encriptarContraseña(contraRandom);
    await user.save();    

    res.redirect('/admin'); 
})

module.exports = router;
