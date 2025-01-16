"use strict";

const express = require("express");
let router = express.Router();
const { auth } = require("../middlewares/authenticate");
const { loadInstitutionConfig } = require("../middlewares/institutionConfig");
const inventoryRoutes = require("./routes/inventoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const personRoutes = require("./routes/personRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const bankingRoutes = require("./routes/bankingRoutes");

// Aplica el middleware de autenticación y configuración dinámica antes de las rutas

//router.use(auth);
//router.use([auth, loadInstitutionConfig]);

// Rutas de Inventario

router.use("/inventario", inventoryRoutes);

// Rutas de transacciones

router.use("/transaccion", transactionRoutes);

// Rutas de personas

router.use("/persona", personRoutes);

// Rutas de Contabilidad

router.use("/contabilidad", accountingRoutes);

// Rutas de Bancos

router.use("/banco", bankingRoutes);

// Middleware para manejar errores
router.use((error, req, res, next) => {
  console.error("Error en las rutas de transacciones:", error);
  res.status(500).json({
    message: "Error interno del servidor",
    error: error.message,
  });
});

// Exportar las rutas del módulo de Contifico
module.exports = router;
