const mongoose = require("mongoose");
require('dotenv').config();

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log("Conexión Exitosa a la BD 😍");
        return m.connection.getClient();
    })
    .catch(e => console.log("Falló la conexión a la bd " + e))

module.exports = clientDB;