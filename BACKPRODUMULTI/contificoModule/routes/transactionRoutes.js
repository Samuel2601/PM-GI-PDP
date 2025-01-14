// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionService = require("../services/transactionService");

// Middleware para manejar errores asíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// **Rutas para Documentos**
// Obtener todos los documentos
router.get(
  "/documento",
  asyncHandler(async (req, res) => {
    const documents = await transactionService.getDocuments();
    res.json(documents);
  })
);

// Obtener un documento por ID
router.get(
  "/documento/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await transactionService.getDocumentById(id);
    res.json(document);
  })
);

// Crear un nuevo documento
router.post(
  "/documento",
  asyncHandler(async (req, res) => {
    const documentData = req.body;
    const newDocument = await transactionService.createDocument(documentData);
    res.status(201).json(newDocument);
  })
);

// Actualizar un documento existente
router.put(
  "/documento",
  asyncHandler(async (req, res) => {
    const documentData = req.body;
    const updatedDocument = await transactionService.updateDocument(
      documentData
    );
    res.json(updatedDocument);
  })
);

// Enviar un documento al SRI
router.put(
  "/documento/:id/sri",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sriData = req.body;
    const response = await transactionService.submitDocumentToSRI(id, sriData);
    res.json(response);
  })
);

// **Rutas para Cobros**
// Obtener todas las colecciones de un documento
router.get(
  "/documento/:id/cobro",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collections = await transactionService.getDocumentCollections(id);
    res.json(collections);
  })
);

// Crear una colección para un documento
router.post(
  "/documento/:id/cobro",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collectionData = req.body;
    const response = await transactionService.createDocumentCollection(
      id,
      collectionData
    );
    res.status(201).json(response);
  })
);

// Eliminar una colección de un documento
router.delete(
  "/documento/:id/cobro",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await transactionService.deleteDocumentCollection(id);
    res.json(response);
  })
);

// **Rutas para Retenciones**
// Obtener retenciones de un documento
router.get(
  "/documento/:id/retencion",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const retention = await transactionService.getDocumentRetention(id);
    res.json(retention);
  })
);

// **Rutas para Transacciones**
// Obtener todas las transacciones
router.get(
  "/transaccion",
  asyncHandler(async (req, res) => {
    const transactions = await transactionService.getTransactions();
    res.json(transactions);
  })
);

// Obtener una transacción por ID
router.get(
  "/transaccion/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(id);
    res.json(transaction);
  })
);

// Middleware para manejar errores
router.use((error, req, res, next) => {
  console.error("Error en las rutas de transacciones:", error);
  res.status(500).json({
    message: "Error interno del servidor",
    error: error.message,
  });
});

module.exports = router;
