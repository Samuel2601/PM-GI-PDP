'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DpagoSchema = Schema({

    estudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},
    pago: {type: Schema.ObjectId, ref: 'pago', require: true},

    documento: {type: Schema.ObjectId, ref: 'document', required: true},
    descripcion: {type: String, require: false},
    valor: {type: Number, require: true},

    idpension:{type: Schema.ObjectId, ref: 'pension', required: true},
    tipo: {type: Number, min: 0, max: 100, require: true},
    estado: {type: String, require: true},
    abono: {type: Number, min: 0, max: 1, require: true},
    transaccion: {type: String, require: true},
    
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports=DpagoSchema;
//module.exports =  mongoose.model('dpago',DpagoSchema);