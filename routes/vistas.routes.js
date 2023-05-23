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

.get('/clientes', (req, res) => {
    res.render('indexCliente')
})

.get('/admin', (req,res) => {
    res.render('indexAdmin');
})

.get('/clientes/turno', (req, res) => {
    res.render('turno')
})

.get('/usuarios/modificar/datos', (req, res) => {
    res.render('modificar-datos')
})

.get('/clientes/modificar-pass', (req,res) => {
    res.render('modificar-pass');
})

module.exports = router;