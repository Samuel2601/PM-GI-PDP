// routes/personRoutes.js
const express = require("express");
const router = express.Router();
const personService = require("../services/personService");

// Middleware para manejar errores asíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Obtener todas las personas
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const persons = await personService.getPersons();
    res.json(persons);
  })
);

// Obtener una persona por ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const person = await personService.getPersonById(id);
    res.json(person);
  })
);

// Crear una nueva persona
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const personData = req.body;
    const newPerson = await personService.createPerson(personData);
    res.status(201).json(newPerson);
  })
);

// Actualizar una persona existente
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const personData = req.body;
    const updatedPerson = await personService.updatePerson(personData);
    res.json(updatedPerson);
  })
);

// Middleware para manejo de errores
router.use((error, req, res, next) => {
  console.error("Error en las rutas de personas:", error);
  res.status(500).json({
    message: "Error interno del servidor",
    error: error.message,
  });
});

module.exports = router;
