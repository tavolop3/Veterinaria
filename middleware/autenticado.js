
const autenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
      if(req.user.contraseña === req.user.contraseñaDefault) {
        res.render('modificar-pass', { error : 'Debe modificar su contraseña por seguridad.' })
      }else{
        return next();
      }
    } else {
      res.render('login', { error: 'Se debe autenticar '});
    }
};

module.exports = autenticado;