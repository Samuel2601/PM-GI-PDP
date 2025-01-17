// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryService = require("../services/inventoryService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig");

// Middleware for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Category routes
router.get(
  "/categoria",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const categories = await inventoryService.getCategories(req);
    res.json(categories);
  })
);

router.get(
  "/categoria/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await inventoryService.getCategoryById(req, id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  })
);

// Warehouse (Bodega) routes
router.get(
  "/bodega",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const warehouses = await inventoryService.getWarehouses(req);
    res.json(warehouses);
  })
);

router.get(
  "/bodega/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const warehouse = await inventoryService.getWarehouseById(req, id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(warehouse);
  })
);

// Variant routes
router.get(
  "/variante",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const variants = await inventoryService.getVariants(req);
    res.json(variants);
  })
);

router.get(
  "/variante/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const variant = await inventoryService.getVariantById(req, id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json(variant);
  })
);

// Product routes
router.get(
  "/producto",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const products = await inventoryService.getProducts(req);
    res.json(products);
  })
);

router.get(
  "/producto/:tipo",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { tipo } = req.params;
    const product = await inventoryService.getProductsTipo(req, tipo);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  })
);

router.get(
  "/producto/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await inventoryService.getProductById(req, id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  })
);

router.post(
  "/producto",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const product = await inventoryService.createProduct(req, req.body);
    res.status(201).json(product);
  })
);

router.patch(
  "/producto/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await inventoryService.updateProduct(req, id, req.body);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  })
);

router.get(
  "/producto/:id/stock",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stock = await inventoryService.getProductStock(req, id);
    if (!stock) {
      return res.status(404).json({ message: "Product stock not found" });
    }
    res.json(stock);
  })
);

// Inventory Movement routes
router.get(
  "/movimiento-inventario",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const movements = await inventoryService.getInventoryMovements(req);
    res.json(movements);
  })
);

router.get(
  "/movimiento-inventario/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const movement = await inventoryService.getInventoryMovementById(
      req,
      req.params.id
    );
    if (!movement) {
      return res.status(404).json({ message: "Inventory movement not found" });
    }
    res.json(movement);
  })
);

router.post(
  "/movimiento-inventario",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const movement = await inventoryService.createInventoryMovement(
      req,
      req.body
    );
    res.status(201).json(movement);
  })
);

// Shipping Guide routes
router.get(
  "/inventario/guia",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const guides = await inventoryService.getShippingGuides(req);
    res.json(guides);
  })
);

router.post(
  "/inventario/guia",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const guide = await inventoryService.createShippingGuide(req, req.body);
    res.status(201).json(guide);
  })
);

// Brand routes
router.get(
  "/marca",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const brands = await inventoryService.getBrands(req);
    res.json(brands);
  })
);

module.exports = router;

// In your main app.js or index.js:
/*
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/', inventoryRoutes);  // Since the paths already include their base routes
*/
