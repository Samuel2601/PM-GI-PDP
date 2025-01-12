// services/inventoryService.js
const httpClient = require("./httpClient");

// Category endpoints
const getCategories = async () => {
  try {
    const response = await httpClient.get("/categoria/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching categories: ${error.response?.data || error.message}`
    );
  }
};

const getCategoryById = async (id) => {
  try {
    const response = await httpClient.get(`/categoria/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching category with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Warehouse (Bodega) endpoints
const getWarehouses = async () => {
  try {
    const response = await httpClient.get("/bodega/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching warehouses: ${error.response?.data || error.message}`
    );
  }
};

const getWarehouseById = async (id) => {
  try {
    const response = await httpClient.get(`/bodega/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching warehouse with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Variant endpoints
const getVariants = async () => {
  try {
    const response = await httpClient.get("/variante/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching variants: ${error.response?.data || error.message}`
    );
  }
};

const getVariantById = async (id) => {
  try {
    const response = await httpClient.get(`/variante/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching variant with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Product endpoints
const getProducts = async () => {
  try {
    const response = await httpClient.get("/producto/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching products: ${error.response?.data || error.message}`
    );
  }
};

const getProductById = async (id) => {
  try {
    const response = await httpClient.get(`/producto/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching product with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createProduct = async (productData) => {
  try {
    const response = await httpClient.post("/producto/", productData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating product: ${error.response?.data || error.message}`
    );
  }
};

const updateProduct = async (id, productData) => {
  try {
    const response = await httpClient.patch(`/producto/${id}/`, productData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error updating product with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const getProductStock = async (id) => {
  try {
    const response = await httpClient.get(`/producto/${id}/stock/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching stock for product ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Inventory Movement endpoints
const getInventoryMovements = async () => {
  try {
    const response = await httpClient.get("/movimiento-inventario/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching inventory movements: ${
        error.response?.data || error.message
      }`
    );
  }
};

const getInventoryMovementById = async (id) => {
  try {
    const response = await httpClient.get(`/movimiento-inventario/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching inventory movement with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createInventoryMovement = async (movementData) => {
  try {
    const response = await httpClient.post(
      "/movimiento-inventario/",
      movementData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating inventory movement: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Shipping Guide endpoints
const getShippingGuides = async () => {
  try {
    const response = await httpClient.get("/inventario/guia/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching shipping guides: ${error.response?.data || error.message}`
    );
  }
};

const createShippingGuide = async (guideData) => {
  try {
    const response = await httpClient.post("/inventario/guia/", guideData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating shipping guide: ${error.response?.data || error.message}`
    );
  }
};

// Brand endpoints
const getBrands = async () => {
  try {
    const response = await httpClient.get("/marca/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching brands: ${error.response?.data || error.message}`
    );
  }
};

module.exports = {
  // Categories
  getCategories,
  getCategoryById,

  // Warehouses
  getWarehouses,
  getWarehouseById,

  // Variants
  getVariants,
  getVariantById,

  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductStock,

  // Inventory Movements
  getInventoryMovements,
  getInventoryMovementById,
  createInventoryMovement,

  // Shipping Guides
  getShippingGuides,
  createShippingGuide,

  // Brands
  getBrands,
};
