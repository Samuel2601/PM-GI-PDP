'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cuentaContableSchema  = Schema({

    codigo: {type: String, required: true},
    nombre: {type: String, required: true},
    subcuentas: [], 
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports = cuentaContableSchema;


//module.exports =  mongoose.model('config',ConfigSchema);