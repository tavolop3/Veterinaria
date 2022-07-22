const mongoose = require('mongoose');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Succesfully connected to the database.'))
    .catch(err => console.error('Conection failed:',err));

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});