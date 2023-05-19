
const autenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
      if(req.user.primerLogin) {
        res.render('modificar-contraseña');
      }else{
        return next();
      }
    } else {
      // Redirige a la página de inicio de sesión si el usuario no está autenticado
      res.render('login', { error: 'Se debe autenticar '});
    }
};

module.exports = autenticado;