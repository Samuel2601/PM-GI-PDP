// services/transactionService.js
const httpClient = require('./httpClient');

// Document endpoints
const getDocuments = async () => {
  try {
    const response = await httpClient.get('/documento/');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching documents: ${error.response?.data || error.message}`);
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await httpClient.get(`/documento/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching document with ID ${id}: ${error.response?.data || error.message}`);
  }
};

const createDocument = async (documentData) => {
  try {
    const response = await httpClient.post('/documento/', documentData);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating document: ${error.response?.data || error.message}`);
  }
};

const updateDocument = async (documentData) => {
  try {
    const response = await httpClient.put('/documento/', documentData);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating document: ${error.response?.data || error.message}`);
  }
};

// SRI Document Submission endpoint
const submitDocumentToSRI = async (id, sriData) => {
  try {
    const response = await httpClient.put(`/documento/${id}/sri/`, sriData);
    return response.data;
  } catch (error) {
    throw new Error(`Error submitting document ${id} to SRI: ${error.response?.data || error.message}`);
  }
};

// Document Collection endpoints
const getDocumentCollections = async (id) => {
  try {
    const response = await httpClient.get(`/documento/${id}/cobro/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching collections for document ${id}: ${error.response?.data || error.message}`);
  }
};

const createDocumentCollection = async (id, collectionData) => {
  try {
    const response = await httpClient.post(`/documento/${id}/cobro/`, collectionData);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating collection for document ${id}: ${error.response?.data || error.message}`);
  }
};

const deleteDocumentCollection = async (id) => {
  try {
    const response = await httpClient.delete(`/documento/${id}/cobro/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting collection for document ${id}: ${error.response?.data || error.message}`);
  }
};

// Document Cross-reference endpoints
const createDocumentCrossReference = async (id, crossRefData) => {
  try {
    const response = await httpClient.post(`/documento/${id}/cruce/`, crossRefData);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating cross-reference for document ${id}: ${error.response?.data || error.message}`);
  }
};

const createDocumentAccountCrossReference = async (id, accountCrossRefData) => {
  try {
    const response = await httpClient.post(`/documento/${id}/cruce_cuenta/`, accountCrossRefData);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating account cross-reference for document ${id}: ${error.response?.data || error.message}`);
  }
};

// Retention endpoint
const getDocumentRetention = async (id) => {
  try {
    const response = await httpClient.get(`/documento/${id}/retencion/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching retention for document ${id}: ${error.response?.data || error.message}`);
  }
};

// Transaction endpoints
const getTransactions = async () => {
  try {
    const response = await httpClient.get('/registro/transaccion/');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching transactions: ${error.response?.data || error.message}`);
  }
};

const getTransactionById = async (id) => {
  try {
    const response = await httpClient.get(`/registro/transaccion/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching transaction with ID ${id}: ${error.response?.data || error.message}`);
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