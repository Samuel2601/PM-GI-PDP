// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionService = require("../services/transactionService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig");

// Middleware para manejar errores asíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// **Rutas para Documentos**
// Obtener todos los documentos
router.get(
  "/documento",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    console.log("Documentos");
    const documents = await transactionService.getDocuments(req);
    res.json(documents);
  })
);

// Obtener un documento por ID
router.get(
  "/documento/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await transactionService.getDocumentById(req, id);
    res.json(document);
  })
);

// Crear un nuevo documento
router.post(
  "/documento/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const documentData = req.body;
    const newDocument = await transactionService.createDocument(
      req,
      documentData,
      id
    );
    res.status(201).json(newDocument);
  })
);

// Actualizar un documento existente
router.put(
  "/documento",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const documentData = req.body;
    const updatedDocument = await transactionService.updateDocument(
      req,
      documentData
    );
    res.json(updatedDocument);
  })
);

// Enviar un documento al SRI
router.put(
  "/documento/:id/sri",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sriData = req.body;
    const response = await transactionService.submitDocumentToSRI(
      req,
      id,
      sriData
    );
    res.json(response);
  })
);

// **Rutas para Cobros**
// Obtener todas las colecciones de un documento
router.get(
  "/documento/:id/cobro",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collections = await transactionService.getDocumentCollections(
      req,
      id
    );
    res.json(collections);
  })
);

// Crear una colección para un documento
router.post(
  "/documento/:id/cobro",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collectionData = req.body;
    const response = await transactionService.createDocumentCollection(
      req,
      id,
      collectionData
    );
    res.status(201).json(response);
  })
);

// Eliminar una colección de un documento
router.delete(
  "/documento/:id/cobro",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await transactionService.deleteDocumentCollection(req, id);
    res.json(response);
  })
);

// **Rutas para Retenciones**
// Obtener retenciones de un documento
router.get(
  "/documento/:id/retencion",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const retention = await transactionService.getDocumentRetention(req, id);
    res.json(retention);
  })
);

// **Rutas para Transacciones**
// Obtener todas las transacciones
router.get(
  "/transaccion",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const transactions = await transactionService.getTransactions(req);
    res.json(transactions);
  })
);

// Obtener una transacción por ID
router.get(
  "/transaccion/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(req, id);
    res.json(transaction);
  })
);

module.exports = router;
