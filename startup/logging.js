require('winston-mongodb');
require('express-async-errors');
const winston = require('winston');

module.exports = function() {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' }));
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    winston.add(new winston.transports.MongoDB({ db: 'mongodb://localhost/vidly',
                                                 level: 'info', options: { useUnifiedTopology: true } }));

}