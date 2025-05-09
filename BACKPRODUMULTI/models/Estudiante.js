"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const EstudianteSchema = new Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },

  email: { type: String, required: false },
  password: { type: String, required: false },

  genero: { type: String },
  f_nacimiento: { type: String, required: false },
  telefono: { type: String, required: false },
  dni: { type: String, required: true },
  direccion: { type: String, required: false },
  estado: { type: String, default: "Activo", required: false },
  f_desac: { type: String, required: false },
  anio_desac: { type: String, required: false },
  curso: { type: String, required: false },
  paralelo: { type: String, required: false },
  especialidad: { type: String, required: false, default: "EGB" },
  type_especialidad: { type: String, require: false, default: null },

  nombres_padre: { type: String, required: false },
  dni_padre: { type: String, required: false },
  email_padre: { type: String, required: false },

  nombres_factura: { type: String, required: false },
  dni_factura: { type: String, required: false },
  id_contifico_persona: { type: String, required: false },

  createdAt: { type: Date, default: Date.now, require: true },
});

module.exports = EstudianteSchema;

//module.exports =  mongoose.model('estudiante',EstudianteSchema);
