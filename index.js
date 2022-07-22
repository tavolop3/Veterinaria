const mongoose = require('mongoose');
const genres = require('./routes/genres');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Succesfully connected to the database.'))
    .catch(err => console.error('Conection failed:',err));

app.use(express.json());
app.use('/api/genres',genres);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});