const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const { User, validateCreate, encriptarContraseña } = require('../models/user');
const { Perro } = require('../models/perro')
const _ = require('lodash');
const { sendEmail } = require('../emails');

router.post('/registrar-usuario', async (req, res) => {
  const { error } = validateCreate(req.body);
  if (error) return res.status(400).render('registro-usuario', { error });

  let user = await User.findOne({ mail: req.body.mail });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['nombre', 'apellido', 'mail', 'telefono', 'dni']));

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
    let user = await User.findById({ _id: usuario._id });
    if (!user) return res.status(400).send('No se encontro el usuario');
    let updatedFields = {};
    if (usuario.mail !== '') updatedFields.mail = usuario.mail;
    if (usuario.nombre !== '') updatedFields.nombre = usuario.nombre;
    if (usuario.apellido !== '') updatedFields.apellido = usuario.apellido;
    if (usuario.dni !== '') updatedFields.dni = usuario.dni;
    if (usuario.telefono !== '') updatedFields.telefono = usuario.telefono;
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

  .post('modificar-perro', async (req, res) => {
    const { perro } = req.body.perro;
    let updatedFields = {};
    if (perro.nombre !== '') updatedFields.nombre = perro.nombre;
    if (perro.sexo !== '') updatedFields.sexo = perro.sexo;
    if (perro.fecha !== null) updatedFields.fecha = perro.fecha;
    if (perro.raza !== '') updatedFields.dni = perro.raza;
    if (perro.color !== '') updatedFields.color = perro.color;
    if (perro.observaciones !== '') updatedFields.observaciones = perro.observaciones;
    if (perro.color !== '') updatedFields.color = perro.color;
    try {
      await Perro.updateOne({ _id: req.body._id }, { $set: updatedFields });
      return res.redirect('/indexAdmin');
    } catch (error) {
      return res.json({
        resultado: false,
        msg: 'El perro no se pudo modificar',
        error
      });
    }
  })

//route for user list
router.get('/listar-usuarios', async (req, res) => {
  try {
    let users = await User.find({});
    const lista = users.map(usuario => ({ dni: usuario.dni, mail: usuario.mail, nombre: usuario.nombre, apellido: usuario.apellido }))
    if (lista.length === 0) {
      res.status(404).json({ mensaje: 'No hay usuarios cargados en el sistema' });
    } else {
      res.json(lista);
    }
  } catch (err) {
    console.log('Hola')
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/registrar-perro', async (req, res) => {
  const { error } = validateCreate(req.body);
  if (error) return res.status(400).render('registro-perro', { error });

  let user = await User.findOne({ mail: req.body.mail });//tengo al user, ahora le agregamos al perro , si no existe
  if (!user) return res.status(400).send('User not registered.');

  //esta linea de abajo me da dudas
  perro = new Perro(_.pick(req.body, ['id', 'nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto']));
  const perros = user.perrosId; // Array de perros del usuario
  const perroNoEncontrado = !perros.includes(perro.id);
  if (perroNoEncontrado) {
    console.log('El perro no se encuentra en la lista del usuario');
    user.perrosId.push(perro.id)
    //return user.save();
  } else {
    console.log('El perro ya está en la lista del usuario');
    return res.status(400).send('perro already registered.');
  }

  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  // sendEmail(user.mail,'OhMyDog - Contraseña predefinida',
  //     'Bienvenido a OhMyDog, tu cuenta fue creada con exito. Tu contraseña para el primer ingreso va a ser '+ contraRandom + ' es importante que la cambies ni bien accedas por motivos de seguridad, gracias.'
  // );

  await user.save();

  res.redirect('/admin');
})

module.exports = router;
