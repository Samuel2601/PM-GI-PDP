'use strict'

var express = require('express');
var GoogleController = require('../controllers/GoogleControl');


var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
  
api.post('/cambiarEstadoGoogle',auth.auth,GoogleController.cambiarEstadoGoogle);
api.get('/consultarEstadoGoogle/:id',auth.auth,GoogleController.consultarEstadoGoogle);

module.exports = api;