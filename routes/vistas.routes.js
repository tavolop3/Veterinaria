const express = require('express');
const router = express.Router();

router.get('', (req,res) => {
    res.render('index');
})

.get('/usuarios/login', (req,res) => {
    res.render('login');
})

.get('/admin/registrar-usuario', (req,res) => {
    res.render('registro-usuario');
})

.get('/admin', (req,res) => {
    res.render('indexAdmin');
})

module.exports = router;