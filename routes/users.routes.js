const bcrypt = require('bcrypt');
const {User, validateCreate, validateLogin} = require('../models/user');
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/me', auth, async(req,res) => {
    const user = await User.findById(req.user._id).select('-contraseña');
    res.send(user);
})

.post('/registrar', async (req,res) => {
    await console.log(req.body);

    const { error } = validateCreate(req.body); 
    if(error) return res.status(400).render('registrar', { error });

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['nombre','apellido','mail','contraseña','telefono','dni']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.contraseña, salt);
    await user.save();
    
    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ['_id','nombre','mail']));
})

.post('/login', async(req,res) => {
    const { error } = validateLogin(req.body);  
    if(error) return res.status(400).send('login', { error });

    let user = await User.findOne({ email: req.body.mail });
    if(!user) return res.status(400).render('login',{ error: 'Contraseña o mail invalido' });

    const validPassword = await bcrypt.compare(req.body.contraseña, user.contraseña);
    if(!validPassword) return res.status(400).render('login',{ error: 'Contraseña o mail invalido' });

    const token = user.generateAuthToken();
    res.send(token);

});

module.exports = router;

