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

const axios = require("axios");

var mongoose = require("mongoose");

const modelsService = require("../service/models.service");

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Estudiante } = models;

    var estudiantes = await Estudiante.find().sort({ createdAt: -1 });
    res.status(200).send({ data: estudiantes });
  } else {
    res.status(500).send({ message: "NoAccess" });
  }
};
const listar_pensiones_estudiantes_tienda = async function (req, res) {
  if (!req.user) {
    return res.status(403).send({ message: "NoAccess" });
  }

  try {
    let id = req.params["id"];
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Pension, Estudiante, Config } = models;

    // Obtener estudiantes y pensiones
    const estudiantes = await Estudiante.find().lean();
    const pensiones = await Pension.find().populate("idestudiante").lean();

    // Crear un Set con los IDs de estudiantes que tienen pensión
    const estudiantesConPension = new Set(
      pensiones
        .filter((p) => p.idestudiante) // Filtrar pensiones con estudiante válido
        .map((p) => p.idestudiante._id.toString())
    );

    // Encontrar estudiantes sin pensión
    const estudiantesSinPension = estudiantes.filter(
      (est) => !estudiantesConPension.has(est._id.toString())
    );

    // Mostrar información detallada de estudiantes sin pensión
    if (estudiantesSinPension.length > 0) {
      /* console.log("=============== ESTUDIANTES SIN PENSIÓN ===============");
      estudiantesSinPension.forEach((est) => {
        console.log({
          _id: est._id,
          nombres: est.nombres,
          dni: est.dni,
          curso: est.curso,
          paralelo: est.paralelo,
          estado: est.estado,
          createdAt: est.createdAt,
        });
      });
      console.log("====================================================");
      console.log(
        `Total estudiantes sin pensión: ${estudiantesSinPension.length}`
      );
      console.log(`Total estudiantes: ${estudiantes.length}`);
      console.log(`Total pensiones: ${pensiones.length}`);*/
    }

    // Proceder con el resto de la lógica original...
    const config = await Config.findById(id);
    if (!config) {
      return res.status(200).send({
        data: pensiones,
        estudiantes_sin_pension: estudiantesSinPension,
      });
    }

    let pen = pensiones.filter((element) => {
      return (
        new Date(element.anio_lectivo).getTime() ===
          new Date(config.anio_lectivo).getTime() ||
        element.idanio_lectivo.toString() === config._id.toString()
      );
    });

    res.status(200).send({
      data: pen,
      estudiantes_sin_pension: estudiantesSinPension,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Error en el servidor" });
  }
};

const listar_documentos_nuevos_publico = async function (req, res) {
  /*let reg = await Producto.find({estado: 'Publicado'}).sort({createdAt:-1}).limit(8);
    res.status(200).send({data: reg});*/
};

/**
 * Controlador para el registro de estudiantes
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
const registro_estudiante = async (req, res) => {
  // Verificar autenticación
  if (!req.user) {
    return res.status(401).json({ message: "No tiene acceso" });
  }

  // Inicializar la sesión de MongoDB para transacciones
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Inicializar modelos en la base de datos del usuario
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
    const { Estudiante, Pension, Pension_Beca, Config } = models;

    // Obtener datos de la solicitud
    const data = req.body;

    // Validar que existan datos
    if (!data) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "No se recibieron datos" });
    }

    // Verificar si el estudiante ya existe por su DNI
    const estudianteExistente = await Estudiante.findOne({
      dni: data.dni,
    }).session(session);
    if (estudianteExistente) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "El número de cédula ya existe en la base de datos",
        data: estudianteExistente,
      });
    }

    // Determinar el curso y paralelo más reciente
    let cursoMasReciente = 0;
    let paraleloAsociado = "";

    for (const pension of data.pensiones) {
      if (pension.curso > cursoMasReciente) {
        cursoMasReciente = pension.curso;
        paraleloAsociado = pension.paralelo;
      }
    }

    // Actualizar datos del estudiante con el curso más reciente
    const datosEstudiante = {
      ...data,
      curso: cursoMasReciente,
      paralelo: paraleloAsociado,
      especialidad: data.especialidad || "EGB",
    };

    // Crear el estudiante dentro de la sesión
    const estudianteRegistrado = await Estudiante.create([datosEstudiante], {
      session,
    });
    const nuevoEstudiante = estudianteRegistrado[0]; // Obtener el documento creado

    // Registrar las pensiones asociadas
    for (const item of data.pensiones) {
      // Crear objeto de pensión con datos validados
      const pensionData = {
        idestudiante: nuevoEstudiante._id,
        paga_mat: item.matricula,
        anio_lectivo: item.anio_lectivo.anio_lectivo,
        idanio_lectivo: item.anio_lectivo._id,
        condicion_beca: item.condicion_beca,
        val_beca: item.val_beca,
        num_mes_beca: item.arr_etiquetas?.length || 0,
        num_mes_res: item.arr_etiquetas?.length || 0,
        desc_beca: item.desc_beca,
        matricula: item.matricula,
        curso: item.curso,
        paralelo: item.paralelo,
        especialidad: data.especialidad || "EGB",
      };

      // Crear registro de pensión dentro de la sesión
      const [pensionRegistrada] = await Pension.create([pensionData], {
        session,
      });

      // Registrar detalles de beca si existen
      if (item.arr_etiquetas && item.arr_etiquetas.length > 0) {
        for (const detalle of item.arr_etiquetas) {
          await Pension_Beca.create(
            [
              {
                ...detalle,
                idpension: pensionRegistrada._id,
              },
            ],
            { session }
          );
        }
      }
    }

    // Confirmar la transacción
    await session.commitTransaction();
    session.endSession();

    // Responder con éxito
    return res.status(201).json({
      success: true,
      message: "Estudiante registrado con éxito",
      data: nuevoEstudiante,
    });
  } catch (error) {
    // Revertir cambios en caso de error
    await session.abortTransaction();
    session.endSession();

    console.error("Error en registro de estudiante:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//INICIO DE REGISTRAR ESTUDIANTE MASIVO
const registro_estudiante_masivo = async (req, res) => {
  if (!req.user) {
    return res.status(403).send({ message: "No Access" });
  }

  try {
    const { body: estudiantes } = req;
    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(200).send({
        s: 0,
        r: 0,
        rc: 0,
        e: 0,
        ev: -999,
      });
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
    const { Config, Pension, Estudiante } = models;

    const config = await Config.findOne().sort({ createdAt: -1 });
    if (!config) {
      throw new Error("No se encontró configuración activa");
    }

    const stats = {
      subidos: 0,
      resubidos: 0,
      resubidosc: 0,
      errorneos: 0,
      errorv: 0,
    };

    // Procesamos los estudiantes de forma secuencial para evitar problemas de concurrencia
    for (const estudiante of estudiantes) {
      await procesarEstudiante(estudiante, {
        Estudiante,
        Pension,
        config,
        stats,
      });
    }

    return res.status(200).send({
      s: stats.subidos,
      r: stats.resubidos,
      rc: stats.resubidosc,
      e: stats.errorneos,
      ev: stats.errorv,
    });
  } catch (error) {
    console.error("Error en registro masivo:", error);
    return res.status(500).send({
      message: "Error en el procesamiento",
      error: error.message,
    });
  }
};

async function procesarEstudiante(
  datos,
  { Estudiante, Pension, config, stats }
) {
  try {
    // Normalizamos los datos del estudiante
    const estudianteNormalizado = normalizarDatosEstudiante(datos);

    // Verificamos si el estudiante existe
    const [estudianteExistente] = await Promise.all([
      Estudiante.findOne({ dni: datos.dni }),
      Estudiante.findOne({
        nombres: datos.nombres,
        apellidos: datos.apellidos,
      }),
    ]);

    if (!estudianteExistente) {
      await crearNuevoEstudiante(estudianteNormalizado, {
        Estudiante,
        Pension,
        config,
        stats,
      });
    } else if (estudianteExistente.estado === "Desactivado") {
      await reactivarEstudiante(estudianteExistente, estudianteNormalizado, {
        Estudiante,
        Pension,
        config,
        stats,
      });
    } else {
      stats.errorneos++;
    }
  } catch (error) {
    console.error("Error procesando estudiante:", datos.dni, error);
    stats.errorv++;
  }
}

function normalizarDatosEstudiante(datos) {
  const normalizado = { ...datos };

  // Normalizamos datos básicos
  normalizado.password = datos.password || datos.dni;
  normalizado.genero = ["Masculino", "Femenino"].includes(datos.genero)
    ? datos.genero
    : "No definido";
  normalizado.especialidad = datos.especialidad || "EGB";

  // Normalizamos datos de facturación
  if (datos.dni_factura === undefined && datos.dni_padre) {
    normalizado.dni_factura = datos.dni_padre;
    normalizado.nombres_factura = datos.nombres_padre;
  }
  if (datos.dni_padre === undefined && datos.dni_factura) {
    normalizado.dni_padre = datos.dni_factura;
    normalizado.nombres_padre = datos.nombres_factura;
  }

  return normalizado;
}

function generateSalt(saltRounds) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return reject(err);
      resolve(salt);
    });
  });
}

function hashPassword(data, salt) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(data, salt, null, (err, hashed) => {
      if (err) return reject(err);
      resolve(hashed);
    });
  });
}

async function crearNuevoEstudiante(
  datos,
  { Estudiante, Pension, config, stats }
) {
  // Encriptamos la contraseña
  // Genera el salt y luego encripta la contraseña
  const salt = await generateSalt(10);
  const password = await hashPassword(datos.password, salt);

  // Creamos el estudiante
  const estudiante = await Estudiante.create({
    ...datos,
    password,
  });

  // Creamos la pensión asociada
  await Pension.create({
    idestudiante: estudiante._id,
    anio_lectivo: config.anio_lectivo,
    idanio_lectivo: config._id,
    paga_mat: datos.paga_mat,
    condicion_beca: datos.condicion_beca,
    val_beca: datos.val_beca,
    num_mes_beca: datos.num_mes_beca,
    num_mes_res: datos.num_mes_beca,
    desc_beca: datos.desc_beca,
    matricula: datos.matricula,
    curso: datos.curso,
    paralelo: datos.paralelo,
    especialidad: datos.especialidad,
  });

  stats.subidos++;
}

async function reactivarEstudiante(
  estudianteExistente,
  datosNuevos,
  { Estudiante, Pension, config, stats }
) {
  // Actualizamos el estudiante
  await Estudiante.updateOne(
    { _id: estudianteExistente._id },
    {
      estado: "Activo",
      ...datosNuevos,
    }
  );

  // Buscamos si tiene pensión en el año lectivo actual
  const pensionExistente = await Pension.findOne({
    idestudiante: estudianteExistente._id,
    anio_lectivo: config.anio_lectivo,
  });

  if (!pensionExistente) {
    // Creamos nueva pensión
    await Pension.create({
      idestudiante: estudianteExistente._id,
      anio_lectivo: config.anio_lectivo,
      idanio_lectivo: config._id,
      paga_mat: datosNuevos.paga_mat,
      condicion_beca: datosNuevos.condicion_beca,
      val_beca: datosNuevos.val_beca,
      num_mes_beca: datosNuevos.num_mes_beca,
      num_mes_res: datosNuevos.num_mes_beca,
      desc_beca: datosNuevos.desc_beca,
      matricula: datosNuevos.matricula,
      curso: datosNuevos.curso,
      paralelo: datosNuevos.paralelo,
      especialidad: datosNuevos.especialidad,
    });
    stats.resubidos++;
  } else {
    // Actualizamos pensión existente
    await Pension.updateOne(
      { _id: pensionExistente._id },
      {
        paga_mat: datosNuevos.paga_mat,
        curso: datosNuevos.curso,
        paralelo: datosNuevos.paralelo,
        especialidad: datosNuevos.especialidad,
      }
    );
    stats.resubidosc++;
  }
}
//FIN DE REGISTRAR ESTUDIANTE

//INICIO BORRAR MASIVO
const borrado_estudiante_masivo = async (req, res) => {
  if (!req.user) {
    return res.status(403).send({ message: "No Access" });
  }

  try {
    const { body: estudiantes } = req;
    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(200).send({
        d: 0, // eliminados
        e: 0, // errores
        ev: 0, // errores de validación
      });
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
    const { Estudiante, Pension } = models;

    const stats = {
      eliminados: 0,
      errores: 0,
      errorv: 0,
    };

    // Procesamos los estudiantes de forma secuencial
    for (const estudiante of estudiantes) {
      await procesarBorradoEstudiante(estudiante, {
        Estudiante,
        Pension,
        stats,
      });
    }

    return res.status(200).send({
      d: stats.eliminados,
      e: stats.errores,
      ev: stats.errorv,
    });
  } catch (error) {
    console.error("Error en borrado masivo:", error);
    return res.status(500).send({
      message: "Error en el procesamiento",
      error: error.message,
    });
  }
};

async function procesarBorradoEstudiante(
  datos,
  { Estudiante, Pension, stats }
) {
  try {
    // Verificamos si el estudiante existe por DNI o nombre completo
    const estudianteExistente = await Estudiante.findOne({
      $or: [
        { dni: datos.dni },
        {
          nombres: datos.nombres,
          apellidos: datos.apellidos,
        },
      ],
    });

    if (!estudianteExistente) {
      stats.errores++;
      return;
    }

    // Primero eliminamos todas las pensiones asociadas
    try {
      await Pension.deleteMany({ idestudiante: estudianteExistente._id });
    } catch (errorPension) {
      console.error("Error eliminando pensiones:", errorPension);
      stats.errorv++;
      return;
    }

    // Luego eliminamos el estudiante
    try {
      await Estudiante.deleteOne({ _id: estudianteExistente._id });
      stats.eliminados++;
    } catch (errorEstudiante) {
      console.error("Error eliminando estudiante:", errorEstudiante);
      stats.errorv++;
      return;
    }
  } catch (error) {
    console.error("Error procesando borrado de estudiante:", datos.dni, error);
    stats.errorv++;
  }
}
//FIN DE BORRAR MASIVO

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Estudiante } = models;

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Pension, Config } = models;

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

/**
 * Controlador para actualizar información de estudiante (versión administrador)
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @returns {Promise<void>}
 */
const actualizar_estudiante_admin = async function (req, res) {
  // Validar autenticación
  if (!req.user) {
    return res.status(403).json({ message: "NoAccess" });
  }

  // Iniciar sesión de MongoDB para transacciones
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Inicializar modelos en la base de datos del usuario
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
    const { Estudiante, Config, Pension, Pension_Beca } = models;

    // Obtener ID y datos del estudiante
    const id = req.params["id"];
    const data = req.body;

    if (!id || !data) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Datos incompletos" });
    }

    // 1. Actualizar información básica del estudiante
    const datosEstudiante = {
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefono: data.telefono,
      genero: data.genero,
      email: data.email,
      dni: data.dni,
      curso: data.curso,
      paralelo: data.paralelo,
      especialidad: data.especialidad || "EGB",
      estado: data.estado,
      nombres_padre: data.nombres_padre,
      email_padre: data.email_padre,
      dni_padre: data.dni_padre,
      nombres_factura: data.nombres_factura,
      dni_factura: data.dni_factura,
      direccion: data.direccion,
    };

    // Si existe id_contifico_persona, agregarlo
    if (data.id_contifico_persona) {
      datosEstudiante.id_contifico_persona = data.id_contifico_persona;
    }

    // Actualizar datos básicos del estudiante
    await Estudiante.updateOne({ _id: id }, datosEstudiante, { session });

    // Buscar el estudiante actualizado
    const estudianteActualizado = await Estudiante.findOne({ _id: id }).session(
      session
    );

    if (!estudianteActualizado) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    }

    // 2. Actualizar contraseña si se proporciona
    if (data.password && data.password.trim() !== "") {
      const hash = bcrypt.hashSync(data.password, 10);
      await Estudiante.updateOne({ _id: id }, { password: hash }, { session });
    }

    // 3. Gestionar la pensión
    // Obtener la configuración más reciente
    const config = await Config.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    if (!config) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "No hay configuración disponible" });
    }

    // Buscar pensión usando el ID del año lectivo proporcionado
    let pension = null;

    // Primero buscar con el ID proporcionado por el cliente
    if (data.idanio_lectivo && data.idanio_lectivo._id) {
      pension = await Pension.findOne({
        idestudiante: id,
        idanio_lectivo: data.idanio_lectivo._id,
      }).session(session);
    }

    // Si no se encuentra, buscar con el ID de la configuración actual
    if (!pension) {
      pension = await Pension.findOne({
        idestudiante: id,
        idanio_lectivo: config._id,
      }).session(session);
    }

    // Si no existe pensión, crearla
    if (!pension) {
      const nuevaPension = {
        idestudiante: estudianteActualizado._id,
        anio_lectivo: data.anio_lectivo || config.anio_lectivo,
        idanio_lectivo:
          data.idanio_lectivo && data.idanio_lectivo._id
            ? data.idanio_lectivo._id
            : config._id,
        paga_mat: data.paga_mat || 0,
        condicion_beca: data.condicion_beca || "No",
        val_beca: data.val_beca || 0,
        num_mes_beca: data.num_mes_beca || 0,
        num_mes_res: data.num_mes_res || 0,
        desc_beca: data.desc_beca || 0,
        matricula: data.matricula || 0,
        curso: data.curso,
        paralelo: data.paralelo,
        especialidad: data.especialidad || "EGB",
        meses: data.meses || 0,
      };

      const [pensionCreada] = await Pension.create([nuevaPension], { session });
      pension = pensionCreada;
    }
    // Si existe, actualizarla
    else {
      // Preparar datos de actualización de la pensión
      const actualizacionPension = {
        curso: data.curso,
        paralelo: data.paralelo,
        especialidad: data.especialidad || "EGB",
      };

      // Si hay información de beca, actualizarla
      if (data.condicion_beca === "Si") {
        // Calcular cambio en número de meses con beca
        const mesesBecaAnterior = pension.num_mes_beca || 0;
        const mesesBecaNuevo = data.num_mes_beca || 0;
        const diferenciaMeses = mesesBecaAnterior - mesesBecaNuevo;
        const nuevosMesesRestantes = pension.num_mes_res || 0;

        // Actualizar el número de meses restantes según la diferencia
        let mesesRestantesActualizados;
        if (diferenciaMeses <= 0) {
          // Si aumentamos meses o queda igual
          mesesRestantesActualizados = nuevosMesesRestantes - diferenciaMeses;
        } else {
          // Si reducimos meses, verificar consistencia
          if (nuevosMesesRestantes - diferenciaMeses < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message:
                "Error de consistencia: el número de meses con becas usados es mayor a los meses asignados",
            });
          }
          mesesRestantesActualizados = nuevosMesesRestantes - diferenciaMeses;
        }

        // Completar datos de actualización para beca
        Object.assign(actualizacionPension, {
          paga_mat: data.paga_mat || 0,
          matricula: data.matricula || 0,
          condicion_beca: "Si",
          desc_beca: data.desc_beca || 0,
          val_beca: data.val_beca || 0,
          num_mes_beca: mesesBecaNuevo,
          num_mes_res: mesesRestantesActualizados,
        });

        // Actualizar pensión
        await Pension.updateOne({ _id: pension._id }, actualizacionPension, {
          session,
        });

        // Manejar detalles de beca si existen
        if (data.pension_beca && Array.isArray(data.pension_beca)) {
          // Eliminar detalles antiguos
          await Pension_Beca.deleteMany(
            { idpension: pension._id },
            { session }
          );

          // Crear nuevos detalles
          for (const detalle of data.pension_beca) {
            const detalleCompleto = {
              ...detalle,
              idpension: pension._id,
            };
            await Pension_Beca.create([detalleCompleto], { session });
          }
        }
      }
      // Si no tiene beca, solo actualizar campos básicos
      else {
        await Pension.updateOne({ _id: pension._id }, actualizacionPension, {
          session,
        });
      }
    }

    // Confirmar transacción
    await session.commitTransaction();
    session.endSession();

    // Responder con éxito
    return res.status(200).json({
      success: true,
      message: "Estudiante actualizado con éxito",
      data: estudianteActualizado,
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await session.abortTransaction();
    session.endSession();

    console.error("Error en actualización de estudiante:", error);
    return res.status(500).json({
      success: false,
      message: "Error en la actualización del estudiante",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//---METODOS PUBLICOS----------------------------------------------------

const obtener_ordenes_estudiante = async function (req, res) {
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
    const { Pago } = models;

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Admin, Pago, Estudiante, Documento, Pension, Dpago } = models;

    /*Facturacion = conn.model("facturacion", FacturacionSchema);
    ctacon = await Facturacion.find({});*/

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

// Generar documento con nuevo proveedor
const generarDocumentoNuevoProveedor = async function (req, res) {
  if (req.user) {
    try {
      const dbName = req.user.base;
      const { id } = req.params;
      //const fecha = req.body?.fecha || new Date();

      // Obtener los modelos para esta base de datos
      const models = modelsService.getModels(dbName);

      if (!models) {
        return res.status(500).send({
          success: false,
          message: `No se pudieron cargar los modelos para la base ${dbName}`,
        });
      }

      // Usar los modelos ya inicializados
      const { Pago, Dpago, Config } = models;

      // Obtener pago y detalles
      const pago = await Pago.findById(id)
        .populate("estudiante")
        .populate("encargado");

      if (!pago) {
        return res.status(404).send({
          success: false,
          message: "No se encontró el pago",
        });
      }

      const detalles = await Dpago.find({ pago: pago._id }).populate([
        { path: "documento" },
        {
          path: "idpension",
          populate: {
            path: "idanio_lectivo",
          },
        },
      ]);

      // Generar documento usando el servicio
      const documento = await facturacionService.generarDocumentoNuevoProveedor(
        pago,
        detalles
      );
      console.log("Documento generado", documento);
      // Enviar documento al servicio externo
      const respuestaAPI = await enviarDocumentoAPI(documento);

      // Actualizar el pago con el ID del documento generado
      if (respuestaAPI && respuestaAPI.IdComprobante) {
        await Pago.findByIdAndUpdate(pago._id, {
          id_contifico: respuestaAPI.IdComprobante.toString(),
        });
      }

      res.status(200).send({
        success: true,
        message: "Documento generado correctamente",
        data: respuestaAPI,
      });
    } catch (error) {
      console.error("Error al generar documento:", error);
      res.status(500).send({
        success: false,
        message: "Error al generar documento",
        error: error.message,
      });
    }
  } else {
    res.status(403).send({ success: false, message: "NoAccess" });
  }
};

// Función para enviar el documento al servicio externo
const enviarDocumentoAPI = async (documento) => {
  try {
    // Configurar la llamada a la API externa
    const apiUrl =
      "https://plataforma.geoneg.com:8081/api/Invoice/GuardarComprobantesAPI";
    //const apiKey = process.env.FACTURACION_API_KEY;

    const response = await axios.post(apiUrl, documento, {
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al enviar documento a API externa:", error);
    throw new Error(`Error en API externa: ${error.message}`);
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
const facturacionService = require("../service/geoneg/facturacion.service");
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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Pago, Dpago } = models;

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Pago } = models;

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
    const dbName = req.user.base;

    // Obtener los modelos para esta base de datos
    const models = modelsService.getModels(dbName);

    if (!models) {
      throw new Error(
        `No se pudieron cargar los modelos para la base ${dbName}`
      );
    }

    // Usar los modelos ya inicializados
    const { Estudiante } = models;

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
  borrado_estudiante_masivo,
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
  generarDocumentoNuevoProveedor,
};
//comentario 2
//Comentario de prueba
//Comentario ultimo actualizado
