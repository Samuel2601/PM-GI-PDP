'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = Schema({

    anio_lectivo:{type: Date, required: true},
    numpension:{type:Number, default: 1, min: 0, max: 10,require:true},
    duracion:{type: Number, required: false},


    pension: {type: Number, required: true},    
    matricula: {type: Number, required: true}, 

    mescompleto:{type: Date, required: false},
    descuento_anticipo: {type: Number, required: false},
    

    
    facturacion:{type: String, required: false},

    extrapagos:{type: String,default:'', required: false},
    
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('config',ConfigSchema);
module.exports = ConfigSchema;