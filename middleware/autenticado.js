
const autenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
      if(req.user.contraseña === req.user.contraseñaDefault) {
        res.render('modificar-datos',{ error : 'Debe modificar su contraseña por seguridad.', primerLogin: true})
      }else{
        return next();
      }
    } else {
      res.render('login', { error: 'Se debe autenticar '});
    }
};

module.exports = autenticado;