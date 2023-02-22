const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    const db = config.get('db');
    mongoose.set('strictQuery', false);
    mongoose.connect(db)
        .then(() => winston.info(`Succesfully connected to ${db}...`));
}