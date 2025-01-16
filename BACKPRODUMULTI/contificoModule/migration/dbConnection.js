const mongoose = require("mongoose");

const connections = {};

const getDatabaseConnection = async (dbName) => {
  if (connections[dbName]) {
    return connections[dbName];
  }

  const connection = await mongoose.createConnection(
    `mongodb://localhost:27017/${dbName}`, // Cambia la URI según tu configuración
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  connections[dbName] = connection;
  return connection;
};

module.exports = { getDatabaseConnection };
