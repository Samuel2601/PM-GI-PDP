"use strict";

var express = require("express");
var estudianteController = require("../controllers/EstudianteController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post(
  "/registro_estudiante_tienda",
  estudianteController.registro_estudiante_tienda
);
api.get(
  "/listar_estudiantes_tienda",
  auth.auth,
  estudianteController.listar_estudiantes_tienda
);

api.get(
  "/listar_pensiones_estudiantes_tienda/:id",
  auth.auth,
  estudianteController.listar_pensiones_estudiantes_tienda
);
api.get(
  "/listar_documentos_nuevos_publico",
  estudianteController.listar_documentos_nuevos_publico
);
api.post(
  "/registro_estudiante",
  auth.auth,
  estudianteController.registro_estudiante
);

api.post(
  "/registro_estudiante_masivo",
  auth.auth,
  estudianteController.registro_estudiante_masivo
);
api.post(
  "/borrado_estudiante_masivo",
  auth.auth,
  estudianteController.borrado_estudiante_masivo
);
//api.post('/crear_pension_estudiante',estudianteController.crear_pension_estudiante);
api.post("/login_estudiante", estudianteController.login_estudiante);

api.get(
  "/obtener_estudiante_guest/:id",
  auth.auth,
  estudianteController.obtener_estudiante_guest
);
api.get(
  "/obtener_pension_estudiante_guest/:id",
  auth.auth,
  estudianteController.obtener_pension_estudiante_guest
);

api.put(
  "/actualizar_estudiante_admin/:id",
  auth.auth,
  estudianteController.actualizar_estudiante_admin
);
//api.post('/registro_direccion_estudiante',auth.auth,estudianteController.registro_direccion_estudiante);
//api.get('/obtener_direccion_todos_estudiante/:id',auth.auth,estudianteController.obtener_direccion_todos_estudiante);
//api.put('/cambiar_direccion_principal_estudiante/:id/:estudiante',auth.auth,estudianteController.cambiar_direccion_principal_estudiante);
//api.get('/eliminar_direccion_estudiante/:id',auth.auth,estudianteController.eliminar_direccion_estudiante);

//api.get('/listar_documentos_publico',estudianteController.listar_documentos_publico);
//api.get('/obtener_variedades_documentos_estudiante/:id',estudianteController.obtener_variedades_documentos_estudiante);
//api.get('/obtener_documentos_slug_publico/:slug',estudianteController.obtener_documentos_slug_publico);
//api.get('/listar_documentos_recomendados_publico/:categoria',estudianteController.listar_documentos_recomendados_publico);

//api.post('/agregar_carrito_estudiante',auth.auth,estudianteController.agregar_carrito_estudiante);
//api.get('/obtener_carrito_estudiante/:id',auth.auth,estudianteController.obtener_carrito_estudiante);
//api.delete('/eliminar_carrito_estudiante/:id',auth.auth,estudianteController.eliminar_carrito_estudiante);
api.get(
  "/obtener_ordenes_estudiante/:id",
  auth.auth,
  estudianteController.obtener_ordenes_estudiante
);
api.get(
  "/obtener_detalles_ordenes_estudiante/:id",
  auth.auth,
  estudianteController.obtener_detalles_ordenes_estudiante
);

api.get(
  "/obtener_detalles_por_estudiante/:id",
  auth.auth,
  estudianteController.obtener_detalles_por_estudiante
);

api.post(
  "/comprobar_carrito_estudiante",
  auth.auth,
  estudianteController.comprobar_carrito_estudiante
);
api.get(
  "/consultarIDPago/:id",
  auth.auth,
  estudianteController.consultarIDPago
);
api.post(
  "/registro_compra_estudiante",
  auth.auth,
  estudianteController.registro_compra_estudiante
);
api.get(
  "/obtener_reviews_estudiante/:id",
  auth.auth,
  estudianteController.obtener_reviews_estudiante
);
api.post(
  "/enviar_mensaje_contacto",
  estudianteController.enviar_mensaje_contacto
);

//registro de pago
api.get(
  "/listar_estudiantes_pago",
  auth.auth,
  estudianteController.listar_estudiantes_pago
);

module.exports = api;
