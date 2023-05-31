const mongoose = require('mongoose');

const perdidaScheme = new mongoose.Scheme({
    nombre:{
        type: String
    },
    sexo:{
        type: String
    },
    foto:{
        type: String
    },
    raza:{
        type: String
    },
    color:{
        type: String
    },
    mail:{
        type: String
    },
    confirmado:{
        type: Boolean
    }
})

const Perdida = mongoose.model('Perdida', perdidaScheme);