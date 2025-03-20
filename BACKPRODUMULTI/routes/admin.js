"use strict";

var express = require("express");
var AdminController = require("../controllers/AdminController");

var api = express.Router();
var auth = require("../middlewares/authenticate");
var multiparty = require("connect-multiparty");
var path = multiparty({ uploadDir: "./uploads/instituciones" });

api.put("/cambiar_base", auth.auth, AdminController.cambiar_base);

api.get(
  "/listar_admininstitucion",
  auth.auth,
  AdminController.listar_admininstitucion
);

api.get(
  "/actualizar_admininstitucion/:id",
  auth.auth,
  AdminController.actualizar_admininstitucion
);

// Ruta para actualizar una institución
api.put("/instituciones/:id", auth.auth, AdminController.actualizarInstitucion);

api.get("/obtener_portada/:img", AdminController.obtener_portada);

api.post(
  "/create_institucion",
  [auth.auth, path],
  AdminController.create_institucion
);

api.post("/forgotpassword", AdminController.forgotpassword);

api.post("/newpassword", auth.auth, AdminController.newpassword);

api.post("/login_admin", AdminController.login_admin);

api.post(
  "/registro_documento_admin",
  [auth.auth, path],
  AdminController.registro_documento_admin
);
api.get(
  "/listar_documentos_admin",
  auth.auth,
  AdminController.listar_documentos_admin
);

api.get(
  "/obtener_documento_admin/:id",
  auth.auth,
  AdminController.obtener_documento_admin
);
api.put(
  "/actualizar_documento_admin/:id",
  [auth.auth, path],
  AdminController.actualizar_documento_admin
);

api.get("/verificar_token", auth.auth, AdminController.verificar_token);

api.get(
  "/obtener_config_admin",
  auth.auth,
  AdminController.obtener_config_admin
);
api.put(
  "/actualizar_config_admin",
  auth.auth,
  AdminController.actualizar_config_admin
);

api.get(
  "/obtener_pagos_admin/:desde/:hasta",
  auth.auth,
  AdminController.obtener_pagos_admin
);
api.get(
  "/obtener_pagos_dash/:desde/:hasta",
  auth.auth,
  AdminController.obtener_pagos_dash
);
api.get(
  "/obtener_detallespagos_admin/:id",
  auth.auth,
  AdminController.obtener_detallespagos_admin
);

api.get(
  "/obtener_detalles_ordenes_estudiante_abono/:id",
  auth.auth,
  AdminController.obtener_detalles_ordenes_estudiante_abono
);

api.get(
  "/obtener_becas_conf/:id",
  auth.auth,
  AdminController.obtener_becas_conf
);

api.get(
  "/obtener_detalles_ordenes_rubro/:id",
  auth.auth,
  AdminController.obtener_detalles_ordenes_rubro
);

api.put(
  "/marcar_finalizado_orden/:id",
  auth.auth,
  AdminController.marcar_finalizado_orden
);
api.put(
  "/eliminar_finalizado_orden/:id",
  auth.auth,
  AdminController.eliminar_finalizado_orden
);
api.delete(
  "/eliminar_orden_admin/:id",
  auth.auth,
  AdminController.eliminar_orden_admin
);

api.delete(
  "/eliminar_orden_pm/:id",
  auth.auth,
  AdminController.eliminar_orden_pm
);

api.delete(
  "/eliminar_documento_admin/:id",
  auth.auth,
  AdminController.eliminar_documento_admin
);

api.post(
  "/registro_compra_manual_estudiante",
  auth.auth,
  AdminController.registroCompraManualEstudiante
);

api.get("/listar_admin", auth.auth, AdminController.listar_admin);
api.get(
  "/listar_registro/:desde/:hasta",
  auth.auth,
  AdminController.listar_registro
);
api.put("/actualizar_admin/:id", auth.auth, AdminController.actualizar_admin);

api.post("/registro_admin", auth.auth, AdminController.registro_admin);

api.get("/obtener_admin/:id", auth.auth, AdminController.obtener_admin);
api.get("/eliminar_admin/:id", auth.auth, AdminController.eliminar_admin);
api.get(
  "/eliminar_estudiante_admin/:id",
  auth.auth,
  AdminController.eliminar_estudiante_admin
);
api.get(
  "/reactivar_estudiante_admin/:id",
  auth.auth,
  AdminController.reactivar_estudiante_admin
);

api.put("/actualizzas_dash", auth.auth, AdminController.actualizzas_dash);
api.get(
  "/getDashboar_estudiante",
  auth.auth,
  AdminController.getDashboar_estudiante
);
api.get("/obtener_info_admin", auth.auth, AdminController.obtener_info_admin);

api.get(
  "/obtener_institucion/:id",
  auth.auth,
  AdminController.obtener_institucion
);
api.get(
  "/obtener_config_plana",
  auth.auth,
  AdminController.obtener_config_plana
);
api.put(
  "/actualizar_config_plana/:id",
  auth.auth,
  AdminController.actualizar_config_plana
);
api.post("/crear_config_plana", auth.auth, AdminController.crear_config_plana);

api.post(
  "/actualizarStockDocumentos",
  AdminController.actualizarStockDocumentos
);

api.put(
  "/actualizar_pago_id_contifico",
  auth.auth,
  AdminController.actualizar_pago_id_contifico
);

//verificarDeudasEstudiante
api.get(
  "/verificarDeudasEstudiante/:id",
  auth.auth,
  AdminController.verificarDeudasEstudiante
);

module.exports = api;
