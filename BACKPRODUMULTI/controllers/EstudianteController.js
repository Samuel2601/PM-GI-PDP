var bcrypt = require("bcrypt-nodejs");
var jwt = require("../helpers/jwt");
var fs = require("fs");
var handlebars = require("handlebars");
var ejs = require("ejs");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var path = require("path");

let Estudiante = require("../models/Estudiante");
let Pension_Beca = require("../models/Pension_Beca");
let Config = require("../models/Config");
let Documento = require("../models/Documento");
let Pago = require("../models/Pago");
let Dpago = require("../models/Dpago");
let Pension = require("../models/Pension");
let Registro = require("../models/Registro");
let Admin = require("../models/Admin");
let AdminInstituto = require("../models/AdminInstituto");
let Facturacion = require("../models/Facturacion");

const ConfigSchema = require("../models/Config");
const AdminInstitutoSchema = require("../models/AdminInstituto");
const AdminSchema = require("../models/Admin");
const RegistroSchema = require("../models/Registro");
const VentaSchema = require("../models/Pago");
const PensionSchema = require("../models/Pension");
const EstudianteSchema = require("../models/Estudiante");
const DpagoSchema = require("../models/Dpago");
const Pension_becaSchema = require("../models/Pension_Beca");
const DocumentoSchema = require("../models/Documento");
const FacturacionSchema = require("../models/Facturacion");

var mongoose = require("mongoose");

registro_estudiante_tienda = async function (req, res) {
  let data = req.body;
  var estudiantes_arr = [];

  estudiantes_arr = await Estudiante.find({ email: data.email });

  if (estudiantes_arr.length == 0) {
    if (data.password) {
      bcrypt.hash(data.password, null, null, async function (err, hash) {
        if (hash) {
          data.dni = "";
          data.password = hash;
          var reg = await Estudiante.create(data);
          res.status(200).send({ data: reg });
        } else {
          res.status(200).send({ message: "ErrorServer", data: undefined });
        }
      });
    } else {
      res
        .status(200)
        .send({ message: "No hay una contraseña", data: undefined });
    }
  } else {
    res.status(200).send({
      message: "El correo ya existe, intente con otro.",
      data: undefined,
    });
  }
};

listar_estudiantes_tienda = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    var estudiantes = await Estudiante.find().sort({ createdAt: -1 });
    res.status(200).send({ data: estudiantes });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
listar_pensiones_estudiantes_tienda = async function (req, res) {
  if (req.user) {
    let id = req.params["id"];
    let conn = mongoose.connection.useDb(req.user.base);
    Pension = conn.model("pension", PensionSchema);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    var estudiantes = await Pension.find().populate("idestudiante");
    //console.log(estudiantes[0]);
    let pen = [];
    if (id != "null") {
      estudiantes.forEach((element) => {
        if (
          new Date(element.anio_lectivo).getTime() == new Date(id).getTime()
        ) {
          pen.push(element);
        }
      });
      res.status(200).send({ data: pen });
    } else {
      res.status(200).send({ data: estudiantes });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const listar_documentos_nuevos_publico = async function (req, res) {
  /*let reg = await Producto.find({estado: 'Publicado'}).sort({createdAt:-1}).limit(8);
    res.status(200).send({data: reg});*/
};

const registro_estudiante = async function (req, res) {
  if (req.user) {
    try {
      let conn = mongoose.connection.useDb(req.user.base);
      Registro = conn.model("registro", RegistroSchema);
      Config = conn.model("config", ConfigSchema);
      Pension = conn.model("pension", PensionSchema);
      Pension_Beca = conn.model("pension_beca", Pension_becaSchema);
      Estudiante = conn.model("estudiante", EstudianteSchema);
      var data = req.body;
      console.log(data);
      var estudiantes_arr = [];
      var pension = {};
      if (data != undefined) {
        estudiantes_arr = await Estudiante.find({ dni: data.dni });

        if (estudiantes_arr.length == 0) {
          let reg;

          for (const iterator of data.pensiones) {
            if (data.curso < iterator.curso) {
              data.curso = iterator.curso;
              data.paralelo = iterator.paralelo;
              pension.especialidad = data.especialidad || "EGB";
            }
          }

          reg = await Estudiante.create(data);

          for (const iterator of data.pensiones) {
            pension.paga_mat = iterator.matricula;
            pension.idestudiante = reg.id;
            pension.anio_lectivo = iterator.anio_lectivo.anio_lectivo;
            pension.idanio_lectivo = iterator.anio_lectivo._id;
            pension.condicion_beca = iterator.condicion_beca;
            pension.val_beca = iterator.val_beca;
            if (iterator.arr_etiquetas) {
              pension.num_mes_beca = iterator.arr_etiquetas.length;
              pension.num_mes_res = iterator.arr_etiquetas.length;
            } else {
              pension.num_mes_beca = 0;
              pension.num_mes_res = 0;
            }
            pension.desc_beca = iterator.desc_beca;
            pension.matricula = iterator.matricula;
            pension.curso = iterator.curso;
            pension.paralelo = iterator.paralelo;
            pension.especialidad = data.especialidad || "EGB";
            console.log(pension);

            var reg2 = await Pension.create(pension);
            if (iterator.arr_etiquetas) {
              for (const detalle of iterator.arr_etiquetas) {
                detalle.idpension = reg2._id;
                await Pension_Beca.create(detalle);
              }
            }
          }

          res.status(200).send({ message: "Estudiante agregado con exito" });
        } else {
          res.status(200).send({
            message: "El numero de cédula ya existe en la base de datos",
          });
        }
      } else {
        console.log(error);
        res.status(200).send({ message: "Algo salió mal" });
      }
    } catch (error) {
      console.log(error);
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(200).send({ message: "No Access" });
  }
};
const registro_estudiante_masivo = async function (req, res) {
  if (req.user) {
    try {
      var data = req.body;
      let conn = mongoose.connection.useDb(req.user.base);

      Config = conn.model("config", ConfigSchema);
      Pension = conn.model("pension", PensionSchema);
      Estudiante = conn.model("estudiante", EstudianteSchema);

      let subidos = 0;
      let resubidos = 0;
      let resubidosc = 0;
      let errorneos = 0;
      let errorv = 0;
      var cn = await Config.find().sort({ createdAt: -1 });
      let config = cn[0];

      if (data.length > 0) {
        for (let element of data) {
          var estudiantes_arr = [];
          var pension = {};

          estudiantes_arr = await Estudiante.find({
            nombres: element.nombres,
            apellidos: element.apellidos,
          });
          var a = await Estudiante.find({ dni: element.dni });

          if (estudiantes_arr.length == 0 && a.length == 0) {
            if (!element.password) {
              element.password = element.dni;
            }
            if (element.genero != "Masculino" || element.genero != "Femenino") {
              element.genero = "No definido";
            }
            bcrypt.hash(
              element.password,
              null,
              null,
              async function (err, hash) {
                if (hash) {
                  element.password = hash;
                  var pension = {};
                  if (
                    element.dni_factura == undefined &&
                    element.dni_padre != undefined
                  ) {
                    element.dni_factura = element.dni_padre;
                    element.nombres_factura = element.nombres_padre;
                  }
                  if (
                    element.dni_padre == undefined &&
                    element.dni_factura != undefined
                  ) {
                    element.dni_padre = element.dni_factura;
                    element.nombres_padre = element.nombres_factura;
                  }
                  var reg = await Estudiante.create(element);
                  pension.paga_mat = element.paga_mat;
                  pension.idestudiante = reg.id;
                  pension.anio_lectivo = config.anio_lectivo;
                  pension.idanio_lectivo = config._id;
                  pension.condicion_beca = element.condicion_beca;
                  pension.val_beca = element.val_beca;
                  pension.num_mes_beca = element.num_mes_beca;
                  pension.num_mes_res = element.num_mes_beca;
                  pension.desc_beca = element.desc_beca;
                  pension.matricula = element.matricula;
                  pension.curso = element.curso;
                  pension.paralelo = element.paralelo;
                  pension.especialidad = element.especialidad || "EGB";

                  var reg2 = await Pension.create(pension);

                  ////console.log(res);
                }
              }
            );
            subidos = subidos + 1;
            // ////console.log("1",subidos);
            //  res.status(200).send({message:'Estudiante agregado con exito'});
          } else if (
            (estudiantes_arr[0] != undefined &&
              estudiantes_arr[0].estado == "Desactivado") ||
            (a[0] != undefined && a[0].estado == "Desactivado")
          ) {
            /*  if(!element.password){
                                    element.password=element.dni
                                }
                                bcrypt.hash(element.password,null,null, async function(err,hash){
                                    if(hash){
                                        element.password=hash;*/
            if (
              element.dni_factura == undefined &&
              element.dni_padre != undefined
            ) {
              element.dni_factura = element.dni_padre;
              element.nombres_factura = element.nombres_padre;
            }
            if (
              element.dni_padre == undefined &&
              element.dni_factura != undefined
            ) {
              element.dni_padre = element.dni_factura;
              element.nombres_padre = element.nombres_factura;
            }

            let reg = await Estudiante.updateOne(
              { dni: element.dni },
              {
                estado: "Activo",
                genero: element.genero,
                nombres: element.nombres,
                apellidos: element.apellidos,
                email: element.email,
                telefono: element.telefono,
                password: element.password,
                curso: element.curso,
                paralelo: element.paralelo,
                especialidad: element.especialidad || "EGB",
                nombres_padre: element.nombres_padre,
                dni_padre: element.dni_padre,
                nombres_factura: element.nombres_factura,
                dni_factura: element.dni_factura,
              }
            );
            var est = await Estudiante.find({ dni: element.dni });
            ////console.log(est);
            ////console.log(est[0]._id);
            ////console.log(est[0].estado);
            //busca pension del año lectivo activo
            let pen = await Pension.find({
              idestudiante: est[0]._id,
              anio_lectivo: config.anio_lectivo,
            });

            if (pen.length == 0) {
              pension.paga_mat = element.paga_mat;
              // pension.meses=meses;
              pension.idestudiante = est[0]._id;
              pension.anio_lectivo = config.anio_lectivo;
              pension.idanio_lectivo = config._id;
              pension.condicion_beca = element.condicion_beca;
              pension.val_beca = element.val_beca;
              pension.num_mes_beca = element.num_mes_beca;
              pension.num_mes_res = element.num_mes_beca;
              pension.desc_beca = element.desc_beca;
              pension.matricula = element.matricula;
              pension.curso = element.curso;
              pension.paralelo = element.paralelo;
              pension.especialidad = element.especialidad || "EGB";
              //////console.log(pension);
              var reg2 = await Pension.create(pension);
              resubidos = resubidos + 1;
              //  ////console.log("2",resubidos);
              //  res.status(200).send({message:'Reactivado'});
            } else {
              await Pension.updateOne(
                { idestudiante: est[0]._id, anio_lectivo: config.anio_lectivo },
                {
                  paga_mat: element.paga_mat,
                  //meses:meses,
                  curso: element.curso,
                  paralelo: element.paralelo,
				  especialidad: element.especialidad || "EGB",
                }
              );
              resubidosc = resubidosc + 1;
              // ////console.log("3",resubidosc);
              // res.status(200).send({message:'Reactivado existing pension'});
            }

            // }});
          } else {
            errorneos = errorneos + 1;
            // ////console.log("4",errorneos);
            // res.status(200).send({message:'El numero de cédula ya existe en la base de datos'});
          }
        }

        /*for (var i=0;i<data.length;i++){
                    var element=data[i];
                    //console.log(i);

                   
                }*/

        ////console.log("1",subidos,"2",resubidos,"3",resubidosc,"4",errorneos,"5",errorv);

        res.status(200).send({
          s: subidos,
          r: resubidos,
          rc: resubidosc,
          e: errorneos,
          ev: errorv,
        });
      } else {
        ////console.log("6",subidos);
        ////console.log("7",resubidos);
        ////console.log("8",resubidosc);
        ////console.log("9",errorneos);
        ////console.log("10",errorv);
        res.status(200).send({
          s: subidos,
          r: resubidos,
          rc: resubidosc,
          e: errorneos,
          ev: -999,
        });
      }
    } catch (error) {
      //console.log(error);
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(200).send({ message: "No Access" });
  }
};

const login_estudiante = async function (req, res) {
  var data = req.body;
  var estudiante_arr = [];

  estudiante_arr = await Estudiante.find({ email: data.email });

  if (estudiante_arr.length == 0) {
    res
      .status(200)
      .send({ message: "No se encontro el correo", data: undefined });
  } else {
    //LOGIN
    let user = estudiante_arr[0];
    bcrypt.compare(data.password, user.password, async function (error, check) {
      if (check) {
        if (data.carrito.length >= 1) {
          for (var item of data.carrito) {
            await Carrito.create({
              cantidad: item.cantidad,
              documento: item.documento._id,
              variedad: item.variedad.id,
              estudiante: user._id,
            });
          }
        }

        res.status(200).send({
          data: user,
          token: jwt.createToken(user),
        });
      } else {
        res
          .status(200)
          .send({ message: "La contraseña no coincide", data: undefined });
      }
    });
  }
};

const obtener_estudiante_guest = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    var id = req.params["id"];
    try {
      let estudiante = await Estudiante.findById({ _id: id });
      //  //////console.log(estudiante);
      res.status(200).send({ data: estudiante });
    } catch (error) {
      res.status(200).send({ data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const obtener_pension_estudiante_guest = async function (req, res) {
  //var pen={};

  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Pension = conn.model("pension", PensionSchema);
    Config = conn.model("config", ConfigSchema);
    var id = req.params["id"];
    try {
      let estudiante = await Pension.find({ idestudiante: id })
        .populate("idanio_lectivo")
        .sort({ createdAt: 1 });
      // //console.log("E",estudiante);
      //pen = Object.assign(estudiante);

      ////console.log("P",pen);
      res.status(200).send({ data: estudiante });
    } catch (error) {
      res.status(200).send({ data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const obtener_config_admin = async (res) => {
  var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
  let config = cn[0];
  //////console.log(config);
  res.status(200).send({ data: config });
};

const actualizar_estudiante_admin = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    Config = conn.model("config", ConfigSchema);
    Pension = conn.model("pension", PensionSchema);
    Pension_Beca = conn.model("pension_beca", Pension_becaSchema);
    var id = req.params["id"];
    let data = req.body;
    //////console.log(data);
    var reg = await Estudiante.updateOne(
      { _id: id },
      {
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        genero: data.genero,
        email: data.email,
        dni: data.dni,
        curso: data.curso,
        paralelo: data.paralelo,
		especialidad: data.especialidad||"EGB",
        nombres_padre: data.nombres_padre,
        email_padre: data.email_padre,
        dni_padre: data.dni_padre,
        nombres_factura: data.nombres_factura,
        dni_factura: data.dni_factura,
        direccion: data.direccion,
      }
    );

    if (data.password) {
      bcrypt.hash(data.password, null, null, async function (err, hash) {
        if (hash) {
          data.password = hash;
          var reg = await Estudiante.updateOne(
            { _id: id },
            {
              password: data.password,
            }
          );
        }
      });
    }

    var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
    let config = cn[0];
    var reg2 = await Pension.find({
      idestudiante: id,
      idanio_lectivo: config._id,
    });
    ////console.log(reg2);
    try {
      if (reg2.length == 1) {
        var i = 0;
        var fecha2 = [],
          meses;
        if (data.desc_beca == 100) {
          for (let j = 0; j < 10; j++) {
            fecha2.push({
              date: new Date(reg2[i].anio_lectivo).setMonth(
                new Date(reg2[i].anio_lectivo).getMonth() + j
              ),
            });
          }
          var des = 0;
          fecha2.forEach((element) => {
            if (new Date(element.date).getMonth() == 11) {
              des = 1;
            }
          });
          if (des == 1) {
            if (data.num_mes_beca <= 9) {
              meses = data.num_mes_beca;
            } else {
              meses = 9;
            }
          } else {
            meses = data.num_mes_beca;
          }
        } else {
          meses = reg2[i].meses;
        }
        if (data.condicion_beca == "Si") {
          ////console.log(data);

          if (reg2[i].num_mes_beca != undefined) {
            var aux = reg2[i].num_mes_beca - data.num_mes_beca;
            //////console.log(aux);
            if (aux <= 0) {
              var reg3 = await Pension.updateOne(
                { _id: reg2[i]._id },
                {
                  paga_mat: data.paga_mat,
                  //meses:meses,
                  matricula: data.matricula,
                  condicion_beca: data.condicion_beca,
                  desc_beca: data.desc_beca,
                  val_beca: data.val_beca,
                  num_mes_beca: data.num_mes_beca,
                  num_mes_res:
                    reg2[i].num_mes_res +
                    (data.num_mes_beca - reg2[i].num_mes_beca),
                  curso: data.curso,
                  paralelo: data.paralelo,
				  especialidad: data.especialidad || "EGB",
                }
              );

              var el = await Pension_Beca.deleteMany({ idpension: data._id });
              // //console.log(el);
              //console.log(data.pension_beca);
              var detalles = data.pension_beca;
              for (var element of detalles) {
                var an = await Pension_Beca.create(element);
              }

              res
                .status(200)
                .send({ message: "Actualizado con exito", data: reg3 });
            } else {
              if (
                reg2[i].num_mes_res -
                  (reg2[i].num_mes_beca - data.num_mes_beca) >=
                0
              ) {
                var reg3 = await Pension.updateOne(
                  { _id: reg2[i]._id },
                  {
                    paga_mat: data.paga_mat,
                    // meses:meses,
                    matricula: data.matricula,
                    condicion_beca: data.condicion_beca,
                    desc_beca: data.desc_beca,
                    val_beca: data.val_beca,
                    num_mes_beca: data.num_mes_beca,
                    num_mes_res:
                      reg2[i].num_mes_res -
                      (reg2[i].num_mes_beca - data.num_mes_beca),
                    curso: data.curso,
                    paralelo: data.paralelo,
					especialidad: data.especialidad || "EGB",
                  }
                );
                var el = await Pension_Beca.deleteMany({ idpension: data._id });
                // //console.log(el);
                //console.log(data.pension_beca);
                var detalles = data.pension_beca;
                for (var element of detalles) {
                  var an = await Pension_Beca.create(element);
                }

                res
                  .status(200)
                  .send({ message: "Actualizado con exito", data: reg3 });
              } else {
                res.status(200).send({
                  message:
                    "Error de consistencia el número de meses con becas usados es mayor a los meses asignados",
                });
              }
            }
          } else {
            var reg3 = await Pension.updateOne(
              { _id: reg2[i]._id },
              {
                paga_mat: data.paga_mat,
                //meses:meses,
                matricula: data.matricula,
                condicion_beca: data.condicion_beca,
                desc_beca: data.desc_beca,
                val_beca: data.val_beca,
                num_mes_beca: data.num_mes_beca,
                num_mes_res: data.num_mes_beca,
                curso: data.curso,
                paralelo: data.paralelo,
				especialidad: data.especialidad || "EGB",
              }
            );

            var el = await Pension_Beca.deleteMany({ idpension: data._id });
            // //console.log(el);
            //console.log(data.pension_beca);
            var detalles = data.pension_beca;
            for (var element of detalles) {
              var an = await Pension_Beca.create(element);
            }
            res
              .status(200)
              .send({ message: "Actualizado con exito", data: reg3 });
          }
        } else {
          var reg3 = await Pension.updateOne(
            { _id: reg2[i]._id },
            {
              /*condicion_beca: 'No',
                                desc_beca :'',
                                val_beca:'',
                                num_mes_beca:'',
                                num_mes_res:'',*/
              curso: data.curso,
              paralelo: data.paralelo,
			  especialidad: data.especialidad || "EGB",
            }
          );
          //var el = await Pension_Beca.deleteMany({idpension:data._id});
          //////console.log(reg3);
          res
            .status(200)
            .send({ message: "Actualizado con exito", data: reg3 });
        }
      } else {
        res
          .status(200)
          .send({ message: "Pension no encontrada, algo salió mal" });
      }
    } catch (error) {
      //console.log(error);
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

//---METODOS PUBLICOS----------------------------------------------------

const obtener_ordenes_estudiante = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    var id = req.params["id"];

    let reg = await Pago.find({ estudiante: id }).sort({ createdAt: -1 });
    res.status(200).send({ data: reg });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const enviar_email_pedido_compra = async function (pago) {
  try {
    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          throw err;
          callback(err);
        } else {
          callback(null, html);
        }
      });
    };

    var transporter = nodemailer.createTransport(
      smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          user: "diegoalonssoac@gmail.com",
          pass: "dcmplvjviofjojgf",
        },
      })
    );

    var orden = await Pago.findById({ _id: pago })
      .populate("estudiante")
      .populate("direccion");
    var dpago = await Dpago.find({ pago: pago })
      .populate("documento")
      .populate("variedad");

    readHTMLFile(process.cwd() + "/mails/email_pedido.html", (err, html) => {
      let rest_html = ejs.render(html, { orden: orden, dpago: dpago });

      var template = handlebars.compile(rest_html);
      var htmlToSend = template({ op: true });

      var mailOptions = {
        from: "diegoalonssoac@gmail.com",
        to: orden.estudiante.email,
        subject: "Gracias por tu orden, Prágol.",
        html: htmlToSend,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
          //////console.log('Email sent: ' + info.response);
        }
      });
    });
  } catch (error) {
    //////console.log(error);
  }
};

const bart = require("./bart");

const obtener_detalles_ordenes_estudiante = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Admin = conn.model("admin", AdminSchema);
    Pago = conn.model("pago", VentaSchema);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    Documento = conn.model("document", DocumentoSchema);
    Pension = conn.model("pension", PensionSchema);
    Dpago = conn.model("dpago", DpagoSchema);

    Facturacion = conn.model("facturacion", FacturacionSchema);
    ctacon = await Facturacion.find({});

    var id = req.params["id"];
    //////console.log(id.toString());
    try {
      let pago = await Pago.findById({ _id: id })
        .populate("estudiante")
        .populate("encargado");
      let detalles = await Dpago.find({ pago: pago._id })
        .populate("documento")
        .populate("idpension");
      //console.log("12");
      //bart.gnerar_xml({data: pago, detalles: detalles,conf_fact:ctacon[0], base:req.user.base});
      //bart.firma({ data: pago, detalles: detalles,conf_fact:ctacon[0], base:req.user.base});
      res.status(200).send({ data: pago, detalles: detalles });
    } catch (error) {
      //////console.log(error);
      res.status(200).send({ message: "No tiene pagos", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

//const xml = fs.readFileSync('ruta/al/archivo.xml');

const forge = require("node-forge");
//forge.options.usePureJavaScript = true;
const { parseString, Builder } = require("xml2js");
const fr2 = require("./factura_electronica");

function toJson(xml) {
  parseString(xml, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log("String XML", result);
    return result;
    //toXML(result)
  });
}
const factura = require("./facturacion");
function soapprueba2(pagos) {
  try {
    //console.log('2',pagos);
    factura.estructuraFactura.factura.infoFactura.fechaEmision = (
      new Date().getDate() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      new Date().getFullYear()
    ).toString();

    factura.estructuraFactura.factura.infoTributaria.codDoc =
      pagos.conf_fact.codDoc; //llamar
    factura.estructuraFactura.factura.infoTributaria.ruc =
      pagos.data.estudiante.dni_factura; //llamar
    factura.estructuraFactura.factura.infoTributaria.ambiente =
      pagos.conf_fact.ambiente; //llamar
    factura.estructuraFactura.factura.infoTributaria.estab =
      pagos.conf_fact.estab; //llamar
    factura.estructuraFactura.factura.infoTributaria.ptoEmi =
      pagos.conf_fact.ptoEmi; ///llamar
    factura.estructuraFactura.factura.infoTributaria.secuencial =
      pagos.conf_fact.secuencial; //llamar

    factura.estructuraFactura.factura.infoTributaria.tipoEmision = "1"; //perma

    //console.log(factura.estructuraFactura);
    //GENERAR XML DE FACTURA-------------------------------------
    var a = factura.archivoXML();
    //console.log(a);
    if (!fs.existsSync("./facturas/" + pagos.base + "/generados/")) {
      fs.mkdirSync("./facturas/" + pagos.base + "/generados/", {
        recursive: true,
      });
    }

    fs.writeFile(
      "./facturas/" + pagos.base + "/generados/" + a.clave + ".xml",
      a.xml.toString({ pretty: true }),
      {
        encoding: "utf8",
        flag: "w",
        mode: 0o666,
      },
      (error) => {
        if (error) console.log(error);
        else {
          console.log("XML GENERADO\n");
          console.log("PREVIO A FIRMA");
          const xml = fs.readFileSync(
            "./facturas/" + pagos.base + "/generados/" + a.clave + ".xml",
            "utf8"
          );
          //console.log(xml);
          var b = factura.cargarArchivoFirma(
            a.xml,
            "./facturas/" + pagos.base + "/accesos/" + pagos.conf_fact.archivo,
            pagos.conf_fact.password
          );
          if (!fs.existsSync("./facturas/" + pagos.base + "/firmados/")) {
            fs.mkdirSync("./facturas/" + pagos.base + "/firmados/", {
              recursive: true,
            });
          }

          fs.writeFile(
            "./facturas/" + pagos.base + "/firmados/" + a.clave + ".xml",
            b.toString({ pretty: true }),
            {
              encoding: "utf8",
              flag: "w",
              mode: 0o666,
            },
            (error) => {
              if (error) console.log(error);
              else {
                console.log("XML GENERADO\n");
                console.log("Listo para enviar");
              }
            }
          );
        }
      }
    );

    //console.log(b);
    /*
		fs.writeFile('./facturas/generados/'+a.clave+'.xml',a.xmlresult.toString({ pretty: true}),  {
			encoding: "utf8",
			flag: "w",
			mode: 0o666
		  },(error)=>{
			if (error)
				console.log(error);
			else {
				console.log("XML GENERADO\n");
				console.log("PREVIO A FIRMA");
				const xml = fs.readFileSync('./facturas/generados/'+a.clave+'.xml','utf8');
				console.log(xml);
			}
		}
		);*/
  } catch (error) {
    console.log(error);
  }
}

const soapprueba = async function () {
  try {
    //GENERAR XML DE FACTURA-------------------------------------
    var a = fr2.p_generar_factura_xml();
    //console.log(a);
    fs.writeFile(
      "./facturas/generados/" + a.clave + ".xml",
      a.xmlresult.toString({ pretty: true }),
      {
        encoding: "utf8",
        flag: "w",
        mode: 0o666,
      },
      (error) => {
        if (error) console.log(error);
        else {
          console.log("XML GENERADO\n");
          console.log("PREVIO A FIRMA");

          const xml = fs.readFileSync(
            "./facturas/generados/" + a.clave + ".xml",
            "utf8"
          );
          //console.log(xml);

          const p12File = fs.readFileSync(
            "./facturas/accesos/DAVID DANIEL PANCHI CANDONGA 020223164208.p12",
            null
          );
          //const buffer = Buffer.from(p12File, 'binary');
          const pem = forge.util.decode64(p12File.toString("base64"));
          //console.log(pem);
          const p12Asn1 = forge.asn1.fromDer(pem);
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, "DpMaMd919314");
          const certificate = p12.getBags({ bagType: forge.pki.oids.certBag })[
            forge.pki.oids.certBag
          ][0].cert;
          const privateKey = p12.getBags({
            bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
          })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

          const SignedXml = require("xml-crypto").SignedXml;

          const sig = new SignedXml();

          sig.addReference("//*[local-name(.)='//factura']", [
            "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
            "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
          ]);
          sig.signingKey = privateKey;
          sig.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
          sig.keyInfoProvider = {
            getKeyInfo: function (key) {
              return (
                "<X509Data><X509Certificate>" +
                forge.util.encode64(certificate) +
                "</X509Certificate></X509Data>"
              );
            },
          };

          //console.log(xml);
          const xmlConDoctype = `<!DOCTYPE foo SYSTEM "foo.dtd">\n${xml.toString()}`;
          console.log(a.xmlresult);
          const xml2js = require("xml2js");
          const parser = new xml2js.Parser({ trim: true });
          const documento = parser.parseString(a.xmlresult, (err, result) => {
            //console.log(xmlConDoctype);
            if (err) {
              console.error(err);
              return;
            }
            // console.log("Result: ",result);
            return result;
          });
          console.log("Documento", documento);

          sig.computeSignature(a.xmlresult);
          console.log("Documento", sig.getSignedXml());
          const signedXml = sig.getSignedXml();
          fs.writeFileSync(
            "./facturas/firmados/" + a.clave + ".xml",
            signedXml
          );

          //FIRMAR XML DE FACTURA
          fs.open(
            "./facturas/generados/" + a.clave + ".xml",
            "r",
            function (err, factura) {
              if (err != undefined) {
                console.log(err);
              }

              /*
					fr2.p_generar_xades_bes(factura, function(factura_firmada, claveAcceso){

						fs.writeFile('./facturas/firmados/'+claveAcceso+'.xml',factura_firmada,  {
							encoding: "utf8",
							flag: "w",
							mode: 0o666
						},(error)=>{
							if (error)
								console.log(error);
							else {
								console.log("XML FIRMADO\n");
								console.log("LISTO PARA ENVIAR");
								
								//console.log(fs.readFileSync('./facturas/firmados/'+claveAcceso+'.xml', "utf8"));
								//RegistrarFactura({xml:claveAcceso},{});
							}
						});
					});*/
            }
          );
        }
      }
    );

    /*
		var a= fr.p_calcular_digito_modulo11(valr);
		console.log(a);
		//var b = fr.p_generar_factura_xml();
		//console.log(b);
		var c,e
		c=fs.readFileSync('./facturas/generados/2104202101176000384000110010010000836331234567819.xml','Utf-8');
		parseString(c,  "text/xml", function(error, result) {
			//console.log(result);
			var d =fr.p_generar_xades_bes(result)
			
			return result
			//toXML(result)
		});
		*/

    //var c = fr.p_generar_xades_bes(b.d);

    console.log(d);
    //firmaelectronica('2104202101176000384000110010010000836331234567819');

    //RegistrarFactura(1,0);
    /*

		arch='factura_V2.1.0.xml';
		let xml;
		let js;
		/*
			fs.readdir('./facturas/plantilla/', (error,files)=>{
				if(error){
					console.log('No existe el directorio');
				}else{
					fs.stat('./facturas/plantilla/' + arch, function (err) {
						let path_arch;
						if (!err) {
							path_arch = './facturas/plantilla/' + arch;	
						} else {
							path_arch = './facturas/plantilla/factura_V2.1.0.xml';
						}
						xml= fs.readFileSync(path_arch,'UTF-8');
						//console.log(xml);
						parseString(xml, { explicitArray: false }, function(error, result) {
							//console.log(result);
							js=Object.assign(result);
							var a = claveAcceso();
							//console.log(a);
							//configurando el archivo de correo
							js.factura.infoTributaria.claveAcceso=a.toString();
							//console.log(js);
							var xmlresult=toXML(js);
							//console.log(xmlresult);
							fs.writeFile('./facturas/generados/'+a+'.xml',xmlresult,  {
								encoding: "utf8",
								flag: "w",
								mode: 0o666
							  },(error)=>{
								if (error)
									console.log(error);
								else {
									console.log("File written successfully\n");
									console.log("The written has the following contents:");
									
									//console.log(fs.readFileSync('./facturas/generados/'+a+'.xml', "utf8"));
								}
							});

							firmaelectronica(a);

						});
						
					});
				}
				
			});*/

    //var ejem=fs.readFileSync('./facturas/generados/2702202301080200986000120011000000000041524132219.xml','Utf-8');

    //ejem=Buffer.from(ejem, 'base64');
    //console.log('2',ejem);
    /*var x=''
			for(var i=0; i<=ejem.length;i++){
				x=x+ejem[i];
			}
			//console.log(x);
			//var j=Buffer.from(fs.readFileSync('./facturas/generados/2702202301080200986000120011000000000041524132219.xml'),'Utf-8');
			//console.log(j);
			/*
			
			//ejem=btoa(ejem);
			//
			args.xml=ejem;
			var k=btoa(j);
			const bytes = Uint8Array.from({ length: ejem.length }, (element, index) =>
				ejem.charCodeAt(index)
			);
			const charCodes = new Uint16Array(bytes.buffer)
			//console.log("981",bytes);

			const buffer = new ArrayBuffer(ejem.length);
			//console.log(buffer);
			const view = new Uint8Array.from(j);
			//console.log(view);
			*/
    //args={'xml':new Array(ejem)};
    //console.log(args);

    soap.createClientAsync(urlrecep).then((client) => {
      client.wsdl.xml = ejem;
      //console.log(client)
      //console.log(client.wsdl.xml);
      //console.log(client.wsdl.definitions);
      //claveAcceso();

      client.validarComprobante(
        client.wsdl.xml,
        "2702202301080200986000120011000000000041524132219",
        (error, result) => {
          if (error == null) {
            console.log("Resultado", result);
            console.log("Resultado", result.RespuestaRecepcionComprobante);
            console.log(
              "Resultado",
              result.RespuestaRecepcionComprobante.estado
            );
            console.log(
              "Resultado",
              result.RespuestaRecepcionComprobante.comprobantes
            );
            console.log(
              "Resultado",
              result.RespuestaRecepcionComprobante.comprobantes.comprobante
                .mensajes
            );
            return result;
          } else {
            console.log("Error", error);
          }
        }
      );
    });

    // async/await
    var client = await soap.createClientAsync(urlrecep);
    //console.log("995",client);

    var result = await client.validarComprobanteAsync(
      args,
      (error, result1) => {
        console.log("997 Error", error.RespuestaRecepcionComprobante);
        console.log("997 result", result1.RespuestaRecepcionComprobante);
      }
    );
    //console.log("1000",result);
  } catch (error) {}
};

const obtener_detalles_por_estudiante = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Pago = conn.model("pago", VentaSchema);
    Dpago = conn.model("dpago", DpagoSchema);
    let detalles = [];
    var id = req.params["id"];
    //////console.log(id.toString());
    try {
      let pago = await Pago.find({ estudiante: id });
      //////console.log(pago);
      for (let i of pago) {
        //////console.log(i._id);
        var aux = await Dpago.find({ pago: i._id });
        //////console.log(aux);
        for (let k of aux) {
          detalles.push({
            idpension: k.idpension,
            documento: k.documento,
            valor: k.valor,
            tipo: k.tipo,
            estado: k.estado,
            pago: k.pago,
          });
        }

        //////console.log(detalles);
      }
      res.status(200).send({ data: pago, detalles: detalles });
    } catch (error) {
      //////console.log(error);
      res.status(200).send({ message: "No tiene pagos", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const emitir_review_producto_estudiante = async function (req, res) {
  if (req.user) {
    let data = req.body;
    let reg = await Review.create(data);
    res.status(200).send({ data: reg });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const obtener_review_producto_estudiante = async function (req, res) {
  let id = req.params["id"];
  let reg = await Review.find({ documento: id }).sort({ createdAt: -1 });
  res.status(200).send({ data: reg });
};

const obtener_reviews_producto_publico = async function (req, res) {
  let id = req.params["id"];

  let reviews = await Review.find({ documento: id })
    .populate("estudiante")
    .sort({ createdAt: -1 });
  res.status(200).send({ data: reviews });
};

const comprobar_carrito_estudiante = async function (req, res) {
  if (req.user) {
    try {
      var data = req.body;
      var detalles = data.detalles;
      let access = false;
      let producto_sl = "";

      for (var item of detalles) {
        let variedad = await Variedad.findById({ _id: item.variedad }).populate(
          "documento"
        );
        if (variedad.stock < item.cantidad) {
          access = true;
          producto_sl = variedad.documento.titulo;
        }
      }

      if (!access) {
        res.status(200).send({ pago: true });
      } else {
        res.status(200).send({
          pago: false,
          message: "Stock insuficiente para " + producto_sl,
        });
      }
    } catch (error) {
      //////console.log(error);
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const consultarIDPago = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Pago = conn.model("pago", VentaSchema);
    var id = req.params["id"];
    var pagos = await Pago.find({ transaccion: id });
    res.status(200).send({ data: pagos });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const registro_compra_estudiante = async function (req, res) {
  if (req.user) {
    mongoose.connection.useDb(req.user.base);
    var data = req.body;
    var detalles = data.detalles;

    data.estado = "Procesando";

    let pago = await Pago.create(data);

    for (var element of detalles) {
      element.pago = pago._id;
      await Dpago.create(element);

      let element_producto = await Producto.findById({
        _id: element.documento,
      });
      let new_stock = element_producto.stock - element.cantidad;
      let new_pagos = element_producto.npagos + 1;

      let element_variedad = await Variedad.findById({ _id: element.variedad });
      let new_stock_variedad = element_variedad.stock - element.cantidad;

      await Producto.findByIdAndUpdate(
        { _id: element.documento },
        {
          stock: new_stock,
          npagos: new_pagos,
        }
      );

      await Variedad.findByIdAndUpdate(
        { _id: element.variedad },
        {
          stock: new_stock_variedad,
        }
      );

      //limpiar carrito
      await Carrito.remove({ estudiante: data.estudiante });
    }

    //enviar_orden_compra(pago._id);

    res.status(200).send({ data: pago });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const obtener_reviews_estudiante = async function (req, res) {
  if (req.user) {
    let id = req.params["id"];
    let reg = await Review.find({ estudiante: id })
      .populate("estudiante")
      .populate("documento");
    res.status(200).send({ data: reg });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const enviar_mensaje_contacto = async function (req, res) {
  let data = req.body;

  data.estado = "Abierto";
  let reg = await Contacto.create(data);
  res.status(200).send({ data: reg });
};

const enviar_orden_compra = async function (pago) {
  try {
    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          throw err;
          callback(err);
        } else {
          callback(null, html);
        }
      });
    };

    var transporter = nodemailer.createTransport(
      smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          user: "diegoalonssoac@gmail.com",
          pass: "dcmplvjviofjojgf",
        },
      })
    );

    var orden = await Pago.findById({ _id: pago })
      .populate("estudiante")
      .populate("direccion");
    var dpago = await Dpago.find({ pago: pago })
      .populate("documento")
      .populate("variedad");

    readHTMLFile(process.cwd() + "/mails/email_compra.html", (err, html) => {
      let rest_html = ejs.render(html, { orden: orden, dpago: dpago });

      var template = handlebars.compile(rest_html);
      var htmlToSend = template({ op: true });

      var mailOptions = {
        from: "diegoalonssoac@gmail.com",
        to: orden.estudiante.email,
        subject: "Confirmación de compra " + orden._id,
        html: htmlToSend,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
          //////console.log('Email sent: ' + info.response);
        }
      });
    });
  } catch (error) {
    //////console.log(error);
  }
};

///REGISTRO DE PAGOS

listar_estudiantes_pago = async function (req, res) {
  if (req.user) {
    let conn = mongoose.connection.useDb(req.user.base);
    Estudiante = conn.model("estudiante", EstudianteSchema);

    try {
      // Seleccionar solo los campos necesarios
      var estudiantes = await Estudiante.find(
        {},
        "_id nombres apellidos dni estado f_desac anio_desac nombres_factura dni_factura"
      ).sort({ createdAt: -1 });

      res.status(200).send({ data: estudiantes });
    } catch (error) {
      res.status(500).send({
        message: "Error al obtener los estudiantes",
        error: error.message,
      });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

module.exports = {
  registro_estudiante_tienda,
  listar_estudiantes_tienda,
  listar_documentos_nuevos_publico,
  registro_estudiante,
  registro_estudiante_masivo,
  login_estudiante,
  obtener_estudiante_guest,
  actualizar_estudiante_admin,

  obtener_ordenes_estudiante,
  obtener_detalles_ordenes_estudiante,
  obtener_detalles_por_estudiante,
  comprobar_carrito_estudiante,
  consultarIDPago,
  registro_compra_estudiante,
  obtener_reviews_estudiante,
  enviar_mensaje_contacto,
  obtener_pension_estudiante_guest,
  listar_pensiones_estudiantes_tienda,

  listar_estudiantes_pago,
};
//comentario 2
//Comentario de prueba
//Comentario ultimo actualizado
