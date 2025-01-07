'use strict';

const mongoose = require('mongoose');
const cron = require('node-cron');
const ConfigSchema = require('../models/Config');

async function actualizarNumpensionEnTodasLasBases() {
    try {
        // Obtener el cliente nativo de MongoDB
        const client = mongoose.connection.getClient();
        const adminDb = client.db().admin();

        // Obtener todas las bases de datos
        const dbs = await adminDb.listDatabases();
        const basesDeDatos = dbs.databases.map(db => db.name);

        for (const dbName of basesDeDatos) {
            console.log(`Conectando a la base de datos: ${dbName}`);
            const conn = mongoose.connection.useDb(dbName);
            const Config = conn.model('config', ConfigSchema);

            // Buscar el último documento en la colección `config`
            const ultimoConfig = await Config.findOne({ anio_lectivo: { $type: 'date' } }).sort({ anio_lectivo: -1 });

            if (ultimoConfig) {
                const anioLectivo = new Date(ultimoConfig.anio_lectivo);
                const fechaActual = new Date();

                // Calcula el número de meses transcurridos
                const diffYears = fechaActual.getFullYear() - anioLectivo.getFullYear();
                const diffMonths = (diffYears * 12) + (fechaActual.getMonth() - anioLectivo.getMonth());

                // Establece numpension basado en los meses transcurridos, con un máximo de 10
                ultimoConfig.numpension = Math.min(diffMonths + 1, 10); // +1 porque numpension empieza en 1

                await ultimoConfig.save();
                console.log(`[${dbName}] numpension actualizado a ${ultimoConfig.numpension} para el año lectivo ${ultimoConfig.anio_lectivo}`);
            } else {
                console.log(`[${dbName}] No se encontró ningún documento para actualizar.`);
            }
        }
    } catch (error) {
        console.error('Error al actualizar numpension en todas las bases:', error);
    }
}

async function programarTareaEnTodasLasBases() {
    try {
        // Obtener el cliente nativo de MongoDB
        const client = mongoose.connection.getClient();
        const adminDb = client.db().admin();

        // Obtener todas las bases de datos
        const dbs = await adminDb.listDatabases();
        const basesDeDatos = dbs.databases.map(db => db.name);

        for (const dbName of basesDeDatos) {
            console.log(`Conectando a la base de datos: ${dbName}`);
            const conn = mongoose.connection.useDb(dbName);
            const Config = conn.model('config', ConfigSchema);

            // Buscar el último documento en la colección `config`
            const ultimoConfig = await Config.findOne({ anio_lectivo: { $type: 'date' } }).sort({ createdAt: -1 });

            if (ultimoConfig) {
                const proximoAnioLectivo = new Date(ultimoConfig.anio_lectivo);

                const dia = proximoAnioLectivo.getDate();
                const mes = proximoAnioLectivo.getMonth() + 1; // Los meses en JavaScript son 0-11
                const hora = proximoAnioLectivo.getHours();
                const minuto = proximoAnioLectivo.getMinutes();

                const cronExpresion = `${minuto} ${hora} ${dia} 1,12 *`;

                console.log(`[${dbName}] Programando tarea para ejecutar el ${proximoAnioLectivo} con la expresión cron: ${cronExpresion}`);

                cron.schedule(cronExpresion, () => {
                    console.log(`[${dbName}] Ejecutando tarea programada: actualizarNumpension`);
                    actualizarNumpensionEnTodasLasBases();
                });

                console.log(`[${dbName}] Tarea programada exitosamente.`);
            } else {
                console.log(`[${dbName}] No se encontró ningún documento para programar la tarea.`);
            }
        }
    } catch (error) {
        console.error('Error al programar la tarea en todas las bases:', error);
    }
}

module.exports = {
    programarTareaEnTodasLasBases,
    actualizarNumpensionEnTodasLasBases
};
