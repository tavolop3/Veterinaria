const express = require('express');
const router = express.Router();

router.get('', (req,res) => {
    res.render('index');
})

.get('/usuarios/login', (req,res) => {
    res.render('login');
})

.get('/usuarios/registrar', (req,res) => {
    res.render('registro');
})

module.exports = router;