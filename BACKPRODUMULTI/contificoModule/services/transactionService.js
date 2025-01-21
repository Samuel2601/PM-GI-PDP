// services/transactionService.js
var mongoose = require("mongoose");
const { makeRequest } = require("../helpers/requests.helper");
const InstitucionSchema = require("../../models/Institucion.js");
const { PRODUCTOS_BASE } = require("../seeds/product.seeds.js");
const VentaSchema = require("../../models/Pago.js");

// Document endpoints
const getDocuments = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/documento/",
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const getDocumentById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/`,
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const generate_num_documento = async (req, session) => {
  if (!req.institutionConfig.id_institucion) {
    throw new Error("No autorizado");
  }

  const conn = mongoose.connection.useDb("Instituciones");
  const Institucion = conn.model("instituto", InstitucionSchema);

  const institucion = await Institucion.findById(
    req.institutionConfig.id_institucion,
    null,
    {
      session,
    }
  );

  if (!institucion) {
    throw new Error(
      "Institución no encontrada: " + req.institutionConfig.id_institucion
    );
  }

  const prefijo =
    institucion.generacion_numero_comprobante || "000-000-000000000";
  const match = prefijo.match(/^(\d{3}-\d{3})-(\d{9})$/);

  if (!match) {
    throw new Error("Formato de generacion_numero_comprobante no válido");
  }

  const basePrefijo = match[1];
  const sufijo = parseInt(match[2], 10);
  const nuevoSufijo = String(sufijo + 1).padStart(9, "0");
  const nuevoNumeroComprobante = `${basePrefijo}-${nuevoSufijo}`;

  institucion.generacion_numero_comprobante = nuevoNumeroComprobante;
  await institucion.save({ session });

  return nuevoNumeroComprobante;
};

const updatePagoIdCont = async (req, id, idCont, session) => {
  // Añadido session como parámetro
  if (!req.institutionConfig.id_institucion) {
    throw new Error("No autorizado");
  }

  let conn = mongoose.connection.useDb("Instituciones");
  const Institucion = conn.model("instituto", InstitucionSchema);

  const institucion = await Institucion.findById(
    req.institutionConfig.id_institucion,
    null,
    { session }
  );

  if (!institucion) {
    throw new Error(
      "Institución no encontrada: " + req.institutionConfig.id_institucion
    );
  }

  const con = mongoose.connection.useDb(institucion.base); // Cambiado 'con =' a 'const con ='
  const Pago = con.model("pago", VentaSchema);
  const pago = await Pago.findById(id, null, { session });

  if (!pago) {
    throw new Error("Pago no encontrado: " + id);
  }

  pago.id_contifico = idCont;
  await pago.save({ session });
  return true;
};

const createDocument = async (req, documentData, idpago) => {
  try {
    const productos = await makeRequest(req, {
      path: "/producto/",
      method: "get",
    });

    const categorias = await makeRequest(req, {
      path: "/categoria/",
      method: "get",
    });

    // Cambiar forEach por Promise.all con map para manejar correctamente las promesas
    await Promise.all(
      documentData.detalles.map(async (element) => {
        if (!element.producto_id) {
          // Formatear el tipo con prefijo de ceros
          const tipoConPrefijo = "P" + element.tipo.toString().padStart(3, "0");
          let producto = productos.find(
            (producto) => producto.codigo === tipoConPrefijo
          );

          if (!producto) {
            const new_Producto = PRODUCTOS_BASE.find(
              (producto) => producto.codigo === tipoConPrefijo
            );
            if (!new_Producto) {
              throw new Error(
                `No se encontró producto base para tipo ${element.tipo}: ` +
                  JSON.stringify(new_Producto)
              );
            }
            new_Producto.categoria_id=categorias[0].id
            producto = await makeRequest(req, {
              path: "/producto/",
              method: "post",
              data: new_Producto,
            });
          }

          // Asignar el ID del producto encontrado o creado
          element.producto_id = producto.id;
        }
        delete element.tipo;
      })
    );
  } catch (error) {
    throw new Error(
      error.mensaje ||
        "Error desconocido al crear el PRODUCTO, " +
          " ERROR:" +
          JSON.stringify(error)
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    documentData.pos = req.institutionConfig.apitoken;
    documentData.documento = await generate_num_documento(req, session);

    const response = await makeRequest(req, {
      path: "/documento/",
      method: "post",
      data: documentData,
      post: true,
    });
    if (response.id) {
      await updatePagoIdCont(req, idpago, response.id, session);
    }
    await session.commitTransaction(); // Añadido: confirmar la transacción
    return response;
  } catch (error) {
    await session.abortTransaction();
    throw (
      error.response?.data ||
      new Error(error.message || "Error desconocido al crear el Documento")
    );
  } finally {
    session.endSession();
  }
};

const updateDocument = async (req, documentData) => {
  try {
    return await makeRequest(req, {
      path: "/documento/",
      method: "put",
      data: documentData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

// SRI Document Submission endpoint
const submitDocumentToSRI = async (req, id, sriData) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/sri/`,
      method: "put",
      data: sriData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

// Document Collection endpoints
const getDocumentCollections = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cobro/`,
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const createDocumentCollection = async (req, id, collectionData) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cobro/`,
      method: "post",
      data: collectionData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const deleteDocumentCollection = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cobro/`,
      method: "delete",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

// Document Cross-reference endpoints
const createDocumentCrossReference = async (req, id, crossRefData) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cruce/`,
      method: "post",
      data: crossRefData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const createDocumentAccountCrossReference = async (
  req,
  id,
  accountCrossRefData
) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cruce_cuenta/`,
      method: "post",
      data: accountCrossRefData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

// Retention endpoint
const getDocumentRetention = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/retencion/`,
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

// Transaction endpoints
const getTransactions = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/registro/transaccion/",
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const getTransactionById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/registro/transaccion/${id}/`,
      method: "get",
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

module.exports = {
  // Documents
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,

  // SRI Submission
  submitDocumentToSRI,

  // Collections
  getDocumentCollections,
  createDocumentCollection,
  deleteDocumentCollection,

  // Cross-references
  createDocumentCrossReference,
  createDocumentAccountCrossReference,

  // Retention
  getDocumentRetention,

  // Transactions
  getTransactions,
  getTransactionById,
};
