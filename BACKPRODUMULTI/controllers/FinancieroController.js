//var AdminInstituto = require('../models/AdminInstituto');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
let { months, suppressDeprecationWarnings } = require('moment');

let Estudiante = require('../models/Estudiante');
let Pension_Beca = require('../models/Pension_Beca');
let Config = require('../models/Config');
let Factura = require('../models/Facturacion');
let Documento = require('../models/Documento');
let Pago = require('../models/Pago');
let Dpago = require('../models/Dpago');
let Pension = require('../models/Pension');
let Registro = require('../models/Registro');
let Admin = require('../models/Admin');
let AdminInstituto = require('../models/AdminInstituto');
let Institucion = require('../models/Institucion');

let Proveedor = require('../models/Proveedor');
let Ctacontable = require('../models/Ctacontable');

let Facturacion = require('../models/Facturacion');

const ConfigSchema = require('../models/Config');
const FacturaSchema = require('../models/Facturacion');
const AdminInstitutoSchema = require('../models/AdminInstituto');
const AdminSchema = require('../models/Admin');
const RegistroSchema = require('../models/Registro');
const VentaSchema = require('../models/Pago');
const PensionSchema = require('../models/Pension');
const EstudianteSchema = require('../models/Estudiante');
const DpagoSchema = require('../models/Dpago');
const Pension_becaSchema = require('../models/Pension_Beca');
const DocumentoSchema = require('../models/Documento');
const InstitucionSchema = require('../models/Institucion');

const ProveedorSchema = require('../models/Proveedor');
const CtacontableSchema  = require('../models/Ctacontable');
const FacturacionSchema  = require('../models/Facturacion');


var mongoose = require('mongoose');


const agregar_proveedor = async function (req, res) {
	if (req.user) {
		try {
			var data = req.body;
			var cont=0;
			let conn = mongoose.connection.useDb(req.user.base);
			Proveedor = conn.model('proveedor', ProveedorSchema);
			for (const element of data) {
				var proveedor_arr = [];
				
				proveedor_arr = await Proveedor.find({ ruc: element.ruc });
				if(proveedor_arr.length==0){
					var reg = await Proveedor.create(element);
					cont=cont+1;
				}
			}
			res.status(200).send({ message: 'Registrado con exito: '+cont });
		} catch(error){
			console.log(error);
			res.status(200).send({ message: 'algo salio mal'});
		}
	}
}
const listar_proveedor = async function (req, res) {
	if (req.user) {
		try {
			let conn = mongoose.connection.useDb(req.user.base);
			Proveedor = conn.model('proveedor', ProveedorSchema);
			let proveedor_arr = await Proveedor.find({});

			res.status(200).send({ proveedores: proveedor_arr });
		} catch(error){
			res.status(200).send({ message: 'algo salio mal'});
		}
	}
}
const listar_ctacontable = async function (req, res) {
	if (req.user) {
		try {
			let conn = mongoose.connection.useDb(req.user.base);
			Ctacontable = conn.model('ctacontable', CtacontableSchema);
			let ctacontable = await Ctacontable.find({});

			res.status(200).send({ ctacontable: ctacontable });
		} catch(error){
			res.status(200).send({ message: 'algo salio mal'});
		}
	}
}
const agregar_ctacontable = async function (req, res) {
	if (req.user) {
	  try {
		var data = req.body;
		let conn = mongoose.connection.useDb(req.user.base);
		Ctacontable = conn.model('ctacontable', CtacontableSchema);

		for (const element of data) {
			let ctacon = [];
				
				ctacon = await Ctacontable.find({ codigo:element.codigo });
			
			if (ctacon.length == 0) {

				await Ctacontable.create(element);

			  } else {
				await Ctacontable.updateOne(
				  { _id: ctacon[0]._id },
				  {
					codigo: element.codigo,
					nombre: element.nombre,
					subcuentas: element.subcuentas
				  }
				);
			  }
		}
		res.status(200).send({ message: 'Registrado con éxito' });
	  } catch (error) {
		console.log(error);
		res.status(200).send({ message: 'Algo salió mal' });
	  }
	}
  }

function guardar_firma(req,res){
	
	var archivoBase64 = req.body.file; // Archivo .p12 en representación base64
	
	// Decodificar la representación base64 a un buffer
	var archivoBuffer = Buffer.from(archivoBase64, 'base64');

	// Generar un nombre de archivo único para el archivo .p12
	var archivoNombre = req.body.data.archivo_name //generateUniqueFileName();

	// Ruta donde se guardará el archivo .p12
	var archivoRuta = path.join('./facturas/',req.user.base,'/accesos/', archivoNombre);

	if (!fs.existsSync('./facturas/'+req.user.base+'/accesos/')) {
		fs.mkdirSync('./facturas/'+req.user.base+'/accesos/', { recursive: true });
	}

	// Guardar el archivo .p12 en el sistema de archivos
	fs.writeFile(archivoRuta, archivoBuffer, (error) => {
		if (error) {
		  console.log('Error al guardar el archivo:', error);
		  res.status(500).send({ message: 'Error al guardar el archivo' });
		} else {
		  console.log('Archivo guardado exitosamente');
		}
	  });

	return archivoNombre;
}
const actualizar_conf_facturacion = async function (req, res) {
	if (req.user) {
		try {
		var data = req.body.data;
		let conn = mongoose.connection.useDb(req.user.base);
		Facturacion = conn.model('facturacion', FacturacionSchema);
		ctacon = await Facturacion.find({});
		
		if (ctacon.length == 0) {
			bcrypt.hash(data.password, null, null, async function (err, hash) {
				if (hash) {
					data.password = hash;
					bcrypt.hash(data.correo_password, null, null, async function (err, hash) {
						if (hash) {
							data.correo_password = hash;
							if(req.body.file){
								data.archivo = await guardar_firma(req,res);
							}
							
							await Facturacion.create(data);
							res.status(200).send({ message: 'Guardado'});
						} else {
							res.status(200).send({ message: 'ErrorServer', data: undefined });
						}
					});

				} else {
					res.status(200).send({ message: 'ErrorServer', data: undefined });
				}
			});	
			} else {
				if(req.body.file){
					data.archivo = await guardar_firma(req,res);
				}else{
					data.archivo=ctacon[0].archivo;
				}

				if(data.password&&data.correo_password){
					await Facturacion.updateOne(
						{ _id: ctacon[0]._id },
						{
							ruc: data.ruc,
							dirMatriz:data.dirMatriz,
							razonSocial:data.razonSocial,
							nombreComercial:data.nombreComercial,
							telefono:data.telefono, 
							ambiente:data.ambiente,
							codDoc:data.codDoc,
							estab:data.estab,
							ptoEmi:data.ptoEmi,
							secuencial:data.secuencial,
							serie:data.serie,
							codnum:data.codnum,				
							archivo:data.archivo,
							password:data.password,
							correo:data.correo,
							correo_password:data.correo_password
						}
						);
						res.status(200).send({ message: 'Actualizado'});
				}else if(data.correo_password){
					await Facturacion.updateOne(
						{ _id: ctacon[0]._id },
						{
							ruc: data.ruc,
							dirMatriz:data.dirMatriz,
							razonSocial:data.razonSocial,
							nombreComercial:data.nombreComercial,
							telefono:data.telefono, 
							ambiente:data.ambiente,
							codDoc:data.codDoc,
							estab:data.estab,
							ptoEmi:data.ptoEmi,
							secuencial:data.secuencial,
							serie:data.serie,
							codnum:data.codnum,				
							archivo:data.archivo,
							correo:data.correo,
							correo_password:data.correo_password
						}
						);
						res.status(200).send({ message: 'Actualizado'});
				}else{
					await Facturacion.updateOne(
						{ _id: ctacon[0]._id },
						{
							ruc: data.ruc,
							dirMatriz:data.dirMatriz,
							razonSocial:data.razonSocial,
							nombreComercial:data.nombreComercial,
							telefono:data.telefono, 
							ambiente:data.ambiente,
							codDoc:data.codDoc,
							estab:data.estab,
							ptoEmi:data.ptoEmi,
							secuencial:data.secuencial,
							serie:data.serie,
							codnum:data.codnum,				
							archivo:data.archivo,
							correo:data.correo,
							password:data.password
						}
						);
						res.status(200).send({ message: 'Actualizado'});
				}
			
			}
		} catch (error) {
		console.log(error);
		res.status(200).send({ message: 'Algo salió mal' });
		}
	}
}
function generateUniqueFileName() {
	var timestamp = Date.now();
	var randomString = Math.random().toString(36).substring(2, 15);
	var uniqueFileName = `${timestamp}_${randomString}.p12`;
	return uniqueFileName;
  }
const get_conf_facturacion=async function(req,res){
	if(req.user){
		try {
			let conn = mongoose.connection.useDb(req.user.base);
			Facturacion = conn.model('facturacion', FacturacionSchema);
			ctacon = await Facturacion.find({});
			res.status(200).send({ data: ctacon[0] });
		} catch (error) {
			res.status(200).send({ message: 'Algo salió mal' });
		}
	}
}



module.exports = {
	agregar_proveedor,
	listar_proveedor,
	listar_ctacontable,
	agregar_ctacontable,
	actualizar_conf_facturacion,
	get_conf_facturacion
};
