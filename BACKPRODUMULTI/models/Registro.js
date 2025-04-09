"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const RegistroSchema = new Schema({
  admin: { type: Schema.ObjectId, ref: "admin", required: true },
  estudiante: { type: Schema.ObjectId, ref: "estudiante", required: false },
  pago: { type: Schema.ObjectId, ref: "pago", require: false },
  documento: { type: Schema.ObjectId, ref: "document", required: false },
  config: { type: Schema.ObjectId, ref: "config", required: false },
  tipo: { type: String, require: true },
  descripcion: { type: String, require: true },
  createdAt: { type: Date, default: Date.now, require: true },
});

//module.exports =  mongoose.model('registro',RegistroSchema);
module.exports = RegistroSchema;
