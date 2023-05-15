const express = require('express');
const app = express();   
const winston = require('winston');

app.set('view engine', 'pug');

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    winston.info(`Listening on port ${port}...`);
});

module.exports = server;