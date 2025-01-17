"use strict";

var express = require("express");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var port = process.env.PORT || 4201;
var app = express();

var server = require("http").createServer(app);
var io = require("socket.io")(server, {
  cors: { origin: "*" },
});

io.on("connection", function (socket) {
  socket.on("delete-carrito", function (data) {
    io.emit("new-carrito", data);
    //console.log(data);
  });

  socket.on("add-carrito-add", function (data) {
    io.emit("new-carrito-add", data);
    //console.log(data);
  });
});

var estudiante_routes = require("./routes/estudiante");
var admin_routes = require("./routes/admin");
//var finan_routes = require('./routes/financiero');
var google_routes = require("./routes/google");
const {
  actualizarNumpensionEnTodasLasBases,
} = require("./controllers/scheduler");
const apiexport = require("./controllers/consulta_externa");
const router = require("./routes/instituciones");
const contificoModule = require("./contificoModule/contificoModule");
const { crossData } = require("./contificoModule/migration/dataCrossService");
mongoose.connect(
  "mongodb://127.0.0.1:27017/Instituciones?retryWrites=false",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000, // 30 segundos
    socketTimeoutMS: 45000, // 45 segundos
  },
  (err, res) => {
    if (err) {
      console.log(err);
      throw err;
    } else {
      //console.log("Corriendo....");
      server.listen(port, function () {
        console.log("Servidor " + port);
      });
    }
  }
);

app.use(bodyparser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyparser.json({ limit: "50mb", extended: true }));

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

app.use("/api", estudiante_routes);
app.use("/api", admin_routes);
//app.use('/api',finan_routes);
app.use("/api", google_routes);
app.use("/api", apiexport);
app.use("/api", router);

app.use("/api", contificoModule);

//actualizarNumpensionEnTodasLasBases();

//crossData();

module.exports = app;
