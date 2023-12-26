'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = Schema({

    pension: {type: Number, required: true},
    numpension:{type:Number, default: 1, min: 0, max: 10,require:true},
    matricula: {type: Number, required: true},
    mescompleto:{type: Date, required: false},
    anio_lectivo:{type: Date, required: true},
    descuento_anticipo: {type: Number, required: false},
    facturacion:{type: String, required: false},

    extrapagos:{type: String,default:'', required: false},
    
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('config',ConfigSchema);
module.exports = ConfigSchema;