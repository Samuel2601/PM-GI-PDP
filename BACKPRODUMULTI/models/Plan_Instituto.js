'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlanInstitutoSchema = Schema({
    idadmin: {type: Schema.ObjectId, ref: 'admininstituto', required: true},
    idinstituto: {type: Schema.ObjectId, ref: 'instituto', required: true},
    idplan: {type: Schema.ObjectId, ref: 'plan', required: true},

    fechaexp:{type:Date, require: true},
    cantidad: {type: Number, require: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('planinstituto',PlanInstitutoSchema);
module.exports = PlanInstitutoSchema;