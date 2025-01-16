// routes/bankingRoutes.js
const express = require("express");
const router = express.Router();
const bankingService = require("../services/bankingService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig");

// Middleware for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all bank accounts
router.get(
  "/cuenta",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const bankAccounts = await bankingService.getBankAccounts();
    res.json(bankAccounts);
  })
);

// Get all bank movements
router.get(
  "/movimiento",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const movements = await bankingService.getBankMovements();
    res.json(movements);
  })
);

module.exports = router;

// In your main app.js or index.js:
/*
const bankingRoutes = require('./routes/bankingRoutes');
app.use('/banco', bankingRoutes);
*/
