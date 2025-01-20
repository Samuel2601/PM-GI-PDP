// services/transactionService.js
var mongoose = require("mongoose");
const { makeRequest } = require("../helpers/requests.helper");
const InstitucionSchema = require("../../models/Institucion");

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
    throw new Error("Institución no encontrada: " + req.institutionConfig.id_institucion);
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

const createDocument = async (req, documentData) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción

  try {
    documentData.pos = req.institutionConfig.apitoken;
    documentData.documento = await generate_num_documento(req, session);   
    
    const response = await makeRequest(req, {
      path: "/documento/",
      method: "post",
      data: documentData,
      post: true
    });

    // Si makeRequest falla, la transacción se revertirá automáticamente
    return response;
  } catch (error) {
    await session.abortTransaction(); // Revierte la transacción si algo falla
    session.endSession();

    if (error.response?.data) {
      throw error.response.data;
    }
    console.error("Error en la creación del Documento:", error);
    throw new Error(error.mensaje || "Error desconocido al crear la Documento");
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
