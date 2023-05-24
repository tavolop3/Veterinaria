
module.exports = function(req,res,next){
    if(!req.user.isAdmin) return res.status(403).send('Acceso denegado, debe ser un administrador.');
    next();
} 