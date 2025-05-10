//var AdminInstituto = require('../models/AdminInstituto');
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../helpers/jwt");
var fs = require("fs");
var handlebars = require("handlebars");
var ejs = require("ejs");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var path = require("path");

let Estudiante = require("../models/Estudiante");
let Factura = require("../models/Facturacion");
let Pago = require("../models/Pago");
let Dpago = require("../models/Dpago");
let Registro = require("../models/Registro");
let Admin = require("../models/Admin");
let AdminInstituto = require("../models/AdminInstituto");
let Institucion = require("../models/Institucion");

const FacturaSchema = require("../models/Facturacion");
const AdminInstitutoSchema = require("../models/AdminInstituto");
const AdminSchema = require("../models/Admin");
const RegistroSchema = require("../models/Registro");
const DpagoSchema = require("../models/Dpago");
const DocumentoSchema = require("../models/Documento");
const InstitucionSchema = require("../models/Institucion");

const ConfigPSchema = require("../models/Config_plana");

var mongoose = require("mongoose");

const modelsService = require("../service/models.service");

const getDashboar_estudiante = async function (req, res) {
  if (req.user) {
    try {
      let obj = "";
      let ms = "";
      const filePath = "./uploads/dashboar_estudiante.json";

      if (fs.existsSync(filePath)) {
        fs.stat(filePath, (err, stat) => {
          if (err) {
            // Manejar el error aquí
            return res.status(400).json({ message: "Algo salio mal" + err });
          } else if (stat.size === 0) {
            console.log("El archivo JSON está vacío");
          } else {
            // El archivo no está vacío, se puede analizar sin problemas
            const contenido = fs.readFileSync(filePath, "utf8");
            obj = JSON.parse(contenido);
          }
        });
      } else {
        ms = "No existe el archivo";
      }
      return res.status(200).json({ obj: obj, ms: ms });
    } catch (error) {
      return res.status(400).json({ message: "Algo salio mal" + error });
    }
  }
};
const actualizzas_dash = async function (req, res) {
  if (req.user) {
    try {
      const filePath = "./uploads/dashboar_estudiante.json";
      const fileContent = JSON.stringify(req.body);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, fileContent);
      } else {
        fs.writeFileSync(filePath, fileContent);
      }
      return res.status(200).json({ message: "Guardado con exito" });
    } catch (error) {
      return res.status(400).json({ message: "Algo salio mal" + error });
    }
  }
};
const forgotpassword = async function (req, res) {
  var data = req.body;
  if (!data) {
    return res.status(400).json({ message: "Usuario requerido" });
  }

  try {
    let conn = mongoose.connection.useDb("Instituciones");
    AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
    let brujula = await AdminInstituto.find();

    for (let index = 0; index < brujula.length; index++) {
      const element = brujula[index];

      conn = mongoose.connection.useDb(element.base);
      Admin = conn.model("admin", AdminSchema);
      admin_arr = await Admin.find({ email: data.email });
      if (admin_arr.length != 0) {
        if (element.estado != "deshabilitado") {
          const tokenfp = jwt.sign(admin_arr[0]);
          //verificarlink = 'http://localhost:4200/' + `new-password/${tokenfp}`;
          verificarlink = "http://incorp.tk/" + `new-password/${tokenfp}`;
          admin_arr[0].password = undefined;
          enviar_password(verificarlink, admin_arr[0]);

          return res
            .status(200)
            .json({ message: "Revisa tu bandeja de mensajes" });
        } else {
          return res
            .status(200)
            .json({ message: "Su institución se encuentra Deshabilitada" });
        }
      }
    }
  } catch (error) {
    return res.status(200).json({ message: "Revisa tu bandeja de mensajes" });
  }
};
const obtener_portada = async function (req, res) {
  var img = req.params["img"];

  fs.stat("./uploads/instituciones/" + img, function (err) {
    if (!err) {
      let path_img = "./uploads/instituciones/" + img;
      res.status(200).sendFile(path.resolve(path_img));
    } else {
      let path_img = "./uploads/default.jpg";
      res.status(200).sendFile(path.resolve(path_img));
    }
  });
};
const enviar_password = async function (link, userdata) {
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
          //user: 'saamare99@gmail.com',
          //pass: 'hxnnpwpthnirvxbo',
          user: "incorp.odoo1@gmail.com",
          pass: "vnixbyewlzmrqchw",
        },
      })
    );

    readHTMLFile(process.cwd() + "/mails/email_password.html", (err, html) => {
      let rest_html = ejs.render(html, { userdata: userdata, link: link });

      var template = handlebars.compile(rest_html);
      var htmlToSend = template({ op: true });

      var mailOptions = {
        //from: 'saamare99@gmail.com',
        from: "incorp.odoo1@gmail.com",
        to: userdata.email,
        subject: "Cambio de contraseña",
        html: htmlToSend,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
          console.log("Email sent: " + info.response);
        }
      });
    });
  } catch (error) {
    res.status(200).send({ message: "Algo salio mal" });
  }
};
const newpassword = async function (req, res) {
  if (req.user) {
    try {
      var data = req.body;
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Admin, Registro } = models;

      bcrypt.hash(data.password, null, null, async function (err, hash) {
        if (hash) {
          data.password = hash;
          await Admin.updateOne(
            { _id: req.user.sub },
            {
              password: data.password,
            }
          );
          let registro = {};
          registro.admin = req.user.sub;
          registro.tipo = "actualizo";
          registro.descripcion = JSON.stringify(data);
          await Registro.create(registro);
          res.status(200).send({ message: "Actualizado con exito" });
        }
      });
    } catch (error) {
      res.status(200).send({ message: "Algo salio mal" });
    }
  } else {
    res.status(200).send({ message: "NoAccess" });
  }
};
const create_institucion = async function (req, res) {
  try {
    const data = req.body;
    const conn = mongoose.connection.useDb("Instituciones");
    const AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
    const Institucion = conn.model("instituto", InstitucionSchema);
    const Registro = conn.model("registro", RegistroSchema);

    // Validar duplicados
    const adminExiste = await AdminInstituto.exists({ email: data.email });
    const baseExiste = await AdminInstituto.exists({ base: data.base });

    if (adminExiste || baseExiste) {
      return res.status(409).send({
        message: adminExiste
          ? "Ya estás registrado con este correo"
          : "Ya existe la base de datos",
        data: undefined,
      });
    }

    // Encriptar contraseña
    bcrypt.hash(data.password, null, null, async function (err, hash) {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Error interno del servidor",
          error: err.message,
        });
      }
      if (hash) {
        console.log(
          "Registrando institución:",
          data,
          "con contraseña:",
          data.password,
          "hash:",
          hash
        );
        data.password = hash;
        data.estado = "habilitado";
        data.rol = "admin";

        // Procesar portada
        if (req.files && req.files.portada) {
          const portada_name = path.basename(req.files.portada.path);
          data.portada = portada_name;
        }

        // Crear documentos
        const regAdmin = await AdminInstituto.create(data);
        data.idadmin = regAdmin._id;
        const regInstitucion = await Institucion.create(data);

        const registro = {
          admin: regAdmin._id,
          tipo: "Registro",
          descripcion: JSON.stringify(data),
        };
        await Registro.create(registro);

        // Crear en base específica
        const connBase = mongoose.connection.useDb(data.base);
        const Admin = connBase.model("admin", AdminSchema);
        await Admin.create(data);

        res.status(201).send({ message: "Registrado con éxito" });
      }
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res
      .status(500)
      .send({ message: "Error interno del servidor", error: error.message });
  }
};

const cambiar_base = async function (req, res) {
  if (req.user.email == "samuel.arevalo@espoch.edu.ec") {
    var data1 = req.body;

    var admin_arr = [];
    let conn = mongoose.connection.useDb("Instituciones");
    AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
    admin_arr = await AdminInstituto.find({ base: data1.base });

    if (admin_arr.length != 0) {
      req.user.portada = admin_arr[0].portada;
      req.user.rol = "admin";
      req.user.base = data1.base;
      req.user._id = req.user.sub;
      res.status(200).send({
        data: req.user,
        token: jwt.createToken(req.user),
      });
    } else {
      res.status(200).send({ message: "Base de datos no encontrada" });
    }
  }
};
const login_admin = async function (req, res) {
  var data = req.body;
  var admin_arr = [];
  let conn = mongoose.connection.useDb("Instituciones");
  AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);

  admin_arr = await AdminInstituto.find({ email: data.email });
  try {
    if (admin_arr.length == 0) {
      let brujula = await AdminInstituto.find();
      for (let index = 0; index < brujula.length; index++) {
        const element = brujula[index];

        conn = mongoose.connection.useDb(element.base);
        Admin = conn.model("admin", AdminSchema);
        admin_arr = await Admin.find({ email: data.email });
        if (admin_arr.length != 0) {
          let user = admin_arr[0];
          if (element.estado != "deshabilitado") {
            bcrypt.compare(
              data.password,
              user.password,
              async function (error, check) {
                if (check) {
                  res.status(200).send({
                    data: user,
                    token: jwt.createToken(user),
                  });
                } else {
                  res.status(200).send({
                    messages: "Las credenciales no coinciden",
                    data: undefined,
                  });
                }
              }
            );
            break;
          } else {
            res
              .status(200)
              .json({ messages: "Su institución se encuentra Deshabilitada" });
            break;
          }
        }
      }

      if (admin_arr.length == 0) {
        res.status(200).send({
          message: "El correo electrónico no existe",
          data: undefined,
        });
      }
    } else {
      //LOGIN
      if (
        admin_arr[0].estado != "deshabilitado" &&
        admin_arr[0].rol != "control"
      ) {
        conn = mongoose.connection.useDb(admin_arr[0].base);
        Admin = conn.model("admin", AdminSchema);
        let aux = await Admin.find({ email: data.email });
        let user = aux[0];

        bcrypt.compare(
          data.password,
          user.password,
          async function (error, check) {
            if (check) {
              res.status(200).send({
                data: user,
                token: jwt.createToken(user),
              });
            } else {
              res.status(200).send({
                message: "Las credenciales no coinciden",
                data: undefined,
              });
            }
          }
        );
      } else if (admin_arr[0].rol == "control") {
        bcrypt.compare(
          data.password,
          admin_arr[0].password,
          async function (error, check) {
            if (check) {
              res.status(200).send({
                data: admin_arr[0],
                token: jwt.createToken(admin_arr[0]),
              });
            } else {
              res.status(200).send({
                message: "Las credenciales no coinciden",
                data: undefined,
              });
            }
          }
        );
      } else {
        res.status(200).send({
          message:
            "Tu base de Datos se encuentra deshabilitado por falta de pagos",
          data: undefined,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ message: "ERROR No existe tu base de datos" });
  }
};
const listar_admininstitucion = async function (req, res) {
  if (req.user.email == "samuel.arevalo@espoch.edu.ec") {
    try {
      var admin_arr = [];
      let conn = mongoose.connection.useDb("Instituciones");
      Institucion = conn.model("instituto", InstitucionSchema);
      AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
      admin_arr = await Institucion.find().populate("idadmin");
      res.status(200).send({ data: admin_arr });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_institucion = async function (req, res) {
  if (req.user) {
    try {
      var id = req.params["id"];
      let conn = mongoose.connection.useDb("Instituciones");
      Institucion = conn.model("instituto", InstitucionSchema);
      AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
      let admin_arr = await Institucion.find({ idadmin: id });

      if (admin_arr.length > 0) {
        // Se encontró un documento que coincide con el criterio de búsqueda
        const admin = admin_arr[0];
        res.status(200).send({ institucion: admin });
      } else {
        // No se encontraron documentos que coincidan con el criterio de búsqueda
        res.status(200).send({ message: "Institución no encontrada" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_config_plana = async function (req, res) {
  if (req.user) {
    try {
      let conn = mongoose.connection.useDb(req.user.base);
      const ConfigPModel = conn.model("ConfigP", ConfigPSchema);
      let config = await ConfigPModel.find();

      if (config) {
        res.status(200).send({ config: config });
      } else {
        res.status(200).send({ message: "Sin incializar" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const actualizar_config_plana = async function (req, res) {
  if (req.user) {
    try {
      var id = req.params["id"];
      var data = req.body;
      let conn = mongoose.connection.useDb(req.user.base);
      const ConfigPModel = conn.model("ConfigP", ConfigPSchema);
      let config = await ConfigPModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (config) {
        res.status(200).send({ config: config });
      } else {
        res.status(200).send({ message: "No se ha inicializado" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const crear_config_plana = async function (req, res) {
  if (req.user) {
    try {
      var data = req.body;
      let conn = mongoose.connection.useDb(req.user.base);
      const ConfigPModel = conn.model("ConfigP", ConfigPSchema);
      let config = await ConfigPModel.find();

      if (config) {
        res.status(200).send({ message: "Configuración ya creada" });
      } else {
        config = await ConfigPModel.create(data);
        res.status(200).send({ config: config });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_info_admin = async (req, res) => {
  if (req.user) {
    try {
      let conn = mongoose.connection.useDb("Instituciones"); //req.user.base

      Institucion = conn.model("instituto", InstitucionSchema);
      AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);

      let admin_arr = await Institucion.find().populate("idadmin");

      let info = admin_arr.find(
        (element) => element.idadmin.base == req.user.base
      );

      if (info) {
        res.status(200).send({ data: info });
      } else {
        res.status(200).send({ message: "Admin no encontrado" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const actualizar_admininstitucion = async function (req, res) {
  if (req.user) {
    try {
      let conn = mongoose.connection.useDb("Instituciones");
      AdminInstituto = conn.model("admininstitutos", AdminInstitutoSchema);
      Registro = conn.model("registro", RegistroSchema);
      var id = req.params["id"];

      admin_arr = await AdminInstituto.find({ _id: id });
      if (admin_arr.length == 0) {
        res.status(200).send({ message: "No se pudo encontrar" });
      } else {
        if (admin_arr[0].estado != "deshabilitado") {
          await AdminInstituto.updateOne(
            { _id: id },
            {
              estado: "deshabilitado",
            }
          );
          let registro = {};
          registro.admin = req.user.sub;
          registro.tipo = "deshabilitado";
          registro.descripcion = JSON.stringify(admin_arr[0]);
          await Registro.create(registro);
          res.status(200).send({ message: "Actualizado con exito" });
        } else {
          await AdminInstituto.updateOne(
            { _id: id },
            {
              estado: "habilitado",
            }
          );
          let registro = {};
          registro.admin = req.user.sub;
          registro.tipo = "habilitado";
          registro.descripcion = JSON.stringify(admin_arr[0]);
          await Registro.create(registro);
          res.status(200).send({ message: "Actualizado con exito" });
        }
      }
    } catch (error) {
      console.log(error);
      res
        .status(200)
        .send({ message: error + "Algo salió mal", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

// Actualizar una institución por ID
const actualizarInstitucion = async (req, res) => {
  let conn = mongoose.connection.useDb("Instituciones"); //req.user.base

  Institucion = conn.model("instituto", InstitucionSchema);
  const { id } = req.params;
  const actualizaciones = req.body;

  try {
    const institucionActualizada = await Institucion.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    );

    if (!institucionActualizada) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    res.status(200).json({
      message: "Institución actualizada exitosamente",
      data: institucionActualizada,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al actualizar la institución", error });
  }
};

const registro_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Admin, Registro } = models;

      var data = req.body;
      var admin_arr = [];
      admin_arr = await Admin.find({ email: data.email });

      var admin_arr2 = [];
      admin_arr2 = await Admin.find({ dni: data.dni });

      var admin_arr3 = [];
      admin_arr3 = await Admin.find({ rol: "direc" });

      if (admin_arr.length == 0 && admin_arr2.length == 0) {
        if (
          (admin_arr3.length != 0 && data.rol != "direc") ||
          admin_arr3.length == 0
        ) {
          try {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
              if (hash) {
                data.password = hash;
                data.estado = "habilitado";
                var reg = await Admin.create(data);

                let registro = {};
                registro.admin = req.user.sub;
                registro.tipo = "creo";
                registro.descripcion = JSON.stringify(data);

                await Registro.create(registro);
                res.status(200).send({ message: "Registrado con exito" });
              } else {
                res.status(200).send({ message: "ErrorServer" });
              }
            });
          } catch (error) {
            res.status(200).send({ message: "Algo salió mal" });
          }
        } else {
          res
            .status(200)
            .send({ message: "Ya hay una cuenta con el rol de Director" });
        }
      } else {
        if (
          (admin_arr.length != 0 && admin_arr[0].estado == "Fuera") ||
          (admin_arr2.length != 0 && admin_arr2[0].estado == "Fuera") ||
          (admin_arr3.length != 0 && admin_arr3[0].estado == "Fuera")
        ) {
          try {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
              if (hash) {
                data.password = hash;
                data.estado = "habilitado";
                var reg = await Admin.updateOne(
                  { email: data.email },
                  {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    password: data.password,
                    rol: "secrt",
                    dni: data.dni,
                    telefono: data.telefono,
                    estado: data.estado,
                  }
                );

                let registro = {};
                registro.admin = req.user.sub;
                registro.tipo = "creo";
                registro.descripcion = JSON.stringify(data);

                await Registro.create(registro);
                res.status(200).send({ message: "Registrado con exito" });
              } else {
                res.status(200).send({ message: "ErrorServer" });
              }
            });
          } catch (error) {
            res.status(200).send({ message: "Algo salió mal" });
          }
        } else {
          res.status(200).send({
            message: "El correo y/o la cedula ya existe en la base de datos",
          });
        }
      }
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const listar_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Admin } = models;

      var admin_arr = [];
      admin_arr = await Admin.find({});

      res.status(200).send({ data: admin_arr });
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const listar_registro = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Admin, Pago, Config, Estudiante, Documento } = models;

      var admin_arr = [];
      let desde = req.params["desde"];
      let hasta = req.params["hasta"];

      // Agregar condiciones de búsqueda con los valores desde y hasta
      let condicionesDeBusqueda = {};

      if (desde) {
        condicionesDeBusqueda.createdAt = { $gte: new Date(desde) };
      }

      if (hasta) {
        condicionesDeBusqueda.createdAt = {
          ...condicionesDeBusqueda.createdAt,
          $lte: new Date(hasta),
        };
      }

      // Realizar la búsqueda con las condiciones
      admin_arr = await Registro.find(condicionesDeBusqueda)
        .sort({ createdAt: -1 })
        .populate("admin")
        .populate("estudiante")
        .populate("pago")
        .populate("documento")
        .populate("config");
      res.status(200).send({ data: admin_arr });
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const obtener_admin = async function (req, res) {
  var id = req.params["id"];
  try {
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Admin } = models;

    let estudiante = await Admin.findById({ _id: id });

    res.status(200).send({ data: estudiante });
  } catch (error) {
    res.status(200).send({ message: "No encontrado" });
  }
};
const actualizar_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Admin, Registro } = models;

      //Admin = conn.model("admin", AdminSchema);
      //Registro = conn.model("registro", RegistroSchema);

      var id = req.params["id"];
      var data = req.body;

      let admin = await Admin.findById(id);

      // Verificar duplicados por correo o dni
      let duplicateEmailAdmins = await Admin.find({
        email: data.email,
        _id: { $ne: id },
      });
      let duplicateDniAdmins = await Admin.find({
        dni: data.dni,
        _id: { $ne: id },
      });

      if (duplicateEmailAdmins.length > 0 || duplicateDniAdmins.length > 0) {
        res
          .status(200)
          .send({ message: "Correo o cédula ya existente", data: undefined });
      } else {
        // Actualizar contraseña si se proporciona
        if (data.password !== "") {
          bcrypt.hash(data.password, null, null, async function (err, hash) {
            if (hash) {
              data.password = hash;
              // Actualizar información del administrador
              await actualizarInformacionAdmin(id, data, res, req, admin);
            } else {
              res.status(200).send({
                message: "Error al cifrar la contraseña",
                data: undefined,
              });
            }
          });
        } else {
          // Actualizar información del administrador sin cambiar la contraseña
          await actualizarInformacionAdmin(id, data, res, req, admin);
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Algo salió mal", data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
async function actualizarInformacionAdmin(id, data, res, req, admin) {
  let admin_arr3 = await Admin.find({ rol: "direc", _id: { $ne: id } });

  if (
    (admin_arr3.length !== 0 && data.rol !== "direc") ||
    admin_arr3.length === 0
  ) {
    // Actualizar información sin cambiar el rol a Colecturía
    await Admin.updateOne(
      { _id: id },
      {
        estado: data.estado,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        rol: data.rol,
        dni: data.dni,
      }
    );
    await crearRegistroActualizacion(req, admin, data);
    res.status(200).send({ message: "Actualizado con éxito" });
  } else {
    // Actualizar información y cambiar el rol a Colecturía
    await Admin.updateOne(
      { _id: id },
      {
        estado: data.estado,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        rol: "secrt",
        dni: data.dni,
      }
    );
    await crearRegistroActualizacion(req, admin, data);
    res.status(200).send({
      message: "Actualizado con éxito. Se cambió el rol a Colecturía",
    });
  }
}
async function crearRegistroActualizacion(req, admin, data) {
  let registro = {};
  registro.admin = req.user.sub;
  registro.tipo = "actualizo";
  registro.descripcion = JSON.stringify(admin) + JSON.stringify(data);

  await Registro.create(registro);
}
const eliminar_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Admin, Registro } = models;

      var id = req.params["id"];
      var data = await Admin.findById(id);
      await Admin.updateOne(
        { _id: id },
        {
          rol: "secrt",
          estado: "Fuera",
        }
      );
      let registro = {};
      registro.admin = req.user.sub;
      registro.tipo = "elimino";
      registro.descripcion = JSON.stringify(data);
      await Registro.create(registro);

      res.status(200).send({ message: "Eliminado con exito" });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const eliminar_estudiante_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Pago, Config, Pension, Estudiante, Pension_Beca } =
        models;

      var id = req.params["id"];
      var data = await Estudiante.findById(id);
      var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
      let config = cn[0];
      //let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
      let pagos = await Pago.find({ estudiante: id });
      let pen = await Pension.find({ idestudiante: id });
      if (pen.length == 1 && pagos.length == 0) {
        let registro = {};
        registro.admin = req.user.sub;
        registro.estudiante = id;
        registro.tipo = "eliminado Permanente";
        registro.descripcion = JSON.stringify(data);
        let re = await Registro.create(registro);

        await Estudiante.findOneAndDelete({ _id: id });
        for (let pn in pen) {
          await Pension_Beca.findOneAndDelete({ idpension: pn._id });
        }

        await Pension.findOneAndDelete({ idestudiante: id });

        res.status(200).send({ message: "Eliminado Permanentemente" });
      } else {
        await Estudiante.updateOne(
          { _id: id },
          {
            estado: "Desactivado",
            f_desac: new Date(),
            anio_desac: config.anio_lectivo,
          }
        );
        let registro = {};
        registro.admin = req.user.sub;
        registro.estudiante = id;
        registro.tipo = "eliminado";
        registro.descripcion = JSON.stringify(data);
        await Registro.create(registro);

        res.status(200).send({ message: "Eliminado con exito" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const reactivar_estudiante_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Config, Pension, Estudiante } = models;

      var id = req.params["id"];
      var pension = {};
      var data = await Estudiante.findById(id);
      await Estudiante.updateOne(
        { _id: id },
        {
          estado: "Activo",
        }
      );
      let registro = {};
      registro.admin = req.user.sub;
      registro.estudiante = id;
      registro.tipo = "recreo";
      registro.descripcion = JSON.stringify(data);

      await Registro.create(registro);

      var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
      let config = cn[0];
      let pen = await Pension.find({
        idestudiante: id,
        idanio_lectivo: config._id,
      });
      if (pen.length == 0) {
        pension.idestudiante = id;
        pension.anio_lectivo = config.anio_lectivo;
        pension.idanio_lectivo = config._id;
        pension.condicion_beca = "No";
        pension.matricula = 0;
        pension.curso = data.curso;
        pension.paralelo = data.paralelo;
        pension.especialidad = data.especialidad || "EGB";
        //type_especialidad
        pension.type_especialidad = data.type_especialidad || "";
        var reg2 = await Pension.create(pension);
        res.status(200).send({ message: "Reactivado" });
      } else {
        res.status(200).send({ message: "Reactivado pension existente" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const registro_documento_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Documento } = models;

      let data = req.body;

      let documentos = await Documento.find({ documento: data.documento });

      if (documentos.length == 0) {
        let reg = await Documento.create(data);
        let registro = {};
        registro.admin = req.user.sub;
        registro.tipo = "creo";
        registro.descripcion = JSON.stringify(data);

        await Registro.create(registro);

        res.status(200).send({ data: reg });
      } else {
        res.status(200).send({
          data: undefined,
          message: "El número del documento ya existe",
        });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};

const listar_documentos_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Documento } = models;

      // Modificar la consulta para obtener solo los últimos 2000 documentos
      var documentos = await Documento.find()
        .sort({ createdAt: -1 })
        .limit(2000);

      res.status(200).send({ data: documentos });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};

const obtener_documento_admin = async function (req, res) {
  if (req.user) {
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Dpago, Documento } = models;

    var id = req.params["id"];
    try {
      var reg = await Documento.findById({ _id: id });
      var detal = await Dpago.find({ documento: id });
      let fact = [];
      for (const aux of detal) {
        if (
          fact.find((idfactura) => idfactura == aux.pago.toString()) ==
          undefined
        ) {
          fact.push(aux.pago.toString());
        }
      }
      res.status(200).send({ data: reg, fact: fact });
    } catch (error) {
      res.status(200).send({ data: undefined });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const actualizar_documento_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Documento, Dpago } = models;

      let id = req.params["id"];
      let data = req.body;
      let admin = await Documento.findById(id);
      let pagos = await Dpago.find({ documetno: id });
      var a = 0;
      for (var p of pagos) {
        a += p.valor;
      }
      if (data.valor >= a - 0.1) {
        let reg = await Documento.updateOne(
          { _id: id },
          {
            documento: data.documento,
            cuenta: data.cuenta,
            valor: data.valor - a,
            contenido: data.contenido,
            f_deposito: data.f_deposito,
            contenido: data.contenido,
          }
        );
        let registro = {};
        registro.admin = req.user.sub;
        registro.tipo = "actualizo";
        registro.descripcion = JSON.stringify(admin) + JSON.stringify(data);
        await Registro.create(registro);
        res.status(200).send({ data: reg });
      } else {
        res.status(200).send({
          message:
            "El número de pagos realizados con este documento es mayor al que le asignas",
        });
      }
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const verificar_token = async function (req, res) {
  if (req.user) {
    res.status(200).send({ data: req.user });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const obtener_config_admin = async (req, res) => {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Config } = models;

      let config = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
      if (config.length == 0) {
        res.status(200).send({ data: undefined, message: "No se a iniciado" });
      } else {
        res.status(200).send({ data: config });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};

//REGEX - Ya no se utiliza directamente
function regex(especialidad) {
  // Usar expresión regular para hacer la búsqueda case-insensitive
  const regexEspecialidad = new RegExp("^" + especialidad + "$", "i");
  return regexEspecialidad;
}

const actualizar_config_admin = async (req, res) => {
  if (!req.user) {
    return res.status(500).send({ message: "NoAccess" });
  }
  console.log("Actualizando configuración:", req.body);
  try {
    // Conexión a la base de datos del usuario
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Config, Registro, Pension, Estudiante } = models;

    // Verificar el tipo de escuela (UE o no) consultando la colección Instituciones
    const connInstituciones = mongoose.connection.useDb("Instituciones");
    const Instituto = connInstituciones.model("instituto", InstitucionSchema);

    // Buscar el tipo de escuela basado en req.user.base
    const institucion = await Instituto.findOne({ base: req.user.base });

    if (!institucion) {
      console.log("Institución no encontrada", req.user.base);
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    // Si no existe el registro o no tiene type_school, asumir que solo tienen EGB (1-10)
    const esUnidadEducativa = institucion && institucion.type_school === "UE";
    console.log("esUnidadEducativa: ", esUnidadEducativa);

    // Determinar las especialidades permitidas
    // Si no es UE o no existe el registro, solo se permite EGB (1-10)
    const tieneInicial = esUnidadEducativa;
    const tieneBGU = esUnidadEducativa;

    let fecha_actual = new Date();
    let data = req.body;

    if (data.nuevo === 1) {
      // Crear nueva configuración para el año lectivo
      let configfecha = new Date(data.anio_lectivo);
      let mes = (fecha_actual.getFullYear() - configfecha.getFullYear()) * 12;
      mes -= configfecha.getMonth();
      mes += fecha_actual.getMonth() + 1;
      // Fix: Ensure numpension is never negative
      let numpension = Math.max(0, Math.min(mes, 10));

      let config = new Config(data);
      config.numpension = numpension;
      await config.save();

      // Obtener todos los estudiantes activos primero
      const todosEstudiantesActivos = await Estudiante.find({
        estado: "Activo",
      });

      // Mostramos algunos estudiantes para debug
      console.log("Total de estudiantes:", todosEstudiantesActivos.length);

      // Procesamos las transiciones de especialidad primero

      // 1. Estudiantes de Inicial 2 -> EGB 1
      if (tieneInicial) {
        // Usamos una función más robusta para comparar especialidades
        const estudiantesInicialFinal = todosEstudiantesActivos.filter(
          (e) =>
            esEspecialidad(e.especialidad, "Inicial") &&
            (e.curso === 2 || e.curso === "2")
        );

        console.log(
          `Estudiantes de Inicial 2 que pasan a EGB 1: ${estudiantesInicialFinal.length}`
        );

        for (let estudiante of estudiantesInicialFinal) {
          // You need to await the result of findOne() to properly check if a pension exists
          const existingPension = await Pension.findOne({
            idanio_lectivo: config._id,
            idestudiante: estudiante._id,
          });

          if (!existingPension) {
            estudiante.especialidad = normalizarEspecialidad("EGB");
            estudiante.type_especialidad = null; // No asignar type_especialidad para EGB
            estudiante.curso = 1;
            await estudiante.save();
            // Crear pensión con nueva especialidad
            let pension = new Pension({
              idanio_lectivo: config._id,
              idestudiante: estudiante._id,
              anio_lectivo: config.anio_lectivo,
              condicion_beca: "No",
              curso: "1", // Guardar como string
              paralelo: estudiante.paralelo,
              especialidad: normalizarEspecialidad("EGB"),
              type_especialidad: null, // No asignar type_especialidad para EGB
            });
            await pension.save();
          }
        }
      }

      // 2. Estudiantes de EGB 10 -> BGU 1 o Desactivar
      const estudiantesEGBFinal = todosEstudiantesActivos.filter(
        (e) =>
          esEspecialidad(e.especialidad, "EGB") &&
          (e.curso === 10 || e.curso === "10")
      );

      console.log(
        `Estudiantes de EGB 10 que se procesan: ${estudiantesEGBFinal.length}`
      );

      for (let estudiante of estudiantesEGBFinal) {
        // Si tiene BGU, pasan a BGU 1
        if (tieneBGU) {
          // You need to await the result of findOne() to properly check if a pension exists
          const existingPension = await Pension.findOne({
            idanio_lectivo: config._id,
            idestudiante: estudiante._id,
          });

          if (!existingPension) {
            const bgEspecialidad = normalizarEspecialidad("BGU");
            estudiante.especialidad = bgEspecialidad;
            estudiante.type_especialidad = null; // Asignar type_especialidad para BGU
            estudiante.curso = 1;
            await estudiante.save();

            // Crear pensión con nueva especialidad
            let pension = new Pension({
              idanio_lectivo: config._id,
              idestudiante: estudiante._id,
              anio_lectivo: config.anio_lectivo,
              condicion_beca: "No",
              curso: "1", // Guardar como string
              paralelo: estudiante.paralelo,
              especialidad: bgEspecialidad,
              type_especialidad: null, // Asignar type_especialidad para BGU
            });
            await pension.save();
          }
        } else {
          // Si no tiene BGU, desactivar estudiantes de EGB 10
          estudiante.estado = "Desactivado";
          await estudiante.save();
        }
      }

      // 3. Desactivar estudiantes de BGU 3
      if (tieneBGU) {
        const estudiantesBGUFinal = todosEstudiantesActivos.filter(
          (e) =>
            esEspecialidad(e.especialidad, "BGU") &&
            (e.curso === 3 || e.curso === "3")
        );

        console.log(
          `Estudiantes de BGU 3 que se desactivan: ${estudiantesBGUFinal.length}`
        );

        for (let estudiante of estudiantesBGUFinal) {
          estudiante.estado = "Desactivado";
          await estudiante.save();
        }
      }

      // Ahora procesamos la promoción de curso normal (sin cambiar de especialidad)

      // 1. Promoción de estudiantes de Inicial 1
      if (tieneInicial) {
        const estudiantesInicial = todosEstudiantesActivos.filter(
          (e) =>
            esEspecialidad(e.especialidad, "Inicial") &&
            (e.curso === 1 || e.curso === "1") &&
            e.estado === "Activo"
        );

        console.log(
          `Estudiantes de Inicial 1 que pasan a Inicial 2: ${estudiantesInicial.length}`
        );

        for (let estudiante of estudiantesInicial) {
          // You need to await the result of findOne() to properly check if a pension exists
          const existingPension = await Pension.findOne({
            idanio_lectivo: config._id,
            idestudiante: estudiante._id,
          });

          if (!existingPension) {
            estudiante.curso = 2;
            await estudiante.save();

            let pension = new Pension({
              idanio_lectivo: config._id,
              idestudiante: estudiante._id,
              anio_lectivo: config.anio_lectivo,
              condicion_beca: "No",
              curso: "2", // Guardar como string
              paralelo: estudiante.paralelo,
              especialidad: normalizarEspecialidad("Inicial"),
              type_especialidad: null, // No asignar type_especialidad para Inicial
            });
            await pension.save();
          }
        }
      }

      // 2. Promoción de estudiantes de EGB 1-9
      const estudiantesEGB = todosEstudiantesActivos.filter((e) => {
        // Asegurarnos de que la comparación funcione tanto si curso es número como string
        const cursoNum = parseInt(e.curso);
        return (
          esEspecialidad(e.especialidad, "EGB") &&
          cursoNum >= 1 &&
          cursoNum <= 9 &&
          e.estado === "Activo"
        );
      });

      console.log(
        `Estudiantes de EGB 1-9 que se promocionan: ${estudiantesEGB.length}`
      );

      for (let estudiante of estudiantesEGB) {
        // CORRECCIÓN: Aquí estaba el error, faltaba el await y guardar el resultado en una variable
        const existingPension = await Pension.findOne({
          idanio_lectivo: config._id,
          idestudiante: estudiante._id,
        });

        if (!existingPension) {
          // Convertir a número para hacer la suma
          const cursoActual = parseInt(estudiante.curso);
          const nuevoCurso = cursoActual + 1;
          estudiante.curso = nuevoCurso;
          await estudiante.save();

          let pension = new Pension({
            idanio_lectivo: config._id,
            idestudiante: estudiante._id,
            anio_lectivo: config.anio_lectivo,
            condicion_beca: "No",
            curso: nuevoCurso.toString(), // Guardar como string
            paralelo: estudiante.paralelo,
            especialidad: normalizarEspecialidad("EGB"),
            type_especialidad: null, // No asignar type_especialidad para EGB
          });
          await pension.save();
        }
      }

      // 3. Promoción de estudiantes de BGU 1-2
      if (tieneBGU) {
        const estudiantesBGU = todosEstudiantesActivos.filter((e) => {
          // Asegurarnos de que la comparación funcione tanto si curso es número como string
          const cursoNum = parseInt(e.curso);
          return (
            esEspecialidad(e.especialidad, "BGU") &&
            cursoNum >= 1 &&
            cursoNum <= 2 &&
            e.estado === "Activo"
          );
        });

        console.log(
          `Estudiantes de BGU 1-2 que se promocionan: ${estudiantesBGU.length}`
        );

        for (let estudiante of estudiantesBGU) {
          // You need to await the result of findOne() to properly check if a pension exists
          const ultimaPension = await Pension.findOne({
            idestudiante: estudiante._id,
          }).sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente

          // Extraer type_especialidad, o null si no existe pensión
          const typeEspecialidad = ultimaPension
            ? ultimaPension.type_especialidad
            : null;

          const existingPension = await Pension.findOne({
            idanio_lectivo: config._id,
            idestudiante: estudiante._id,
          });

          if (!existingPension) {
            // Convertir a número para hacer la suma
            const cursoActual = parseInt(estudiante.curso);
            const nuevoCurso = cursoActual + 1;
            estudiante.curso = nuevoCurso;
            estudiante.type_especialidad = typeEspecialidad; // Asignar type_especialidad
            estudiante.especialidad = normalizarEspecialidad("BGU");
            await estudiante.save();

            const bguEspecialidad = normalizarEspecialidad("BGU");
            let pension = new Pension({
              idanio_lectivo: config._id,
              idestudiante: estudiante._id,
              anio_lectivo: config.anio_lectivo,
              condicion_beca: "No",
              curso: nuevoCurso.toString(), // Guardar como string
              paralelo: estudiante.paralelo,
              especialidad: bguEspecialidad,
              type_especialidad: typeEspecialidad, // Asignar type_especialidad para BGU
            });
            await pension.save();
          }
        }
      }

      // Registrar la acción
      let registro = new Registro({
        admin: req.user.sub,
        tipo: "actualizo",
        descripcion: JSON.stringify(config),
      });
      await registro.save();

      return res.status(200).send({ data: config });
    } else {
      const id = data._id;
      // Actualizar configuración existente
      let config = await Config.findById(id);

      if (!config) {
        return res
          .status(400)
          .send({ message: "No existe una configuración previa" });
      }

      if (config._id == data._id) {
        config.extrapagos = data.extrapagos;
      }

      let configfecha = new Date(data.anio_lectivo);
      if (configfecha.getTime() < config.anio_lectivo.getTime()) {
        return res.status(400).send({
          message: "No puedes ingresar una fecha menor a la anterior",
        });
      }

      if (configfecha.getTime() !== config.anio_lectivo.getTime()) {
        config.set(data);
        let mes = (fecha_actual.getFullYear() - configfecha.getFullYear()) * 12;
        mes -= configfecha.getMonth();
        mes += fecha_actual.getMonth() + 1;
        config.numpension = Math.max(0, Math.min(mes, 10));
        await config.save();
      } else {
        config.numpension = data.numpension;
        await config.save();
      }

      return res.status(200).send({ data: config });
    }
  } catch (error) {
    console.error("Error en actualizar_config_admin:", error);
    return res
      .status(500)
      .send({ message: "Algo salió mal", error: error.message });
  }
};

// Función auxiliar para normalizar nombres de especialidades
function normalizarEspecialidad(especialidad) {
  // Definir el formato correcto para cada especialidad
  const formatosCorrecto = {
    inicial: "Inicial",
    egb: "EGB",
    bgu: "BGU",
  };

  // Convertir a minúsculas para comparación
  const especMinuscula = especialidad.toLowerCase();

  // Devolver el formato correcto si existe, o el original si no se encuentra
  return formatosCorrecto[especMinuscula] || especialidad;
}

// Función para comparar especialidades ignorando mayúsculas/minúsculas
function esEspecialidad(especialidadEstudiante, especialidadBuscada) {
  if (!especialidadEstudiante) return false;

  // Convertir ambas a minúsculas para comparar
  const especEstudianteLower = especialidadEstudiante.toLowerCase();
  const especBuscadaLower = especialidadBuscada.toLowerCase();

  return especEstudianteLower === especBuscadaLower;
}

// Función para comparar especialidades ignorando mayúsculas/minúsculas
function esEspecialidad(especialidadEstudiante, especialidadBuscada) {
  if (!especialidadEstudiante) return false;

  // Convertir ambas a minúsculas para comparar
  const especEstudianteLower = especialidadEstudiante.toLowerCase();
  const especBuscadaLower = especialidadBuscada.toLowerCase();

  return especEstudianteLower === especBuscadaLower;
}

const obtener_pagos_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pago, Estudiante } = models;

      let pagos = [];
      let desde = req.params["desde"];
      let hasta = req.params["hasta"];

      // Agregar condiciones de búsqueda con los valores desde y hasta
      let condicionesDeBusqueda = {};

      if (desde) {
        condicionesDeBusqueda.createdAt = { $gte: new Date(desde) };
      }

      if (hasta) {
        condicionesDeBusqueda.createdAt = {
          ...condicionesDeBusqueda.createdAt,
          $lte: new Date(hasta),
        };
      }

      // Realizar la búsqueda con las condiciones
      pagos = await Pago.find(condicionesDeBusqueda)
        .populate("estudiante")
        .sort({ createdAt: -1 });

      res.status(200).send({ data: pagos });
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const obtener_pagos_dash = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pension, Dpago } = models;

      let pagos = [];
      let desde = req.params["desde"];
      let hasta = req.params["hasta"];

      // Agregar condiciones de búsqueda con los valores desde y hasta
      let condicionesDeBusqueda = {};

      if (desde) {
        condicionesDeBusqueda.createdAt = { $gte: new Date(desde) };
      }

      if (hasta) {
        condicionesDeBusqueda.createdAt = {
          ...condicionesDeBusqueda.createdAt,
          $lte: new Date(hasta),
        };
      }

      // Realizar la búsqueda con las condiciones
      pagos = await Dpago.find(condicionesDeBusqueda, {
        valor: 1,
        idpension: 1,
        estado: 1,
        createdAt: 1,
      })
        .populate({
          path: "idpension",
          select: "anio_lectivo curso paralelo",
        })
        .sort({ createdAt: -1 });

      res.status(200).send({ data: pagos });
    } catch (error) {
      res.status(500).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const listado_detalles_erroneos = [
  "6419c3dc0e697d207ca405b1",
  "6419c3dc0e697d207ca405b9",
  "641a1710a6292f408f2470cd",
  "641a1710a6292f408f2470d6",
  "641b072cfbc4fb68123733c3",
  "641b072cfbc4fb68123733cb",
  "641b8679fbc4fb681237522a",
  "641b8679fbc4fb6812375232",
  "641cbd7afbc4fb6812376600",
  "641cbd7afbc4fb6812376608",
  "641cbfcffbc4fb6812376694",
  "641cbfcffbc4fb681237669c",
  "641dc1effbc4fb6812376e8d",
  "641dc1effbc4fb6812376e95",
  "641e0799fbc4fb68123776eb",
  "641e14e2fbc4fb6812377c79",
  "641e14e2fbc4fb6812377c81",
  "6421a10ab35d2ea135b6c100",
  "6421a10ab35d2ea135b6c108",
  "6421ffccb35d2ea135b6dcc2",
  "6421ffccb35d2ea135b6dcca",
  "6421ffe3b35d2ea135b6dcfc",
  "642203e0b35d2ea135b6deb5",
  "642203e0b35d2ea135b6debd",
  "642203f6b35d2ea135b6deef",
  "64220416b35d2ea135b6df19",
  "64220416b35d2ea135b6df21",
  "64220470b35d2ea135b6df5e",
  "64221194b35d2ea135b6e61c",
  "64221194b35d2ea135b6e624",
  "642211a9b35d2ea135b6e656",
  "642440957f9f72d18f472553",
  "642440957f9f72d18f47255b",
  "642440ba7f9f72d18f47258d",
  "642452957f9f72d18f472fcc",
  "642452957f9f72d18f472fd4",
  "642452b37f9f72d18f473004",
  "6425928f82c4331fb8674f45",
  "6425928f82c4331fb8674f4d",
  "642592a482c4331fb8674f7f",
  "6425eecb82c4331fb8676c54",
  "6425eecb82c4331fb8676c5c",
  "6425eee182c4331fb8676c8e",
  "642af9174c780d65b0551bce",
  "642af92f4c780d65b0551bfe",
  "642af92f4c780d65b0551c06",
  "642af92f4c780d65b0551c0f",
  "642b06b54c780d65b055205c",
  "642b06b54c780d65b0552064",
  "642b07134c780d65b055209c",
  "642b2ff84c780d65b05526e1",
  "642b301d4c780d65b055270b",
  "642c67bb4c780d65b055415e",
  "642c80aa4c780d65b0554376",
  "642c86754c780d65b0554652",
  "642d8c4f938854637e9c6bd4",
  "642d8c61938854637e9c6bfe",
  "642d8c61938854637e9c6c06",
  "642d8efa938854637e9c6c8a",
  "642d8f16938854637e9c6cbb",
  "642d8f16938854637e9c6cc3",
  "642ddfbc938854637e9c7e3d",
  "642ddfce938854637e9c7e67",
  "642ddfce938854637e9c7e6f",
  "642e0027938854637e9c8589",
  "64340e52938854637e9c8b0c",
  "64347dfc938854637e9ca561",
  "64347dfc938854637e9ca56a",
  "64359266774b2ea0593e06c4",
  "64359278774b2ea0593e06ee",
  "64359278774b2ea0593e06f6",
  "643592cf774b2ea0593e0734",
  "643592e0774b2ea0593e075e",
  "643592e0774b2ea0593e0766",
  "6435d4a1774b2ea0593e120f",
  "64371e40774b2ea0593e212d",
  "643832bd774b2ea0593e2c37",
  "64387e3a94491f2477bb9362",
  "64387e5394491f2477bb9386",
  "64397b3f94491f2477bb97d5",
  "64397b5594491f2477bb97ff",
  "64397b5594491f2477bb9808",
  "64397eab94491f2477bb9848",
  "64397eab94491f2477bb9851",
  "64526115b593e4c48ff46d21",
  "64526136b593e4c48ff46d4b",
  "64526136b593e4c48ff46d53",
  "645261a9b593e4c48ff46daa",
  "645261a9b593e4c48ff46db2",
  "645261a9b593e4c48ff46dbb",
  "645ab36e6c36432ce5903cc6",
  "645abfff6c36432ce5903dfd",
  "645ac0176c36432ce5903e27",
  "645ac0176c36432ce5903e2f",
  "64623fa06c36432ce590591a",
  "6467df0d6c36432ce59082dd",
  "646b676d6c36432ce590874a",
  "646b6bba6c36432ce59088bc",
  "646f9d4e53ab48ca5c5cabf8",
  "6474cf0c53ab48ca5c5cccba",
  "6474cf0c53ab48ca5c5cccc2",
  "6474cf0c53ab48ca5c5ccccb",
  "6477707f929d2869d26abf0c",
  "6478fcf0929d2869d26ad3a4",
  "6479f2d7929d2869d26adec3",
  "647a6648929d2869d26af33a",
  "647a6f2d929d2869d26af4b1",
  "647a6f2d929d2869d26af4ba",
  "647de863929d2869d26afe2c",
  "647e01f2929d2869d26b046a",
  "647e17cc929d2869d26b0e13",
  "647f4cbfe15b7563f886ff1b",
  "647f4cbfe15b7563f886ff24",
  "647f52f9e15b7563f886ffef",
  "647f56e1e15b7563f8870208",
  "647f5f9ae15b7563f88704c3",
  "647f5f9ae15b7563f88704cb",
  "6481e490e15b7563f88715d5",
  "6481e4cce15b7563f887160e",
  "64823a80e15b7563f8872384",
  "6487264ce15b7563f887437d",
  "64878046e15b7563f8875af6",
  "64878046e15b7563f8875afe",
  "64878249e15b7563f8875b3e",
  "64878249e15b7563f8875b47",
  "6493166fa43b3230a1555d58",
  "6499af35a43b3230a15578bf",
  "6499af62a43b3230a15578f6",
  "649ae97397f8de5bde8ed6e5",
  "649ae9ae97f8de5bde8ed71b",
  "64a490bf97f8de5bde8f0e1e",
  "64a5739f97f8de5bde8f125c",
  "64a6e93597f8de5bde8f251f",
  "64ac0a3843a3c4b9be6efc13",
  "64ac0a7643a3c4b9be6efc4c",
  "64ac1fe543a3c4b9be6f0125",
  "64ac39fc43a3c4b9be6f07e6",
  "64ac7d8f43a3c4b9be6f11ce",
  "64ac7d8f43a3c4b9be6f11d7",
  "64aeb2a343a3c4b9be6f26dd",
  "64aeb2a343a3c4b9be6f26e5",
  "64af154a43a3c4b9be6f303c",
  "64af154a43a3c4b9be6f3046",
  "64b161d543a3c4b9be6f441b",
  "64b1770543a3c4b9be6f469a",
  "64b86447092713c1186af84f",
  "64b86447092713c1186af858",
  "64b9b457092713c1186b0596",
  "64bea885c325c4166f3ebaa7",
  "64beab7fc325c4166f3ebaec",
  "64bfd174c325c4166f3ec47c",
  "64bfd1bec325c4166f3ec4bb",
  "64bfe5e4c325c4166f3ecd59",
  "64bfe60dc325c4166f3ecd92",
  "64bfe60ec325c4166f3ecd9b",
  "64c27e92c325c4166f3ed1e3",
  "64c7b63ac325c4166f3ed814",
  "64c80181c325c4166f3eec93",
  "64c90947c325c4166f3ef64d",
  "64c929a5c325c4166f3efa67",
  "64c93e05c325c4166f3f00fd",
  "64c93e05c325c4166f3f0105",
  "64c93e2cc325c4166f3f013f",
  "64c93e2cc325c4166f3f0148",
  "64c94b68c325c4166f3f066a",
  "64c94b68c325c4166f3f0673",
  "64cab8d945b34db6d271cf7b",
  "64cab8d945b34db6d271cf84",
  "64d130e2a11dc935fc4f3b61",
  "64d130e2a11dc935fc4f3b6a",
  "64d3ca78a11dc935fc4f522e",
  "64dba10ca11dc935fc4f7e38",
  "64dba10ca11dc935fc4f7e40",
  "64dba10ca11dc935fc4f7e48",
  "64dbb9bfa11dc935fc4f8840",
  "64dbb9dba11dc935fc4f8873",
  "64dbe710a11dc935fc4f8a3a",
  "64dbf607a11dc935fc4f8d6d",
  "64dcdcf909d12d415bdc22c5",
  "64dce44609d12d415bdc2402",
  "64dce47809d12d415bdc243c",
  "64dce47809d12d415bdc2445",
  "64de339009d12d415bdc34c9",
  "64de339009d12d415bdc34d2",
  "64e757e809d12d415bdc580e",
  "64e757e809d12d415bdc5816",
  "64e90e2d09d12d415bdc667c",
  "64e90e2e09d12d415bdc6686",
  "64eca65e1b40414e7243c1ba",
  "64ed0ea81b40414e7243c4f0",
  "64f5ce371b40414e7243e2ea",
  "64f613321b40414e7243f452",
  "64f7904b1b40414e724403bb",
  "64f7904b1b40414e724403c4",
  "64f87d051b40414e72440bae",
  "64ff3f87855dc03e079b085e",
  "64ff3f87855dc03e079b0867",
  "64ff4a24855dc03e079b0c55",
  "64ff4a24855dc03e079b0c5e",
  "64ff4be9855dc03e079b0d27",
  "64ff4be9855dc03e079b0d30",
  "64ff4c18855dc03e079b0d67",
  "64ff4c18855dc03e079b0d6f",
  "64ff8d34855dc03e079b1b80",
  "64ff8d34855dc03e079b1b89",
  "6500df93855dc03e079b33e0",
  "6500dfca855dc03e079b340b",
  "6500dfca855dc03e079b3413",
  "6500e193855dc03e079b34e1",
  "65048ee889aae1a99f569693",
  "65048ee889aae1a99f56969c",
  "6508cc1689aae1a99f56a542",
  "6508cc1689aae1a99f56a54a",
  "6508cc1689aae1a99f56a553",
  "6511994278e923840084ec76",
  "6513496978e923840085066d",
  "6513496978e9238400850675",
  "65134a8478e92384008506fc",
  "65134a8478e9238400850704",
  "65147802bccfc0052da82df4",
  "65147802bccfc0052da82dfd",
  "65147802bccfc0052da82e05",
  "651ada14ef15dc45abf4aef9",
  "651ada14ef15dc45abf4af02",
  "651adf64ef15dc45abf4af98",
  "652068da1b69b82f8c7c6239",
  "6525c66e092b2e102f1c5051",
  "6525c66e092b2e102f1c505b",
  "652e9041092b2e102f1cca23",
  "652ef7bd6c311c99f409190e",
  "652ef7d96c311c99f4091ae1",
  "652ef7d96c311c99f4091aea",
  "652ef7d96c311c99f4091af4",
  "652f0e3e6c311c99f4094a84",
  "652f0e3e6c311c99f4094a8e",
  "65319695480747f33b3facc4",
  "65319695480747f33b3faccd",
  "6531ad23480747f33b3fb9b1",
  "6532f549480747f33b402198",
  "6532f549480747f33b4021a2",
  "6533e474480747f33b404182",
  "6533ed8171b6d088fe56ae53",
  "653678bd71b6d088fe56dab3",
  "653678bd71b6d088fe56dabe",
  "65367abc71b6d088fe56deb6",
  "65367abc71b6d088fe56dec0",
  "65367abc71b6d088fe56deca",
  "65367b8e71b6d088fe56e014",
  "65367bb271b6d088fe56e158",
  "6537bc0242cc0529f2f579a7",
  "6537bc2b42cc0529f2f583d7",
  "6537c01442cc0529f2f59dce",
  "6537e07c3beaaf31d7cbd275",
  "6537e07c3beaaf31d7cbd27e",
  "6537e0ae3beaaf31d7cbd777",
  "6537e0ae3beaaf31d7cbd780",
  "6537e0ae3beaaf31d7cbd78a",
  "6537e92a3beaaf31d7cbf03a",
  "6537e92a3beaaf31d7cbf043",
  "6539373f74c60a5ef5db3cbe",
  "6539373f74c60a5ef5db3cc7",
  "6539376d74c60a5ef5db3f4c",
  "6539376d74c60a5ef5db3f56",
  "6541612efa0246c2b37060f1",
  "6541612efa0246c2b37060fb",
  "654a365ffa0246c2b37096ca",
  "654a365ffa0246c2b37096d4",
  "654a365ffa0246c2b37096de",
  "654a9998fa0246c2b370d416",
  "654a99bbfa0246c2b370d57f",
  "654a99bbfa0246c2b370d589",
  "654c0b0e2e26c869925d726f",
  "6553e72721389ee0785628a7",
  "6553e72721389ee0785628b0",
  "6553ecb521389ee078563c7c",
  "6553ecb521389ee078563c86",
  "6554f9f1a261000e2a554705",
  "6554fa3aa261000e2a5548c8",
  "6554fa3aa261000e2a5548d2",
  "65553cf6a261000e2a555e46",
  "65553cf6a261000e2a555e50",
  "655ce152a261000e2a55c258",
  "655e621630416deb1cddd433",
  "655e621630416deb1cddd43e",
  "655e630230416deb1cddd722",
  "655e630230416deb1cddd72b",
  "655e7e6630416deb1cddf519",
  "655e7e6630416deb1cddf523",
  "655e7e6630416deb1cddf52d",
  "656111d230416deb1cde16c4",
  "656111d230416deb1cde16cd",
  "656123d130416deb1cde27b5",
  "65665c2230416deb1cde7487",
  "65665c2230416deb1cde7491",
  "65665c2230416deb1cde749b",
  "65665c2230416deb1cde74a5",
  "65665c2230416deb1cde74af",
  "65665c2230416deb1cde74b9",
  "656e0618191a4dd437186f32",
  "656e0618191a4dd437186f3b",
  "656e366a191a4dd437188810",
  "656e366a191a4dd437188819",
  "656e369d191a4dd4371889d0",
  "6570f0cabfe5a0191805a05b",
  "6570f0cabfe5a0191805a065",
  "657a201c12f52f9fcae1bf50",
  "657a201c12f52f9fcae1bf5a",
  "657a391512f52f9fcae1e51b",
  "657a391512f52f9fcae1e524",
  "657a39ec12f52f9fcae1e9de",
  "657a3b0712f52f9fcae1ee0d",
  "657a3b0712f52f9fcae1ee18",
  "657a3b0712f52f9fcae1ee22",
  "657a3b3f12f52f9fcae1efa2",
  "657a3b3f12f52f9fcae1efad",
  "657a4e3412f52f9fcae28ca9",
  "657a502e12f52f9fcae2a9ab",
  "657a514a12f52f9fcae2bab3",
  "657a514a12f52f9fcae2babc",
  "657a514a12f52f9fcae2bac6",
  "657a554612f52f9fcae30907",
  "657a6667717be10ef46a6bb9",
  "657a6667717be10ef46a6bc3",
  "657a75de0204331078240492",
  "657b0872dc49c71e268e02cb",
  "657b0872dc49c71e268e02d6",
  "657b1b5cdc49c71e268ed9fe",
  "657b1b5cdc49c71e268eda08",
  "657b1cf7dc49c71e268ef4aa",
  "6582078c78a03c3399c7d569",
  "65845d7378a03c3399c82b0f",
  "65845d7378a03c3399c82b19",
  "65845d7378a03c3399c82b23",
  "6585ac0678a03c3399c830de",
  "6585ac0678a03c3399c830e8",
  "6585ac0678a03c3399c830f2",
  "6585b70178a03c3399c83602",
  "6585b70178a03c3399c8360c",
  "6585b81678a03c3399c836a2",
  "6585c68078a03c3399c83ec0",
  "6585c68078a03c3399c83ec9",
  "6585c76078a03c3399c83fc0",
  "6585c76178a03c3399c83fc9",
  "6585d09b78a03c3399c844d3",
  "65958d451d23f363e9f12059",
  "65958d451d23f363e9f12062",
  "65958d451d23f363e9f1206b",
  "6597143f1d23f363e9f1c823",
  "6597143f1d23f363e9f1c82c",
  "659714841d23f363e9f1ca12",
  "659ff564ac32287a4cca7eba",
  "659ff564ac32287a4cca7ec3",
  "659ff564ac32287a4cca7ecd",
  "65a044bfac32287a4cca836d",
  "65a044bfac32287a4cca8376",
  "65a18842ac32287a4cca8f03",
  "65a1a1e8ac32287a4cca95bf",
  "65a1a1e8ac32287a4cca95c9",
  "65a53639ac32287a4cca9be2",
  "65aa9102ac32287a4ccb31ff",
  "65aaa8e7ac32287a4ccb51d4",
  "65aaa8e7ac32287a4ccb51dd",
  "65aaa925ac32287a4ccb5399",
  "65ae7269ac32287a4ccb5b9e",
  "65ae7294ac32287a4ccb5c47",
  "65afd055ac32287a4ccb8ec8",
  "65afd453ac32287a4ccb9a09",
  "65afd453ac32287a4ccb9a12",
  "65b1408eb67f36b1bc9c6159",
  "65b1408eb67f36b1bc9c6162",
  "65b1408eb67f36b1bc9c616c",
  "65b140bab67f36b1bc9c63f7",
  "65b140bab67f36b1bc9c6401",
  "65b142b5b67f36b1bc9c7172",
  "65b142b5b67f36b1bc9c717b",
  "65b14c8fb67f36b1bc9ca354",
  "65b19a655d113fe84e0d1da2",
  "65b3a9335d113fe84e0e4498",
  "65b3a9335d113fe84e0e44a2",
  "65b3b5e05d113fe84e0e5a68",
  "65b7b9405d113fe84e0ef840",
  "65b7b9405d113fe84e0ef84a",
  "65b83546bb28e4039cd1be43",
  "65b9b08fbb28e4039cd2046a",
  "65b9b0d9bb28e4039cd20599",
  "65ba7c34bb28e4039cd26305",
  "65ba7c34bb28e4039cd2630f",
  "65ba7cc1bb28e4039cd264f4",
  "65ba7cc1bb28e4039cd264fe",
  "65ba7cc1bb28e4039cd26509",
  "65bb94d0bb28e4039cd26a16",
  "65bb94d0bb28e4039cd26a21",
  "65bba611bb28e4039cd275d5",
  "65bba611bb28e4039cd275df",
  "65bbab17bb28e4039cd27ea8",
  "65bbabacbb28e4039cd27fec",
  "65bbabacbb28e4039cd27ff5",
  "65bbc749bb28e4039cd2ad66",
  "65bbc749bb28e4039cd2ad6f",
  "65bbc785bb28e4039cd2aef2",
  "65c0f40ed5a41a7958cae86b",
  "65c0f69dd5a41a7958caf935",
  "65c0fff2d5a41a7958cb3870",
  "65c0fff2d5a41a7958cb3879",
  "65c0fff2d5a41a7958cb3883",
  "65c119b6b3917f027e9d2540",
  "65c119b6b3917f027e9d2549",
  "65c119b6b3917f027e9d2552",
  "65c119b6b3917f027e9d255b",
  "65c119b6b3917f027e9d2564",
  "65c119b6b3917f027e9d256d",
  "65c11f3eb3917f027e9d96ab",
  "65c1912c4b6ef50819cec9ed",
  "65c1912c4b6ef50819cec9f7",
  "65c2428f4b6ef50819cf9058",
  "65c2428f4b6ef50819cf9061",
  "65c2428f4b6ef50819cf906a",
  "65c2428f4b6ef50819cf9073",
  "65c2428f4b6ef50819cf907c",
  "65c2428f4b6ef50819cf9085",
  "65c2428f4b6ef50819cf908e",
  "65c2428f4b6ef50819cf9097",
  "65c293fc6d074138cddf2cfb",
  "65c293fd6d074138cddf2d04",
  "65c293fd6d074138cddf2d0e",
  "65c4e6b49cde0c433455cda5",
  "65c4e6b49cde0c433455cdae",
  "65c4e6b49cde0c433455cdb7",
  "65c653586a7889cb61aba0fa",
  "65cf6b746a7889cb61ac6178",
  "65cf6b746a7889cb61ac6182",
  "65cf6b746a7889cb61ac618b",
  "65cf6b746a7889cb61ac6194",
  "65cf6b746a7889cb61ac619d",
  "65cf6b746a7889cb61ac61a7",
  "65d34daf6a7889cb61acad6f",
  "65d34daf6a7889cb61acad7a",
  "65d366346a7889cb61acb180",
  "65d39eb86a7889cb61ace3b9",
  "65d3bac06a7889cb61acfd23",
  "65d4480c6a7889cb61ad33d4",
  "65d44b1f6a7889cb61ad3413",
  "65dcc4fb25f9a944396942a1",
  "65dcc4fb25f9a944396942ab",
  "65dcc4fb25f9a944396942b5",
  "65dcc53725f9a94439694409",
  "65dcc53725f9a94439694414",
  "65dd063a25f9a944396981ce",
  "65dd127325f9a9443969b9d3",
  "65de4bb625f9a944396a14a7",
  "65de4bb625f9a944396a14b2",
  "65f1aae623712cdd535c2b6b",
  "65f1aae623712cdd535c2b74",
  "65f1aae623712cdd535c2b7e",
  "65f1aae623712cdd535c2b89",
  "65f846e523712cdd535c7c73",
  "65f846e523712cdd535c7c7c",
  "65f846e523712cdd535c7c86",
  "65f85af023712cdd535c7df1",
  "65f85af023712cdd535c7dfa",
  "65f85af023712cdd535c7e03",
  "65f8671523712cdd535c7fc5",
  "65f869be23712cdd535c80d1",
  "65f869be23712cdd535c80db",
  "65f86b2a23712cdd535c815a",
  "65f9a62b23712cdd535c8934",
  "65fc4c22705290eae5211604",
  "65fc4c22705290eae521160e",
  "65fd9966705290eae5211b18",
  "660efd4fbacf521d5e15b582",
  "660efd4fbacf521d5e15b58c",
  "660efd4fbacf521d5e15b595",
  "660efd4fbacf521d5e15b59e",
  "660efd4fbacf521d5e15b5a7",
  "660efd4fbacf521d5e15b5b0",
  "660efd4fbacf521d5e15b5b9",
  "660efd4fbacf521d5e15b5c2",
  "660efd4fbacf521d5e15b5cc",
  "66bf5f3d1b5979d54e65f333",
  "66bf5f3d1b5979d54e65f33d",
  "66bf5f3d1b5979d54e65f345",
  "66bf5f3d1b5979d54e65f34e",
  "66c6193ab6af2c3ebd370036",
  "66c6193ab6af2c3ebd370040",
  "66c6193ab6af2c3ebd370048",
  "66c6193ab6af2c3ebd370051",
  "66db0d49060e0e157a2c6357",
  "66db0d49060e0e157a2c6361",
  "66db0d49060e0e157a2c6369",
  "66db0d4a060e0e157a2c6372",
  "66db0d4a060e0e157a2c637c",
  "66e2031c060e0e157a2d0733",
  "66e98593060e0e157a2d4f5e",
  "66f1c5170cc6780554401265",
  "6708290da5e76bef363b2059",
  "672a2b0a6c44040538b44447",
  "672a3d3f6c44040538b4878f",
  "672a9e6f5ccc5ffc5c373acb",
  "672a9f025ccc5ffc5c37460d",
  "672bf1ee3a6ae4586263f4f9",
  "673cd73830ef8a431eff1aaa",
  "6751b59778c91bac9c6b2ca4",
  "6758ba5a3284452c83d1833f",
  "6759ef763284452c83d23fd0",
  "676d7b82620ddc1b15f23787",
  "676d7dee620ddc1b15f246e8",
  "676ed1d9cb58319608330e81",
  "676ed272cb583196083315d8",
  "677ee2a787a450facefdb690",
  "6780425223112099ba3379a3",
  "6786cc767eeee6335abd7af0",
  "6786cc767eeee6335abd7af1",
];

consultarPension_Estudiante = async function (req) {
  try {
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Pension, Estudiante, Dpago } = models;

    // Reemplazar forEach por Promise.all
    let dpagos = await Promise.all(
      listado_detalles_erroneos.map(async (element) => {
        const aux = await Dpago.findById(element)
          .populate("idpension")
          .populate("estudiante");
        if (!aux) {
          console.error("Error al obtener detalles de pagos", aux);
          return null;
        }
        return aux;
      })
    );

    console.log("Listado de pagos: ", dpagos.length);

    // Filtrar los valores null y obtener valores únicos
    // Obtener objetos únicos usando un Map para mantener solo una instancia por ID
    const estudiantesMap = new Map();
    const pensionesMap = new Map();

    dpagos
      .filter((dpago) => dpago && dpago.estudiante)
      .forEach((dpago) => {
        estudiantesMap.set(dpago.estudiante._id.toString(), dpago.estudiante);
      });

    dpagos
      .filter((dpago) => dpago && dpago.idpension)
      .forEach((dpago) => {
        pensionesMap.set(dpago.idpension._id.toString(), dpago.idpension);
      });

    // Convertir los Maps a arrays de objetos
    const estudiantes_unicos = Array.from(estudiantesMap.values());
    const pensiones_unicas = Array.from(pensionesMap.values());
    // Guardar en archivo JSON
    const fs = require("fs");
    await fs.promises.writeFile(
      "estudiantes.json",
      JSON.stringify(estudiantes_unicos, null, 2)
    );
    await fs.promises.writeFile(
      "pension.json",
      JSON.stringify(pensiones_unicas, null, 2)
    );
    const detalles = dpagos.map((element) => ({
      _id: element._id,
      idpension: element.idpension._id,
      estudiante: element.estudiante._id,
    }));
    await fs.promises.writeFile(
      "detallespagos.json",
      JSON.stringify(detalles, null, 2)
    );

    console.log("Estudiantes únicos: ", estudiantes_unicos[0]);
    console.log("Pensiones únicas: ", pensiones_unicas[0]);

    return { estudiantes_unicos, pensiones_unicas };
  } catch (error) {
    console.error("Error al consultar pensiones", error);
    throw error;
  }
};

const obtener_detallespagos_admin = async function (req, res) {
  if (req.user) {
    try {
      //await consultarPension_Estudiante(req);
      var id = req.params["id"];
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pago, Config, Pension, Estudiante, Documento, Dpago } = models;

      let detalle = [];
      let pagosd = [];

      const config = await Config.findById(id);
      //console.log("Configuración buscada: ", config);
      if (config) {
        detalle = await Dpago.find()
          .populate("idpension")
          .populate("pago")
          .lean();
        //console.log(detalle);
        pagosd = detalle.filter(
          (element) =>
            element.idpension &&
            element.idpension.anio_lectivo &&
            element.idpension.idanio_lectivo &&
            (element.idpension.idanio_lectivo.toString() ===
              config._id.toString() ||
              new Date(element.idpension.anio_lectivo).getTime() ===
                new Date(config.anio_lectivo).getTime())
        );
        const error_arr = detalle.filter((elment) => !elment.idpension);
        console.log("Listado de pagos sin pensiones");
        /*error_arr.forEach((element) => {
          console.log("'" + element._id + "',");
        });
        console.error("DATOS ERRONEOS: ", error_arr.length);*/
        res.status(200).send({ data: pagosd });
      } else {
        detalle = await Dpago.find().populate("idpension");
        res.status(200).send({ data: detalle });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_detallespagos_pension_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pago, Pension, Estudiante, Documento, Dpago } = models;

      var id = req.params["id"];
      let detalle = [];
      detalle = await Dpago.find({ idpension: id })
        .populate("idpension")
        .populate("documento")
        .populate("pago")
        .populate("estudiante");

      res.status(200).send({ data: detalle });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_detalles_ordenes_estudiante_abono = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pension_Beca, Dpago } = models;

      var id = req.params["id"];
      abonos = await Dpago.find({ idpension: id }).sort({ tipo: 1 });
      becas = await Pension_Beca.find({ idpension: id }).sort({ etiqueta: 1 });

      res.status(200).send({ abonos, becas });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};

/**
 * Verifica si un estudiante tiene deudas pendientes de matrícula o pensiones
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
const verificarDeudasEstudiante = async function (req, res) {
  if (!req.user) {
    return res.status(403).json({ message: "NoAccess" });
  }

  try {
    // Inicializar conexión y modelos
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      return res.status(500).send({
        message: `No se pudieron cargar los modelos para la base ${dbName}`,
        status: modelsService.getModelsCacheStatus(), // Para depuración
      });
    }

    // Usar los modelos ya inicializados
    const { Pension, Dpago, Config, Pension_Beca, Estudiante } = models;

    // Obtener ID o DNI del estudiante
    const idEstudiante = req.params["id"];
    if (!idEstudiante) {
      return res
        .status(400)
        .json({ message: "ID o DNI de estudiante no proporcionado" });
    }

    let estudiante = await Estudiante.findOne({ dni: idEstudiante });

    // Si no se encuentra por ID, buscar por DNI
    if (!estudiante && mongoose.Types.ObjectId.isValid(idEstudiante)) {
      estudiante = await Estudiante.findById(idEstudiante);
    }

    // Verificar si el estudiante fue encontrado
    if (!estudiante) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    // Buscar todas las pensiones del estudiante
    const pensiones = await Pension.find({ idestudiante: estudiante._id })
      .populate("idanio_lectivo")
      .sort({ createdAt: -1 });

    if (!pensiones || pensiones.length === 0) {
      return res.status(404).json({
        message: "No se encontraron registros de pensión para este estudiante",
      });
    }

    // Preparar resultado
    const resultado = [];

    // Procesar cada pensión
    for (const pension of pensiones) {
      // Verificar si idanio_lectivo existe y tiene datos
      if (!pension.idanio_lectivo) {
        continue; // Saltar si no hay información del año lectivo
      }

      // Obtener valores de referencia del año lectivo (con 2 decimales)
      const valorMatricula = parseFloat(
        (pension.idanio_lectivo.matricula || 0).toFixed(2)
      );
      const valorPension = parseFloat(
        (pension.idanio_lectivo.pension || 0).toFixed(2)
      );
      const numPensiones = pension.idanio_lectivo.numpension || 10;

      // Obtener pagos realizados para esta pensión
      const pagos = await Dpago.find({ idpension: pension._id }).sort({
        tipo: 1,
      });

      // Obtener becas para esta pensión
      const becas = await Pension_Beca.find({ idpension: pension._id }).sort({
        etiqueta: 1,
      });

      // Verificar información de becas
      const tieneBeca = pension.condicion_beca === "Si";
      const porcentajeBeca = pension.desc_beca || 0;
      const mesesConBeca = becas.length;

      // Analizar estado de matrícula (tipo 0)
      const pagosMatricula = pagos.filter((p) => p.tipo === 0 && p.abono === 0);
      const matriculaPagada = pagosMatricula.length > 0;
      const valorPendienteMatricula = !matriculaPagada ? valorMatricula : 0;

      // Determinar abonos de matrícula
      const abonosMatricula = pagos.filter(
        (p) => p.tipo === 0 && p.abono === 1
      );
      const totalAbonadoMatricula = abonosMatricula.reduce(
        (sum, abono) => sum + abono.valor,
        0
      );

      // Analizar estado de pensiones (tipo 1-10)
      const estadoPensiones = [];

      for (let i = 1; i <= numPensiones; i++) {
        // Verificar si este mes tiene beca
        const mesTieneBeca =
          tieneBeca && becas.some((b) => parseInt(b.etiqueta) === i);

        // Calcular valor de esta pensión considerando beca (con 2 decimales)
        let valorMensual = valorPension;
        if (mesTieneBeca && porcentajeBeca === 100) {
          valorMensual = 0; // Pensión completamente becada
        } else if (mesTieneBeca) {
          valorMensual = parseFloat(
            (valorPension * (1 - porcentajeBeca / 100)).toFixed(2)
          ); // Descuento parcial
        }

        // Verificar pagos completos (no abonos) para esta pensión
        const pagoCompleto = pagos.filter((p) => p.tipo === i && p.abono === 0);
        const pensionPagada = pagoCompleto.length > 0;

        // Determinar abonos para esta pensión
        const abonosPension = pagos.filter(
          (p) => p.tipo === i && p.abono === 1
        );
        const totalAbonadoPension = abonosPension.reduce(
          (sum, abono) => sum + abono.valor,
          0
        );

        // Calcular saldo pendiente
        const saldoPendiente =
          valorMensual > 0
            ? Math.max(0, valorMensual - totalAbonadoPension)
            : 0;

        estadoPensiones.push({
          mes: i,
          tieneBeca: mesTieneBeca,
          valorOriginal: valorPension,
          valorConDescuento: valorMensual,
          pagado: pensionPagada,
          abonado: totalAbonadoPension,
          pendiente: pensionPagada ? 0 : saldoPendiente,
        });
      }

      // Calcular totales
      const totalPendientePensiones = estadoPensiones.reduce(
        (sum, p) => sum + p.pendiente,
        0
      );
      const mesesPendientes = estadoPensiones.filter(
        (p) => p.pendiente > 0
      ).length;

      // Determinar si tiene deuda
      const tieneDeudaMatricula = valorPendienteMatricula > 0;
      const tieneDeudaPensiones = totalPendientePensiones > 0;

      // Construir resultado para esta pensión
      resultado.push({
        idPension: pension._id,
        anioLectivo: pension.anio_lectivo,
        curso: pension.curso,
        paralelo: pension.paralelo,
        idAnioLectivo: pension.idanio_lectivo._id,
        detallesAnioLectivo: {
          valorMatricula,
          valorPension,
          numPensiones,
        },
        estadoMatricula: {
          pagada: matriculaPagada,
          abonado: totalAbonadoMatricula,
          pendiente: valorPendienteMatricula,
          tieneDeuda: tieneDeudaMatricula,
        },
        estadoPensiones: {
          detallesMensual: estadoPensiones,
          mesesPendientes,
          totalPendiente: totalPendientePensiones,
          tieneDeuda: tieneDeudaPensiones,
        },
        tieneDeuda: tieneDeudaMatricula || tieneDeudaPensiones,
        totalAdeudado: parseFloat(
          (valorPendienteMatricula + totalPendientePensiones).toFixed(2)
        ),
      });
    }

    // Determinar si tiene alguna deuda en general
    const tieneDeudaGeneral = resultado.some((r) => r.tieneDeuda);
    const totalAdeudadoGeneral = resultado.reduce(
      (sum, r) => sum + r.totalAdeudado,
      0
    );

    return res.status(200).json({
      success: true,
      estudiante: idEstudiante,
      tieneDeuda: tieneDeudaGeneral,
      totalAdeudado: parseFloat(totalAdeudadoGeneral.toFixed(2)),
      detallePorAnioLectivo: resultado,
    });
  } catch (error) {
    console.error("Error al verificar deudas:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación. Por favor, verifica tus datos.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error al verificar deudas del estudiante",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};

const obtener_becas_conf = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Pension, Pension_Beca, Config } = models;

      var id = req.params["id"];

      //let config=await Config.findById(id);

      let pens = [];
      var pens2 = await Pension.find();
      pens2.forEach((element) => {
        if (element.idanio_lectivo == id) {
          pens.push(element);
        }
      });

      var becas = await Pension_Beca.find().populate("idpension");

      let becasconfig = [];
      becas.forEach((element) => {
        //element.idpension.idanio_lectivo==id
        if (
          element.idpension &&
          element.idpension.idanio_lectivo &&
          element.idpension.idanio_lectivo == id
        ) {
          becasconfig.push(element);
        }
      });

      res.status(200).send({ becas: becasconfig });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const obtener_detalles_ordenes_rubro = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Config, Pension, Dpago } = models;

      var id = req.params["id"];

      const pagos = await Dpago.find({ tipo: id })
        .populate("idpension")
        .populate("idanio_lectivo");

      res.status(200).send({ pagos });
    } catch (error) {
      console.error(error);
      res.status(200).send({ message: "Algo salio mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
var soap = require("soap");
const { parseString, Builder } = require("xml2js");

function toJson(xml) {
  parseString(xml, { explicitArray: false }, function (error, result) {
    //console.log(result);
    return result;
    //toXML(result)
  });
}

// Convert string/JSON to XML
function toXML(json) {
  const builder = new Builder();
  //console.log(builder.buildObject(json));
  return builder.buildObject(json);
}

ruc_arr = [
  {
    base: "CRISTOREY",
    ruc: "0891726503001",
  },
  {
    base: "Otro",
    ruc: "",
  },
  {
    base: "MADRESALVADOR",
    ruc: "0891728905001",
  },
];
const marcar_finalizado_orden = async function (req, res) {
  if (!req.user) {
    return res.status(403).send({ message: "NoAccess" });
  }

  try {
    // Conexión a la base de datos correspondiente
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      return res.status(500).send({
        message: `No se pudieron cargar los modelos para la base ${dbName}`,
        status: modelsService.getModelsCacheStatus(), // Para depuración
      });
    }

    // Usar los modelos ya inicializados
    const { Registro, Pago } = models;

    const id = req.params["id"];
    const data = { ...req.body, numeroIdPago: id };

    // Buscar el RUC basado en la base del usuario
    const rucEntry = ruc_arr.find((element) => element.base === req.user.base);
    if (!rucEntry || !rucEntry.ruc) {
      return res.status(400).send({ message: "RUC no encontrado o inválido" });
    }
    data.rucEmpresa = rucEntry.ruc;

    // URL del servicio SOAP
    const url_validar =
      "http://34.172.21.101:8080/interfaceFacturaV2/ws/servicioFacturacionPort?wsdl";
    console.log(data);
    // Crear cliente SOAP
    soap.createClient(url_validar, function (err, client) {
      if (err) {
        console.error("ERROR CLIENTE:", err);
        return res.status(500).send({ message: "Error al crear cliente SOAP" });
      }

      // Llamada al servicio Facturador
      client.Facturador(data, function (err1, result) {
        if (err1) {
          console.error("ERROR FACTURADOR:", err1);
          return res
            .status(500)
            .send({ message: "Error al procesar la factura" });
        }

        console.log("RESPUESTA: ", result?.respuesta?.respuestaGenerada);

        if (
          result?.respuesta?.respuestaGenerada === "Transaccion Exitosa" &&
          result?.respuesta?.respuestaTransaccion === "OK"
        ) {
          cambiar_estado(id, req.user.base, req.user.sub, data);
        }

        const msg = result?.respuesta?.respuestaGenerada || "Error desconocido";
        res.status(200).send({ message: msg });
      });
    });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send({
        message: "Error de validación. Por favor, verifica tus datos.",
      });
    }
    res.status(500).send({
      message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
    });
  }
};

cambiar_estado = async function (id, base, admin, data) {
  const dbName = req.user.base;

  // Obtener los modelos para esta base de datos
  const models = modelsService.getModels(dbName);

  if (!models) {
    throw new Error(`No se pudieron cargar los modelos para la base ${dbName}`);
  }

  // Usar los modelos ya inicializados
  const { Registro, Pago } = models;

  let registro = {};
  registro.admin = admin;
  registro.tipo = "Emitido";
  registro.descripcion = JSON.stringify(data);

  await Registro.create(registro);

  var pago = await Pago.updateOne(
    { _id: id },
    {
      estado: "Emitido",
    }
  );
  return (message = "Ok");
};

const eliminar_finalizado_orden = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Pago } = models;

      var id = req.params["id"];

      let data = req.body;
      let registro = {};
      registro.admin = req.user.sub;
      registro.tipo = "Devolucion";
      registro.descripcion = JSON.stringify(data);
      await Registro.create(registro);

      var pago = await Pago.updateOne(
        { _id: id },
        {
          estado: "Devolucion",
        }
      );

      res.status(200).send({ data: pago });
    } catch (error) {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({
          message: "Error de validación. Por favor, verifica tus datos.",
        });
      } else {
        res.status(500).send({
          message: "Algo salió mal. Por favor, intenta nuevamente más tarde.",
        });
      }
    }
  } else {
    res.status(403).send({ message: "NoAccess" });
  }
};
const eliminar_documento_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Documento, Dpago } = models;

      var id = req.params["id"];

      var dpagos = await Dpago.find({ documento: id });
      if (dpagos.length == 0) {
        let doc = await Documento.findById({ _id: id });
        const registro = {};
        registro.documento = id;
        registro.admin = req.user.sub;
        registro.tipo = "Elimino";
        registro.descripcion = JSON.stringify(doc);
        await Registro.create(registro);
        //elimina documento
        await Documento.deleteOne({ _id: id });

        res.status(200).send({ message: "Eliminado con exito" });
      } else {
        res
          .status(200)
          .send({ message: "No se puede eliminar, ya se han efectuado pagos" });
      }
    } catch (error) {
      console.log(error);
      res.status(200).send({ message: "Algo salió mal" });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const eliminar_orden_admin = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Pago, Config, Pension, Documento, Dpago } = models;

      var id = req.params["id"];
      //registra el pago
      var pagos = await Pago.findById(id);

      if (pagos.estado == "Registrado") {
        //busca los detalles de pago
        var dpagos = await Dpago.find({ pago: id });
        try {
          for (var dp of dpagos) {
            let aux = await Pension.find({ _id: dp.idpension }).populate(
              "idanio_lectivo"
            );
            //actualiza el documento con el valor del pago
            let doc = await Documento.findById({ _id: dp.documento });
            let new_stock = parseFloat(doc.valor) + parseFloat(dp.valor);
            let new_pago = doc.npagos - 1;
            await Documento.updateOne(
              { _id: dp.documento },
              {
                valor: new_stock,
                npagos: new_pago,
              }
            );
            //
            //registro de detalle de pago
            let registro = {};
            registro.estudiante = pagos.estudiante;
            registro.documento = dp.documento;
            registro.admin = req.user.sub;
            registro.tipo = "Elimino";
            registro.descripcion = JSON.stringify(dp);

            await Registro.create(registro);
            if (dp.tipo == 0) {
              if (dp.estado.search("Abono") == -1) {
                await Pension.updateOne(
                  { _id: dp.idpension },
                  {
                    matricula: 0,
                  }
                );
              }
            } else if (dp.tipo > 0 && dp.tipo <= 11) {
              if (dp.estado.search("Abono") == -1) {
                //var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
                let config = aux[0].idanio_lectivo;
                //let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                if (
                  aux[0].condicion_beca == "Si" &&
                  dp.valor != config.pension
                ) {
                  if (aux[0].num_mes_res + 1 > aux[0].num_mes_beca) {
                    aux[0].num_mes_res = aux[0].num_mes_beca;
                  } else {
                    aux[0].num_mes_res = aux[0].num_mes_res + 1;
                  }

                  if (aux[0].meses - 1 <= 0) {
                    aux[0].meses = 0;
                  } else {
                    aux[0].meses = aux[0].meses - 1;
                  }

                  await Pension.updateOne(
                    { _id: dp.idpension },
                    {
                      meses: aux[0].meses,
                      num_mes_res: aux[0].num_mes_res,
                    }
                  );
                } else {
                  if (aux[0].meses - 1 <= 0) {
                    aux[0].meses = 0;
                  } else {
                    aux[0].meses = aux[0].meses - 1;
                  }
                  await Pension.updateOne(
                    { _id: dp.idpension },
                    {
                      meses: aux[0].meses,
                    }
                  );
                }
              }
            } else {
              try {
                if (dp.estado.search("Abono") == -1) {
                  //var aux = await Pension.find({ _id: dp.idpension }).populate('idanio_lectivo');

                  //var cn = await Config.find().sort({ createdAt: -1 }); //await Config.findById({_id:'61abe55d2dce63583086f108'});
                  let config = aux[0].idanio_lectivo;

                  //let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
                  var auxpagos = [];
                  if (config.extrapagos) {
                    var auxpagos = JSON.parse(config.extrapagos);
                  }
                  if (
                    auxpagos.find((element) => element.idrubro == dp.tipo) !=
                    undefined
                  ) {
                    var arr_rubro = [];
                    if (aux.extrapagos) {
                      arr_rubro = JSON.parse(aux.extrapagos);
                    }
                    var rubro = arr_rubro.find(
                      (element) => element.idrubro == dp.tipo
                    );

                    arr_rubro.forEach((element, key) => {
                      if (rubro.idrubro == element.idrubro) {
                        arr_rubro.splice(key, 1);
                      }
                    });

                    await Pension.updateOne(
                      { _id: dp.idpension },
                      {
                        extrapagos: JSON.stringify(arr_rubro),
                      }
                    );
                  }
                }
              } catch (error) {
                console.log(error);
                res.status(200).send({ message: "Algo salió mal" + error });
              }
            }
            //await Dpago.findOneAndDelete(dp._id);
          }
        } catch (error) {
          console.log(error);
          res.status(200).send({ message: "Algo salió mal" + error });
        }

        //remueve detalles de pago

        await Dpago.deleteMany({ pago: id });
        let registro = {};
        registro.estudiante = pagos.estudiante;
        registro.admin = req.user.sub;
        registro.tipo = "Elimino";
        registro.descripcion = JSON.stringify(pagos);
        await Registro.create(registro);
        //elimina el pago
        var pago = await Pago.deleteOne({ _id: id });

        res.status(200).send({ message: "Eliminado con exito" });
      } else {
        res.status(200).send({
          message: "No puedes eliminar está orden, ya ah sido emitido ",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(200).send({ message: "Algo salió mal" + error });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const eliminar_orden_pm = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        throw new Error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
      }

      // Usar los modelos ya inicializados
      const { Registro, Pago, Config, Pension, Documento, Dpago } = models;

      var id = req.params["id"];

      //remueve detalles de pago
      await Dpago.deleteMany({ pago: id });
      //elimina el pago
      await Pago.deleteOne({ _id: id });

      res.status(200).send({ message: "Eliminado con exito" });
    } catch (error) {
      res.status(200).send({ message: "Algo salió mal" + error });
    }
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};

const actualizar_pago_id_contifico = async function (req, res) {
  if (!req.user) {
    return res.status(401).send({ message: "No autorizado" });
  }
  const dbName = req.user.base;

  // Obtener los modelos para esta base de datos
  const models = modelsService.getModels(dbName);

  if (!models) {
    return res.status(500).send({
      message: `No se pudieron cargar los modelos para la base ${dbName}`,
      status: modelsService.getModelsCacheStatus(), // Para depuración
    });
  }

  // Usar los modelos ya inicializados
  const { Pago } = models;

  try {
    const { id, id_contifico } = req.body;
    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).send({ message: "No existe el pago" });
    }
    pago.id_contifico = id_contifico;
    await pago.save();
    res.status(200).send({ message: "Actualizado con exito" });
  } catch (error) {
    res.status(200).send({ message: "Algo salió mal" + error });
  }
};
/*const result = await actualizarStockTOTALES(conn);
  const fs = require("fs");
    await fs.promises.writeFile(
      "documentos_p.json",
      JSON.stringify(result, null, 2)
    );*/
const registroCompraManualEstudiante = async function (req, res) {
  if (!req.user) {
    return res.status(401).send({ message: "No autorizado" });
  }

  const dbName = req.user.base;

  // Obtener los modelos para esta base de datos
  const models = modelsService.getModels(dbName);

  if (!models) {
    return res.status(500).send({
      message: `No se pudieron cargar los modelos para la base ${dbName}`,
      status: modelsService.getModelsCacheStatus(), // Para depuración
    });
  }

  // Usar los modelos ya inicializados
  const {
    Pago,
    Dpago,
    Estudiante,
    Registro,
    Pension,
    Pension_Beca,
    Documento,
    Config,
  } = models;

  const session = null; // await mongoose.startSession();

  try {
    // session.startTransaction();

    const { pago, detalles, config } = await crearPagoYRegistro(
      req,
      models,
      session
    );

    const dpagosValidos = await procesarDetallesPagos(
      detalles,
      config,
      pago,
      models,
      session
    );

    if (dpagosValidos.length === 0) {
      throw new Error("No se pudieron registrar los pagos");
    }

    await actualizarPagoTotal(pago, dpagosValidos, models, session);

    //await session.commitTransaction();
    res.status(200).send({ pago, message: "Registrado correctamente" });
  } catch (error) {
    console.error("Error en registro de compra:", error);
    if (session && session.inTransaction()) {
      //  await session.abortTransaction();
    }
    res
      .status(500)
      .send({ message: "Error en el registro", detalles: error.message });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

async function crearPagoYRegistro(req, models, session) {
  const { Pago, Registro } = models;

  const { config, detalles, ...data } = req.body;
  data.estado = "Registrado";

  const [pago] = await Pago.create(
    [data]
    // { session }
  );

  await Registro.create(
    [
      {
        admin: req.user.sub,
        estudiante: data.estudiante,
        tipo: "creo",
        descripcion: JSON.stringify(req.body),
      },
    ]
    // { session }
  );

  return { pago, detalles, config };
}

async function procesarDetallesPagos(detalles, config, pago, models, session) {
  const { Dpago } = models;
  const dpagosValidos = [];

  for (const element of detalles) {
    const elementoProcesado = {
      ...element,
      pago: pago._id,
      estudiante: pago.estudiante,
    };

    const validExistente = await Dpago.find({
      idpension: element.idpension,
      tipo: element.tipo,
      estado: { $not: /Abono/ },
    });

    if (validExistente.length === 0) {
      const resultadoProcesamiento = await procesarDetallePago(
        element,
        config,
        pago,
        models,
        session
      );
      console.log("Resultado procesamiento: ", resultadoProcesamiento);
      if (resultadoProcesamiento) {
        const [dpago] = await Dpago.create(
          [elementoProcesado]
          //  { session }
        );
        dpagosValidos.push(dpago);
      }
    }
  }

  /*if (dpagosValidos.length > 0) {
    await Dpago.create(dpagosValidos, { session });
  }*/

  return dpagosValidos;
}

async function actualizarPagoTotal(pago, dpagosValidos, models, session) {
  const { Pago } = models;
  const sumaValores = dpagosValidos.reduce(
    (total, elemento) => total + elemento.valor,
    0
  );

  await Pago.updateOne(
    { _id: pago._id },
    { total_pagar: sumaValores }
    // { session }
  );
}

async function procesarDetallePago(element, config, pago, models, session) {
  try {
    switch (true) {
      case element.tipo === 0:
        return await procesarPagoMatricula(
          element,
          config,
          pago,
          models,
          session
        );
      case element.tipo > 0 && element.tipo <= 10:
        return await procesarPagoPension(
          element,
          config,
          pago,
          models,
          session
        );
      default:
        return await procesarPagoExtra(element, config, pago, models, session);
    }
  } catch (error) {
    console.error("Error procesando detalle de pago:", error);
    return false;
  }
}

async function procesarPagoMatricula(element, config, pago, models, session) {
  const { Pension, Dpago } = models;

  try {
    let mat = 0;
    if (element.valor === config.matricula) {
      mat = 1;
    } else {
      const abonos = await Dpago.find({
        estudiante: pago.estudiante,
        tipo: element.tipo,
      });
      const acu = abonos.reduce((total, abono) => total + abono.valor, 0);

      if (acu + element.valor === config.matricula) {
        mat = 1;
      }
    }

    await Pension.updateOne(
      { _id: element.idpension },
      { matricula: mat }
      //{ session }
    );
    return await actualizarStockDocumento(element, models, session);
  } catch (error) {
    console.error("Error en procesamiento de matrícula:", error);
    return false;
  }
}

async function procesarPagoPension(element, config, pago, models, session) {
  const { Pension, Pension_Beca, Dpago, Registro } = models;

  try {
    // Buscar la pensión
    const element_meses = await Pension.findById({ _id: element.idpension });
    let mes = element_meses.meses;

    // Verificar si aplica beca
    if (
      element_meses.condicion_beca === "Si" &&
      element_meses.num_mes_res > 0 &&
      element.valor <= element_meses.val_beca
    ) {
      let res_beca = element_meses.num_mes_res;

      // Lógica de procesamiento con beca
      if (element.valor === element_meses.val_beca) {
        mes += 1;
        res_beca -= 1;
      } else {
        // Calcular abonos previos
        const abonos = await Dpago.find({
          estudiante: pago.estudiante,
          tipo: element.tipo,
        });

        const acu = abonos.reduce(
          (total, abonoaux) => total + abonoaux.valor,
          0
        );

        // Verificar si completa el valor de la beca
        if (
          parseFloat(acu + element.valor) === parseFloat(element_meses.val_beca)
        ) {
          mes += 1;
          res_beca -= 1;
        }
      }

      // Actualizar pensión
      await Pension.updateOne(
        { _id: element.idpension },
        {
          meses: mes,
          num_mes_res: res_beca,
        }
        // { session }
      );

      // Marcar beca como usada
      await Pension_Beca.updateOne(
        { idpension: element.idpension, etiqueta: element.tipo },
        { usado: 1 }
        // { session }
      );
    } else {
      // Lógica de procesamiento sin beca
      if (element.valor === config.pension) {
        mes += 1;
      } else {
        // Calcular abonos previos
        const abonos = await Dpago.find({
          estudiante: pago.estudiante,
          tipo: element.tipo,
        });

        const acu = abonos.reduce(
          (total, abonoaux) => total + abonoaux.valor,
          0
        );

        // Verificar si completa el valor de la pensión
        if (parseFloat(acu + element.valor) === parseFloat(config.pension)) {
          mes += 1;
        }
      }

      // Actualizar pensión
      await Pension.updateOne(
        { _id: element.idpension },
        { meses: mes }
        // { session }
      );
    }

    return await actualizarStockDocumento(element, models, session);
  } catch (error) {
    console.error("Error en procesamiento de pensión:", error);
    return false;
  }
}

async function procesarPagoExtra(element, config, pago, models, session) {
  const { Pension, Registro, Config } = models;
  try {
    // Buscar pensión con configuración de año lectivo
    const pension_config = await Pension.findById({
      _id: element.idpension,
    }).populate("idanio_lectivo");

    // Parsear pagos extra del año lectivo
    const extrapagos = JSON.parse(
      pension_config.idanio_lectivo.extrapagos || "[]"
    );

    // Verificar si no es un abono
    if (!element.estado.includes("Abono")) {
      // Buscar el pago extra correspondiente
      const auxpago = extrapagos.find(
        (elementpago) => elementpago.idrubro === element.tipo
      );

      if (auxpago) {
        // Obtener pagos existentes de la pensión
        const pagospen = pension_config.extrapagos
          ? JSON.parse(pension_config.extrapagos)
          : [];

        // Agregar nuevo pago extra
        pagospen.push(auxpago);

        // Actualizar pensión con nuevos pagos extra
        await Pension.updateOne(
          { _id: element.idpension },
          { extrapagos: JSON.stringify(pagospen) }
          // { session }
        );
      }
    }

    return await actualizarStockDocumento(element, models, session);
  } catch (error) {
    console.error("Error en procesamiento de pago extra:", error);
    return false;
  }
}

async function actualizarStockDocumento(element, models, session) {
  const { Documento, Dpago, Registro } = models;
  //console.log("Elemento del documento: ", element);
  try {
    const documento = await Documento.findById(element.documento);
    if (!documento) {
      throw new Error("Documento no encontrado");
    }

    const pagosPrevios = await Dpago.find({ documento: documento._id });
    //console.log("Pagos previos: ", pagosPrevios);
    const totalPagado =
      pagosPrevios.reduce((total, pago) => total + pago.valor, 0) +
      element.valor;

    // Determinar el valor del documento
    let valorOriginal = parseFloat(documento.valor_origen || 0).toFixed(2);
    if (valorOriginal == 0) {
      try {
        // Obtener el valor original del documento desde `Registro`
        const registro = await Registro.findOne({
          tipo: "creo",
          descripcion: { $regex: documento.documento.toString() },
        });

        if (!registro) {
          throw new Error("Registro original no encontrado");
        }

        const descripcionParseada = JSON.parse(registro.descripcion);
        valorOriginal = parseFloat(descripcionParseada.valor).toFixed(2);
      } catch (error) {
        throw new Error("Error al parsear la descripción del registro");
      }
    }

    const nuevoStock = parseFloat((valorOriginal - totalPagado).toFixed(2));
    //console.log("Nuevo stock: ", nuevoStock, pagosPrevios.length);
    if (nuevoStock < 0) {
      throw new Error("El pago excede el stock disponible");
    }

    const result = await Documento.updateOne(
      { _id: documento._id },
      { valor: nuevoStock, npagos: pagosPrevios.length + 1 }
      //{ session }
    );
    //console.log(result);
    if (result.nModified == 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error actualizando stock del documento:", error);
    return false;
  }
}

async function actualizarStockTOTALES(conn) {
  const session1 = await mongoose.startSession();
  session1.startTransaction();
  const Documento = conn.model("document", DocumentoSchema);
  const Dpago = conn.model("dpago", DpagoSchema);
  const Registro = conn.model("registro", RegistroSchema);
  // Array para almacenar resultados de actualización
  const resultados = [];
  try {
    // Obtener documentos
    const documentos = await Documento.find();
    await Promise.all(
      documentos.map(async (documento) => {
        // Obtener el valor original del documento desde `Registro`
        const registro = await Registro.findOne({
          tipo: "creo",
          descripcion: { $regex: documento.documento.toString() },
        });
        if (!registro) {
          resultados.push({
            documento,
            success: false,
            message: "Registro original no encontrado",
          });
          return;
        }

        let valorOriginal = parseFloat(documento.valor_origen || 0).toFixed(2);
        if (valorOriginal == 0) {
          try {
            const descripcionParseada = JSON.parse(registro.descripcion);
            valorOriginal = parseFloat(descripcionParseada.valor).toFixed(2);
          } catch (error) {
            resultados.push({
              documento,
              success: false,
              message: "Error al parsear la descripción del registro",
            });
            return;
          }
        }

        // Encontrar todos los pagos relacionados con este documento
        const pagosPrevios = await Dpago.find({ documento: documento._id });

        // Calcular el total pagado
        const totalPagado = pagosPrevios.reduce(
          (total, pago) => total + Number(pago.valor),
          0
        );

        // Calcular nuevo stock
        const new_stock = Number((valorOriginal - totalPagado).toFixed(2));
        if (new_stock >= 0) {
          const resultado = await Documento.updateOne(
            { _id: documento._id },
            {
              valor: new_stock,
              npagos: pagosPrevios.length,
            },
            { session1 }
          );

          resultados.push({
            documento,
            success: true,
            newStock: new_stock,
            totalPagado: totalPagado,
            valorOriginal: valorOriginal,
            result: resultado,
          });
        } else {
          resultados.push({
            documento,
            success: false,
            message: "Stock insuficiente",
            newStock: new_stock,
            totalPagado: totalPagado,
            valorOriginal: valorOriginal,
          });
        }
      })
    );

    return resultados;
  } catch (error) {
    if (session1.inTransaction()) {
      try {
        await session1.abortTransaction();
      } catch (abortError) {
        console.error("Error al abortar la transacción:", abortError);
      }
    }
    console.error("Error en actualización de stock de documentos:", error);
    throw error;
  }
}
//PARA ENDPOINT
const actualizarStockDocumentos = async function (req, res) {
  const conn = mongoose.connection.useDb(req.body.base);
  try {
    if (typeof req.body.documentos === "string") {
      req.body.documentos = JSON.parse(req.body.documentos);
    }

    if (!Array.isArray(req.body.documentos)) {
      return res
        .status(400)
        .send({ message: "El campo 'documentos' debe ser un arreglo." });
    }

    const resultados = null; //await actualizarStockInterno(req.body.documentos, conn);
    res.status(200).send({ resultados });
  } catch (error) {
    console.error("Error en actualización de stock de documentos:", error);
    res.status(501).send({ error });
  }
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
          user: "pagos@egbfcristorey.edu.ec",
          pass: "nxewlthjhaqhqgqb",
        },
      })
    );

    var orden = await Pago.findById({ _id: pago }).populate("estudiante");
    var dventa = await Dventa.find({ venta: venta })
      .populate("producto")
      .populate("variedad");

    readHTMLFile(process.cwd() + "/mails/email_compra.html", (err, html) => {
      let rest_html = ejs.render(html, { orden: orden, dpago: dpago });

      var template = handlebars.compile(rest_html);
      var htmlToSend = template({ op: true });

      var mailOptions = {
        from: "pagos@egbfcristorey.edu.ec",
        to: orden.estudiante.email,
        subject: "Confirmación de pago " + orden._id,
        html: htmlToSend,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
          console.log("Email sent: " + info.response);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};
const mail_confirmar_envio = async function (pago) {
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
          user: "incorp.odoo1@gmail.com",
          pass: "vnixbyewlzmrqchw",
          //user: 'pagos@egbfcristorey.edu.ec',
          //pass: 'nxewlthjhaqhqgqb',
        },
      })
    );

    var orden = await Pago.findById({ _id: pago }).populate("estudiante");
    orden.currency = "USD";
    var dpago = await Dpago.find({ pago: pago }).populate("documento");

    readHTMLFile(process.cwd() + "/mails/email_enviado.html", (err, html) => {
      let rest_html = ejs.render(html, { orden: orden, dpago: dpago });

      var template = handlebars.compile(rest_html);
      var htmlToSend = template({ op: true });

      var mailOptions = {
        from: "pagos@egbfcristorey.edu.ec",
        to: orden.estudiante.email,
        subject: "Tu pago " + orden._id + " fué registrado",
        html: htmlToSend,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
          ////console.log('Email sent: ' + info.response);
        }
      });
    });
  } catch (error) {
    ////console.log(error);
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

    var orden = await Pago.findById({ _id: pago }).populate("estudiante");
    var dpago = await Dpago.find({ pago: pago }).populate("documento");

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
          console.log("Email sent: " + info.response);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};
const actualizar_firma_electronica = async function (req, res) {
  try {
    var data = req.body;
    var fact_arr = [];
    let conn = mongoose.connection.useDb(req.user.base);
    Factura = conn.model("facturacion", FacturaSchema);
    Registro = conn.model("registro", RegistroSchema);

    fact_arr = await Factura.find();
    if (fact_arr.length == 0) {
      bcrypt.hash(data.password_firma, null, null, async function (err, hash) {
        if (hash) {
          data.password_firma = hash;
          var img_path = req.files.portada.path;
          var name = img_path.split("/");
          var portada_name = name[2];
          data.archivo_firma = portada_name;

          var reg = await Factura.create(data);
          data.idadmin = req.user.sub;

          let registro = {};
          registro.admin = req.user.sub;
          registro.tipo = "Registro";
          registro.descripcion = JSON.stringify(data);

          await Registro.create(registro);

          res.status(200).send({ message: "Registrado con exito" });
        } else {
          res
            .status(200)
            .send({ message: "ErrorServer comuniquese con el administrador" });
        }
      });
    } else {
      bcrypt.hash(data.password_firma, null, null, async function (err, hash) {
        if (hash) {
          data.password_firma = hash;
          var img_path = req.files.portada.path;
          var name = img_path.split("/");
          var portada_name = name[2];
          data.archivo_firma = portada_name;

          var reg = await Factura.create(data);

          await Factura.updateOne(
            { _id: fact_arr[0]._id },
            {
              password_firma: data.password_firma,
              archivo_firma: data.archivo_firma,
            }
          );

          data.idadmin = req.user.sub;

          let registro = {};
          registro.admin = req.user.sub;
          registro.tipo = "Actualizo";
          registro.descripcion = JSON.stringify(data);

          await Registro.create(registro);

          res.status(200).send({ message: "Actualizado con exito" });
        } else {
          res
            .status(200)
            .send({ message: "ErrorServer comuniquese con el administrador" });
        }
      });
    }
  } catch (error) {
    res.status(200).send({ message: "Algo salio mal" });
  }
};

module.exports = {
  cambiar_base,
  actualizar_admininstitucion,
  actualizarInstitucion,
  listar_admininstitucion,
  obtener_portada,
  newpassword,
  forgotpassword,
  create_institucion,
  eliminar_finalizado_orden,
  login_admin,
  registro_documento_admin,
  listar_documentos_admin,
  obtener_documento_admin,
  actualizar_documento_admin,
  verificar_token,
  obtener_config_admin,
  actualizar_config_admin,
  obtener_pagos_admin,
  obtener_pagos_dash,
  obtener_detalles_ordenes_estudiante_abono,
  obtener_becas_conf,
  marcar_finalizado_orden,
  eliminar_orden_admin,
  registroCompraManualEstudiante,
  registro_admin,
  listar_admin,
  actualizar_admin,
  obtener_admin,
  eliminar_admin,
  eliminar_documento_admin,
  eliminar_estudiante_admin,
  reactivar_estudiante_admin,
  obtener_detallespagos_admin,
  obtener_detallespagos_pension_admin,
  listar_registro,
  obtener_detalles_ordenes_rubro,
  actualizar_firma_electronica,
  getDashboar_estudiante,
  actualizzas_dash,
  eliminar_orden_pm,

  obtener_info_admin,
  obtener_institucion,
  obtener_config_plana,
  actualizar_config_plana,
  crear_config_plana,
  actualizarStockDocumentos,
  //CONTIFICO
  actualizar_pago_id_contifico,

  verificarDeudasEstudiante,
};
