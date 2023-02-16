require('express-async-errors');
require('winston-mongodb');
const winston = require('winston');
const error = require('./middleware/error')
const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');
const express = require('express');
const app = express();    

winston.exceptions.handle(new winston.transports.File({ filename: 'uncaughtExceptions.log' }));

mongoose.set('strictQuery', false);

winston.add(new winston.transports.File({ filename: 'logfile.log' }));
winston.add(new winston.transports.MongoDB({ db: 'mongodb://localhost/vidly', level: 'info', options: { useUnifiedTopology: true } }));

//set vidly_jwtPrivateKey=exampleKey    in cmd
if (!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Succesfully connected to the database.'))
    .catch(err => console.error('Conection failed:',err));
mongoose.set('strictQuery', false);

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users',users);
app.use('/api/auth',auth);
app.use(error);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});