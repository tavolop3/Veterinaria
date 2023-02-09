
module.exports = function(err,req,res,next) {
    //Log
    res.status(500).send('Something failed.');
}