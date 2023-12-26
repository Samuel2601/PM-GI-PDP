'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlanioSchema = Schema({
    descripcion: {type: Text, require: true},

    cantidad: {type: Number, require: true},

    valor: {type: Number, require: true},

    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('plan',PlanioSchema);
module.exports = PlanioSchema;