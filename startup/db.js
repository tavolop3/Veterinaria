const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function(){
    mongoose.set('strictQuery', false);
    mongoose.connect('mongodb://localhost/vidly')
        .then(() => winston.info('Succesfully connected to the database.'));
}