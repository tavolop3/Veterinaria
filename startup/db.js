const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    const db = config.get('db');
    mongoose.set('strictQuery', false);
    mongoose.connect(db)
        .then(() => console.info(`Conectado exitosamente a ${db}...`));
}