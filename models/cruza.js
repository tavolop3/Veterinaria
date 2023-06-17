const mongoose = require('mongoose');

const cruzaSchema = new mongoose.Schema({
    raza:{
        type: String
    },
    sexo:{
        type: String
    },
    fechaDeCelo:{
        type: Date
    },
    fechaDeNacimiento:{
        type: Date
    },
    mail:{
        type: String
    }
})

const Cruza = mongoose.model('Cruza', cruzaSchema);

exports.Cruza = Cruza;