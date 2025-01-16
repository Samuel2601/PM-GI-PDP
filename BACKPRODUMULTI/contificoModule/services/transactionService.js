// services/transactionService.js
const { makeRequest } = require("../helpers/requests.helper");

// Document endpoints
const getDocuments = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/documento/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching documents: ${error.response?.data || error.message}`
    );
  }
};

const getDocumentById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching document with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createDocument = async (req, documentData) => {
  try {
    return await makeRequest(req, {
      path: "/documento/",
      method: "post",
      data: documentData,
    });
  } catch (error) {
    throw new Error(
      `Error creating document: ${error.response?.data || error.message}`
    );
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
    throw new Error(
      `Error updating document: ${error.response?.data || error.message}`
    );
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
    throw new Error(
      `Error submitting document ${id} to SRI: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error fetching collections for document ${id}: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error creating collection for document ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const deleteDocumentCollection = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/documento/${id}/cobro/`,
      method: "delete",
    });
  } catch (error) {
    throw new Error(
      `Error deleting collection for document ${id}: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error creating cross-reference for document ${id}: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error creating account cross-reference for document ${id}: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error fetching retention for document ${id}: ${
        error.response?.data || error.message
      }`
    );
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
    throw new Error(
      `Error fetching transactions: ${error.response?.data || error.message}`
    );
  }
};

const getTransactionById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/registro/transaccion/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching transaction with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
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
