const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const {User, validateCreate, encriptarContraseña} = require('../models/user');
const _ = require('lodash');
const { sendEmail } = require('../emails');

router.post('/registrar-usuario', async (req,res) => {
    const { error } = validateCreate(req.body); 
    if(error) return res.status(400).render('registro', { error });

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['nombre','apellido','mail','telefono','dni']));

    user.primerLogin = true;
    const contraRandom = crypto.randomBytes(8).toString('hex');
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // sendEmail(user.mail,'OhMyDog - Contraseña predefinida',
    //     'Bienvenido a OhMyDog, tu cuenta fue creada con exito. Tu contraseña para el primer ingreso va a ser '+ contraRandom + ' es importante que la cambies ni bien accedas por motivos de seguridad, gracias.'
    // );
    console.log('Contraseña generada:' + contraRandom);
    user.contraseña = await encriptarContraseña(contraRandom);
    await user.save();    

    res.redirect('/admin'); 
})

.post('modificar-usuario', async (req, res) => {
    const { usuario } = req.body.usuario;
    let user = await User.findById( { _id: usuario._id} );
    if (!user) return res.status(400).send('No se encontro el usuario');
    let updatedFields = {};
    if (usuario.mail !== '') updatedFields.mail = mail;
    if (usuario.nombre !== '') updatedFields.nombre = nombre;
    if (usuario.apellido !== '') updatedFields.apellido = apellido;
    if (usuario.dni !== '') updatedFields.dni = dni;
    if (usuario.telefono !== '') updatedFields.telefono = telefono;
    try {
        await User.updateOne({ mail: mail1 }, { $set: updatedFields });
        return res.redirect('/indexAdmin');
      } catch (error) {
        return res.json({
          resultado: false,
          msg: 'El usuario no se pudo modificar',
          error
        });
      }
})

module.exports = router;
