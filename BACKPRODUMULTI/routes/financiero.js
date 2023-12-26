'use strict'

var express = require('express');
var FinancieroController = require('../controllers/FinancieroController');


var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');

var aux=(req) =>'./facturas/'+req.user.base +'/accesos' ;
var path = multiparty({ uploadDir:aux });

  
api.post('/actualizar_conf_facturacion',auth.auth,FinancieroController.actualizar_conf_facturacion);
api.get('/get_conf_facturacion',auth.auth,FinancieroController.get_conf_facturacion);

api.post('/agregar_proveedor',auth.auth,FinancieroController.agregar_proveedor);

api.get('/listar_proveedor',auth.auth,FinancieroController.listar_proveedor);

api.get('/listar_ctacontable',auth.auth,FinancieroController.listar_ctacontable);
api.post('/agregar_ctacontable',auth.auth,FinancieroController.agregar_ctacontable);


module.exports = api;