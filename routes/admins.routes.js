const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const { User, validateCreate, encriptarContraseña } = require('../models/user');
const { Perro, validateCreatePerro } = require('../models/perro')
const { Turno, modificarEstado } = require('../models/turno')
const _ = require('lodash');
const { sendEmail } = require('../emails');
const { ObjectId } = require('mongoose').Types;

router.post('/registrar-usuario', async (req, res) => {
  const { error } = validateCreate(req.body);
  if (error) return res.status(400).render('registro-usuario', { error }); // TODO Traducir mensajes a español

  let user = await User.findOne({ mail: req.body.mail });
  if (user) return res.status(400).render('registro-usuario', { error: 'El mail ya está en uso.' }); // TODO Popup

  user = await User.findOne({ dni: req.body.dni });
  if (user) return res.status(400).render('registro-usuario', { error: 'El dni ya está registrado.' });

  user = new User(_.pick(req.body, ['nombre', 'apellido', 'mail', 'telefono', 'dni']));

  const contraRandom = crypto.randomBytes(8).toString('hex');
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  // sendEmail(user.mail,'OhMyDog - Contraseña predefinida',
  //     'Bienvenido a OhMyDog, tu cuenta fue creada con exito. Tu contraseña para el primer ingreso va a ser '+ contraRandom + ' es importante que la cambies ni bien accedas por motivos de seguridad, gracias.'
  // );
  console.log('Contraseña generada:' + contraRandom);
  user.contraseña = await encriptarContraseña(contraRandom);
  user.contraseñaDefault = user.contraseña;
  await user.save();

  res.redirect('/'); // TODO Enviar mensaje con confirmación de creación 
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
    let users = await User.find({ isAdmin: false });
    const lista = users.map(usuario => ({ dni: usuario.dni, mail: usuario.mail, nombre: usuario.nombre, apellido: usuario.apellido }))
    if (lista.length === 0) {
      res.render('listaUsuarios', { error: 'La lista esta vacia' });
    } else {
      res.render('listaUsuarios', { usuarios: lista });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/registrar-perro', async (req, res) => {
  try {
    const perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto']));
    const { error } = validateCreatePerro(perro);
    if (error) return res.status(400).render('registro-perro', { error });
    let user = await User.findOne({ mail: req.body.mail });

    if (!user) {
      return res.status(400).send('User not registered.');
    }

    console.log(user);

    //const perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto']));

    console.log(perro);

    const perros = user.perrosId; // Array de perros del usuario

    console.log(perros);

    let perroEncontrado = perros.find(perroId => perroId && perroId.toString() === perro._id.toString());

    if (!perroEncontrado) {
      console.log('El perro no se encuentra en la lista del usuario');
      user.perrosId.push(perro._id);
      await user.save();
      console.log("Perro agregado al usuario");
    } else {
      console.log('El perro ya está en la lista del usuario');
      return res.status(400).send('Perro already registered.');
    }

    await perro.save();

    res.redirect('/admin');
  } catch (error) {
    console.log('Error al registrar el perro:', error);
    return res.status(500).send('Internal Server Error');
  }
})

  /*  permite visualizar al administrador
      los turnos asignados para el dia
  */
  .get('/turnos-diarios', async (req, res) => {
    let hoy = new Date();
    try {
      let turnos = await Turno.find({});
      let turnosDiarios = turnos.filter(turno => turno.fecha.getDate() === hoy.getDate());
      res.render('turnos-hoy', { turnosDiarios })
    } catch (error) {
      console.log('Error al obtener los turnos:', error);
      return res.status(400).send('Error al obtener los turnos');
    }
  })

.post('/admin/mostrar-modificar-turno', (req,res) => {
  res.render('modificar-turno', { turno: req.body.turno });
})

.post('/modificar-turno', async (req, res) => {
    var campos = ['rangoHorario', 'fecha', 'estado'];
    campos = _.pickBy(_.pick(req.body, campos), _.identity)
    campos.estado = 'modificado-pendiente';

    const turno = await Turno.findByIdAndUpdate(req.body.id, campos);
    if (!turno) res.status(400).send('El turno no fue encontrado');

    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // sendEmail(user.mail,'OhMyDog - Modificación de turno',
    //     'Uno de tus turnos fue modificado por la veterinaria, por favor, revisa en tus turnos.'
    // );

    res.redirect('/'); // TODO Enviar mensaje con confirmación de modificación 
})

  .post('/eliminar-usuario', async (req, res) => {
    try {
      // Obtener el usuario que deseas eliminar
      const usuario = await User.findOne({ mail: req.body.dato });
      if (!usuario) {
        return res.status(400).send('User not registered.');
      }

      // Recopilar los IDs de los perros y turnos asociados al usuario
      const idPerros = usuario.perrosId.map(perro => ObjectId(perro));
      const idTurnos = usuario.turnosId.map(turno => ObjectId(turno));

      // Eliminar los perros asociados al usuario
      await Perro.deleteMany({ _id: { $in: idPerros.map(id => new ObjectId(id)) } });
      // Eliminar los turnos asociados al usuario
      await Turno.deleteMany({ _id: { $in: idTurnos } });

      // Eliminar el usuario
      await User.deleteOne({ mail: req.body.dato });
      //console.log('Usuario y sus perros/turnos eliminados exitosamente');
      res.render('eliminacion-confirmada');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/listar-perros', async (req, res) => {
    const usuario = await User.findOne({ mail: req.body.dato })
      .populate('perrosId')
    const perros = usuario.perrosId;
    res.render('listaPerros', { perros, admin: true })
  })






module.exports = router;