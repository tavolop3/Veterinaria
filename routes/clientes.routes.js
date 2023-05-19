const express = require('express');
const router = express.Router();
const autenticado = require('../middleware/autenticado');

// Para modificar la contraseña en el primer ingreso
router.post('/modificar-pass',autenticado,async(req,res) => {
    const user = User.findById(req.user._id);

    if(req.body.contraseña1 != req.body.contraseña2)
      res.redirect('/usuarios/modificar-pass', { error : 'Las contraseñas deben ser iguales' })
    
    user.contraseña = await encriptarContraseña(req.body.contraseña1);
    user.primerLogin = false;

    await user.save();
})

module.exports = router;