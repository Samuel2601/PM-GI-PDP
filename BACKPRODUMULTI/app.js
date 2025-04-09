"use strict";

var express = require("express");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var port = process.env.PORT || 4201;
var app = express();

var server = require("http").createServer(app);

// Rutas
var estudiante_routes = require("./routes/estudiante");
var admin_routes = require("./routes/admin");
var google_routes = require("./routes/google");
const apiexport = require("./controllers/consulta_externa");
const router = require("./routes/instituciones");
const contificoModule = require("./contificoModule/contificoModule");

// En app.js, después de la conexión a MongoDB
const modelsService = require("./service/models.service");

// Configuración mejorada para Mongoose
mongoose.set("bufferCommands", false); // Desactiva el almacenamiento en búfer de comandos cuando la conexión está inactiva

// Manejo de eventos para la conexión de MongoDB
mongoose.connection.on("error", (err) => {
  console.error("Error de conexión a MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB desconectado. Intentando reconectar...");
});

// Cierre adecuado de la conexión al terminar el proceso
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Conexión a MongoDB cerrada correctamente");
    process.exit(0);
  } catch (err) {
    console.error("Error al cerrar la conexión de MongoDB:", err);
    process.exit(1);
  }
});

// Control de memoria del proceso Node.js
process.on("warning", (warning) => {
  console.warn(warning.name, warning.message);
  if (warning.name === "MemoryLeak") {
    console.error("Detectada fuga de memoria:", warning.message);
  }
});

// Optimizar recolección de basura
global.gc &&
  setInterval(() => {
    try {
      global.gc();
      console.log("Recolección de basura manual ejecutada");
    } catch (e) {
      console.error("Error en recolección de basura manual:", e);
    }
  }, 30 * 60 * 1000); // Cada 30 minutos

mongoose.connect(
  "mongodb://127.0.0.1:27017/Instituciones?retryWrites=false",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    // Configuración optimizada para tu caso
    maxPoolSize: 25, // Suficiente para 100 usuarios en 15 bases de datos
    minPoolSize: 5, // Mantiene algunas conexiones siempre disponibles
    connectTimeoutMS: 10000,
    keepAlive: true,
    keepAliveInitialDelay: 300000, // 5 minutos
  },
  async (err, res) => {
    if (err) {
      console.log(err);
      throw err;
    } else {
      // Inicializar modelos para todas las bases de datos
      await modelsService.initializeAllDatabases();

      server.listen(port, function () {
        console.log("Servidor corriendo en puerto " + port);
      });
    }
  }
);

// Reducir los límites de bodyparser para prevenir uso excesivo de memoria
app.use(bodyparser.urlencoded({ limit: "15mb", extended: true }));
app.use(bodyparser.json({ limit: "15mb", extended: true }));

// Middleware para monitorear el uso de memoria en cada petición
app.use((req, res, next) => {
  const start = process.memoryUsage().heapUsed / 1024 / 1024;

  res.on("finish", () => {
    const end = process.memoryUsage().heapUsed / 1024 / 1024;
    const used = end - start;

    if (used > 50) {
      // Si se usaron más de 50MB en una sola petición
      console.warn(
        `Uso de memoria elevado en ${req.method} ${
          req.originalUrl
        }: ${used.toFixed(2)} MB`
      );
    }
  });

  next();
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Allow", "GET, PUT, POST, DELETE, OPTIONS");
  next();
});

// Middleware para cerrar conexiones pendientes
app.use((req, res, next) => {
  // Asegurarse de que las respuestas siempre terminen
  const originalEnd = res.end;

  res.end = function () {
    // Timeout de seguridad para cerrar la respuesta
    const timeout = setTimeout(() => {
      if (!res.writableEnded) {
        console.warn("Respuesta forzada a cerrar para evitar fugas de memoria");
        originalEnd.apply(res);
      }
    }, 360000); // 1 minuto de timeout

    clearTimeout(timeout);
    return originalEnd.apply(res, arguments);
  };

  next();
});

// Rutas
app.use("/api", estudiante_routes);
app.use("/api", admin_routes);
app.use("/api", google_routes);
app.use("/api", apiexport);
app.use("/api", router);
app.use("/api", contificoModule);

// Manejo global de errores para evitar caídas
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

module.exports = app;
