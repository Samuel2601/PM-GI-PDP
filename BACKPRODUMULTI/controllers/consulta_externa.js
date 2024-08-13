let Estudiante = require("../models/Estudiante");
let Pension_Beca = require("../models/Pension_Beca");
let Config = require("../models/Config");
let Factura = require("../models/Facturacion");
let Documento = require("../models/Documento");
let Pago = require("../models/Pago");
let Dpago = require("../models/Dpago");
let Pension = require("../models/Pension");
let Registro = require("../models/Registro");
let Admin = require("../models/Admin");
let AdminInstituto = require("../models/AdminInstituto");
let Institucion = require("../models/Institucion");
let Proveedor = require("../models/Proveedor");

const ConfigSchema = require("../models/Config");
const FacturaSchema = require("../models/Facturacion");
const AdminInstitutoSchema = require("../models/AdminInstituto");
const AdminSchema = require("../models/Admin");
const RegistroSchema = require("../models/Registro");
const VentaSchema = require("../models/Pago");
const PensionSchema = require("../models/Pension");
const EstudianteSchema = require("../models/Estudiante");
const DpagoSchema = require("../models/Dpago");
const Pension_becaSchema = require("../models/Pension_Beca");
const DocumentoSchema = require("../models/Documento");
const InstitucionSchema = require("../models/Institucion");
const ProveedorSchema = require("../models/Proveedor");

const ConfigPSchema = require("../models/Config_plana");
const mongoose = require("mongoose");
const SUCCESS_CODE = 200;
const ERROR_CODE = 500;
const NOFOUND_CODE = 500;
const PARTIAL_SUCCESS_CODE = 207;
const obtener_detallespagos_admin = async (id, base) => {
  try {
    const conn = mongoose.connection.useDb(base);
    Pago = conn.model("pago", VentaSchema);
    Pension = conn.model("pension", PensionSchema);
    Estudiante = conn.model("estudiante", EstudianteSchema);
    Documento = conn.model("document", DocumentoSchema);
    Dpago = conn.model("dpago", DpagoSchema);
    let detalle = [];
    let pagosd = [];

    if (id !== "null") {
      detalle = await Dpago.find().populate("idpension").populate("pago");
      pagosd = detalle.filter(
        (element) =>
          new Date(element.idpension.anio_lectivo).getTime() ===
          new Date(id).getTime()
      );
      return pagosd;
    } else {
      detalle = await Dpago.find().populate("idpension");
      return detalle;
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

const obtener_becas_conf = async (id, base) => {
  try {
    const conn = mongoose.connection.useDb(base);
    Pension = conn.model("pension", PensionSchema);
    Pension_Beca = conn.model("pension_beca", Pension_becaSchema);
    Config = conn.model("config", ConfigSchema);

    const pens2 = await Pension.find();
    const pens = pens2.filter((element) => element.idanio_lectivo === id);

    const becas = await Pension_Beca.find().populate("idpension");

    const becasconfig = becas.filter(
      (element) => element.idpension.idanio_lectivo === id
    );

    return becasconfig;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const listar_pensiones_estudiantes_tienda = async (id, base) => {
  const conn = mongoose.connection.useDb(base);
  Pension = conn.model("pension", PensionSchema);
  Estudiante = conn.model("estudiante", EstudianteSchema);
  const estudiantes = await Pension.find().populate("idestudiante");
  if (id !== "null") {
    const pen = estudiantes.filter(
      (element) =>
        new Date(element.anio_lectivo).getTime() === new Date(id).getTime()
    );
    return pen;
  } else {
    return estudiantes;
  }
};

const last_config = async (base) => {
  const conn = mongoose.connection.useDb(base);
  Config = conn.model("config", ConfigSchema);
  const ultimoConfig = await Config.findOne().sort({ createdAt: -1 });
  return ultimoConfig;
};

const armado_matriz = async () => {
  let pagos_estudiante = [];
  const config = await last_config("CRISTOREY");
  const estudiantes = await obtener_detallespagos_admin(
    config.anio_lectivo,
    "CRISTOREY"
  );
  const arr_becas = await obtener_becas_conf(config._id, "CRISTOREY");
  const penest = await listar_pensiones_estudiantes_tienda(
    config.anio_lectivo,
    "CRISTOREY"
  );
  let pagospension = [];
  const cursos = [];
  if (penest.length>0) {
    penest.forEach((element) => {
      let con = pagospension.findIndex(
        (pago) =>
          pago.curso + pago.paralelo === element.curso + element.paralelo
      );

      if (con === -1) {
        if (!cursos.includes(element.curso)) {
          cursos.push(element.curso);
        }

        pagospension.push({
          curso: element.curso,
          paralelo: element.paralelo,
          num: 0,
          data: [0, 0],
          genero: [0, 0, 0],
        });
      }
    });

    let detalles = estudiantes;
    let extrapa = [];
    if (config.extrapagos) {
      extrapa = JSON.parse(config.extrapagos);
    }
    const lentmeses = extrapa.length + 10;
    
    penest.forEach((elementpent) => {
      if (
        elementpent.idestudiante.estado !== "Desactivado" ||
        !elementpent.idestudiante.f_desac
      ) {
        let auxpagos = pagospension.find(
          (elementpp) =>
            elementpp.curso === elementpent.curso &&
            elementpp.paralelo === elementpent.paralelo
        );
        if (auxpagos) {
          if (elementpent.idestudiante.genero === "Masculino") {
            auxpagos.genero[0]++;
          } else if (elementpent.idestudiante.genero === "Femenino") {
            auxpagos.genero[1]++;
          } else {
            auxpagos.genero[2]++;
          }
          auxpagos.num += 1;

          let pagopension = [];
          for (let i = 0; i <= lentmeses; i++) {
            let valor = 0;
            let porpagar = 0;
            let tipo;

            if (i === 0) {
              if (
                elementpent.condicion_beca !== "Si" ||
                elementpent.paga_mat !== 1
              ) {
                porpagar = config.matricula;
                tipo = i;
                detalles.forEach((element) => {
                  if (
                    element.tipo === 0 &&
                    element.idpension._id.toString() ===
                      elementpent._id.toString()
                  ) {
                    valor += element.valor;
                    porpagar -= element.valor;
                  }
                });
                pagopension.push({
                  date: "Matricula",
                  valor: redondearNumeros(valor, 2),
                  tipo: tipo,
                  porpagar: redondearNumeros(porpagar, 2),
                });
                auxpagos.data[1] += redondearNumeros(porpagar, 2);
                auxpagos.data[0] += redondearNumeros(valor, 2);
              } else {
                pagopension.push({
                  date: "Matricula",
                  valor: 0,
                  tipo: 0,
                  porpagar: 0,
                });
              }
            } else if (i > 0 && i < 11) {
              tipo = i;
              if (elementpent.condicion_beca === "Si") {
                const beca = arr_becas.find(
                  (elementbecas) =>
                    elementbecas.idpension._id.toString() ===
                      elementpent._id.toString() &&
                    elementbecas.etiqueta === tipo.toString()
                );
                porpagar = beca ? elementpent.val_beca : config.pension;
              } else {
                porpagar = config.pension;
              }

              detalles.forEach((element) => {
                if (
                  element.tipo === tipo &&
                  element.idpension._id.toString() ===
                    elementpent._id.toString()
                ) {
                  valor += element.valor;
                  porpagar -= element.valor;
                }
              });
              pagopension.push({
                date: new Date(elementpent.anio_lectivo).setMonth(
                  new Date(elementpent.anio_lectivo).getMonth() + i - 1
                ),
                valor: redondearNumeros(valor, 2),
                tipo: tipo,
                porpagar: redondearNumeros(porpagar, 2),
              });
              auxpagos.data[1] += redondearNumeros(porpagar, 2);
              auxpagos.data[0] += redondearNumeros(valor, 2);
            } else {
              porpagar = extrapa[i - 11].valor;
              tipo = extrapa[i - 11].idrubro;

              detalles.forEach((element) => {
                if (
                  element.tipo === tipo &&
                  element.idpension._id.toString() ===
                    elementpent._id.toString()
                ) {
                  valor += element.valor;
                  porpagar -= element.valor;
                }
              });

              pagopension.push({
                date: extrapa[i - 11].descripcion,
                valor: redondearNumeros(valor, 2),
                tipo: tipo,
                porpagar: redondearNumeros(porpagar, 2),
              });
              auxpagos.data[1] += redondearNumeros(porpagar, 2);
              auxpagos.data[0] += redondearNumeros(valor, 2);
            }
          }
          const result = {
            nombres: `${elementpent.idestudiante.apellidos} ${elementpent.idestudiante.nombres}`,
            curso: elementpent.curso,
            paralelo: elementpent.paralelo,
            detalle: pagopension.slice(0, 11),
            rubro: pagopension.slice(11),
            estado: elementpent.idestudiante.estado,
            dni: elementpent.idestudiante.dni,
            email: elementpent.idestudiante.email,
          };
          pagos_estudiante[elementpent.curso] =
            pagos_estudiante[elementpent.curso] || {};
          pagos_estudiante[elementpent.curso][elementpent.paralelo] =
            pagos_estudiante[elementpent.curso][elementpent.paralelo] || [];
          pagos_estudiante[elementpent.curso][elementpent.paralelo].push(
            result
          );
        }
      }
    });
  }
  return pagos_estudiante;
};

function sumarcash(valores, mcash) {
  return valores
    .slice(0, mcash + 1)
    .reduce((suma, valor) => suma + valor.porpagar, 0);
}

function redondearNumeros(numero, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(numero * factor) / factor;
}
// Response structure
const response = {
  status: null, // Can be 'SUCCESS_CODE' or 'ERROR_CODE'
  data: null, // Response data
  message: null, // Descriptive message (optional)
  error: null, // Error details (optional)
};
function cloneResponse() {
  return { ...response };
}
const meses = new Array(
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
);
async function exportarcash(paralelo, mcash) {
  let response = cloneResponse();
  try {
    const json = [];
    const config = await last_config("CRISTOREY");
    const fbeca = config.createdAt;
    let j = 1;
    const pagos_estudiante = await armado_matriz();
    pagos_estudiante.forEach((element) => {
      for (const key in element) {
        if (Object.prototype.hasOwnProperty.call(element, key)) {
          const element3 = element[key];
          element3.forEach((element2) => {
            let con = sumarcash(element2.detalle, mcash);
            if (con > 0 && element2.estado !== "Desactivado") {
              con = parseFloat(con.toFixed(2)) * 100;
              const studen = {
                Item: j,
                Ref: "CO",
                Cedula: element2.dni,
                Modena: "USD",
                Valor: con,
                Ref1: "REC",
                Ref2: "",
                Ref3: "",
                Concepto:
                  "PENSION DE " +
                  meses[
                    new Date(
                      new Date(fbeca).setMonth(
                        new Date(fbeca).getMonth() + mcash
                      )
                    ).getMonth()
                  ],
                Ref4: "C",
                Cedula2: element2.dni,
                Alumno: element2.nombres,
              };
              if (paralelo) {
                studen.curso = element2.curso;
                studen.paralelo = element2.paralelo;
              }
              json.push(studen);
              j++;
            }
          });
        }
      }
    });

    response.status = SUCCESS_CODE;
    response.data = json;
    response.message = "Valores Calculados";
  } catch (error) {
    console.error(`Error: `, error);
    response.status = ERROR_CODE;
    response.message = "Error retrieving data";
    response.error = error.message;
  }
  return response;
}
var express = require("express");
const apiexport = express.Router();
apiexport.get("/exportarcash", async (req, res) => {
  const paralelo = req.query.paralelo;
  const mcash = parseInt(req.query.mcash, 10);
  const response = await exportarcash(paralelo, mcash);
  res.status(response.status).json(response);
});
module.exports = apiexport;
