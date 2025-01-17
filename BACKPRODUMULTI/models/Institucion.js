"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var InstitucionSchema = Schema({
  idadmin: { type: Schema.ObjectId, ref: "admininstitutos", required: true },

  titulo: { type: String, required: true },
  portada: { type: String, required: true },

  pais: { type: String, required: true },
  provincia: { type: String, required: true },
  canton: { type: String, required: true },
  parroquia: { type: String, required: true },
  calle1: { type: String, required: true },
  calle2: { type: String, required: true },
  codigopostal: { type: String, required: true },
  referencia: { type: String, required: true },
  telefonocon: { type: String, required: true },
  telefonoinsti: { type: String, required: true },
  type_school: { type: String, required: true, default: "EGB" },
  apiKey: { type: String, required: false }, // Clave API de Contífico
  apitoken: { type: String, required: false }, // Clave API de ContíficoapiKey: { type: String, required: false }, // Clave API de Contífico
  generacion_numero_comprobante: { type: String, required: false }, // Clave API de Contífico
  base: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, require: true },
});

//module.exports =  mongoose.model('instituto',InstitucionSchema);
module.exports = InstitucionSchema;
