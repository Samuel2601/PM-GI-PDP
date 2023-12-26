'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacturacionSchema = Schema({
    ruc: {type: String, required: true},
    dirMatriz: {type: String, required: true},
    razonSocial: {type: String, required: true},
    nombreComercial: {type: String, required: true},
    telefono: {type: String, required: true}, 

    ambiente: {type: String, required: true},
    codDoc: {type: String, required: true},
    estab: {type: String, required: true},
    ptoEmi: {type: String, required: true},
    secuencial: {type: String, required: true},
    serie: {type: String, required: true},
    codnum: {type: String, required: true},
    
    archivo: {type: String, required: true},
    password: {type: String, required: true},

    correo: {type: String, required: true},
    correo_password: {type: String, required: true},


    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('instituto',InstitucionSchema);
module.exports=FacturacionSchema;