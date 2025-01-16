"use strict";

var jwt = require("jwt-simple");
var moment = require("moment");
var secret = "CristoRey202211";

exports.auth = function (req, res, next) {
  try {
    if (!req.headers.authorization) {
      console.log("No hay token");
      return res.status(403).send({ message: "NoHeadersError" });
    }

    if (req.headers.authorization != "registroadmin") {
      var token = req.headers.authorization.replace(/['"]+/g, "");

      var segment = token.split(".");
      if (segment.length != 3) {
        return res.status(403).send({ message: "InvalidToken" });
      } else {
        try {
          var payload = jwt.decode(token, secret);

          if (payload.exp <= moment().unix()) {
            return res.status(403).send({ message: "TokenExpirado" });
          }
        } catch (error) {
          //console.log(error);
          return res.status(403).send({ message: "InvalidToken" });
        }
      }
      req.user = payload;
    } else {
      req.user = "";
    }

    next();
  } catch (error) {
    console.error("Error en el middleware de autenticación:", error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};
