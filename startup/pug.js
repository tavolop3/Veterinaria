const express = require('express');
const path = require('path');

module.exports = function(app){
    app.set('view engine', 'pug');
    app.set('views', './views');
    const viewsDir = path.join(__dirname, '../views');
    app.use(express.static(viewsDir));
}