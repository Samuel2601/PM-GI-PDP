const mongoose = require('mongoose');
const cron = require('node-cron');
const ConfigSchema = require('../models/Config');

async function actualizarNumpension() {
    let conn = mongoose.connection.useDb('CRISTOREY');
    const Config = conn.model('config', ConfigSchema);
    try {
        // Encuentra el último documento por `anio_lectivo`
        const ultimoConfig = await Config.findOne().sort({ anio_lectivo: -1 });

        if (ultimoConfig) {
            const anioLectivo = new Date(ultimoConfig.anio_lectivo);
            const fechaActual = new Date();

            // Calcula el número de meses transcurridos
            const diffYears = fechaActual.getFullYear() - anioLectivo.getFullYear();
            const diffMonths = (diffYears * 12) + (fechaActual.getMonth() - anioLectivo.getMonth());

            // Establece numpension basado en los meses transcurridos, con un máximo de 10
            ultimoConfig.numpension = Math.min(diffMonths + 1, 10); // +1 porque numpension empieza en 1

            await ultimoConfig.save();
            console.log(`numpension actualizado a ${ultimoConfig.numpension} para el año lectivo ${ultimoConfig.anio_lectivo}`);
        } else {
            console.log('No se encontró ningún documento para actualizar.');
        }
    } catch (error) {
        console.error('Error al actualizar numpension:', error);
    }
}

async function programarTarea() {
    let conn = mongoose.connection.useDb('CRISTOREY');
    const Config = conn.model('config', ConfigSchema);
    try {
        // Encuentra el último documento por `anio_lectivo`
        const ultimoConfig = await Config.findOne().sort({ createdAt: -1 });

        if (ultimoConfig) {
            const proximoAnioLectivo = new Date(ultimoConfig.anio_lectivo);

            const dia = proximoAnioLectivo.getDate();
            const mes = proximoAnioLectivo.getMonth() + 1; // Los meses en JavaScript son 0-11
            const hora = proximoAnioLectivo.getHours();
            const minuto = proximoAnioLectivo.getMinutes();

            const cronExpresion = ` ${minuto} ${hora} ${dia} 1,12 *`;

            console.log(`Programando tarea para ejecutar el ${proximoAnioLectivo} con la expresión cron: ${cronExpresion}`);

            cron.schedule(cronExpresion, () => {
                console.log('Ejecutando tarea programada: actualizarNumpension');
                actualizarNumpension();
            });

            console.log('Tarea programada exitosamente.');
        } else {
            console.log('No se encontró ningún documento para programar la tarea.');
        }
    } catch (error) {
        console.error('Error al programar la tarea:', error);
    }
}

module.exports={
    programarTarea,
    actualizarNumpension
}