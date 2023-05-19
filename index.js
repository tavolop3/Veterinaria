const express = require('express');
const app = express();   

require('./startup/passportInit')(app);
require('./startup/pug')(app);
require('./startup/routes')(app);
require('./startup/db')();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.info(`Servidor pendiente al puerto ${port}...`);
});

module.exports = server;