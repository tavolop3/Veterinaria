const express = require('express');
const app = express();   

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/pug')(app);
require('./startup/passportInit')(app);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.info(`Listening on port ${port}...`);
});

module.exports = server;