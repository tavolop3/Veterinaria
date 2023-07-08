const mongoose = require('mongoose');

const puntoUrgenciaSchema = new mongoose.Schema({
    direccion:{
        type: String
    },
    horarios:{
        type: String
    },
    infoContacto:{
        type: String
    },
    latlng: {
        type: [Number]
    }
})

const PuntoUrgencia = mongoose.model('PuntoUrgencia', puntoUrgenciaSchema);
exports.PuntoUrgencia = PuntoUrgencia;