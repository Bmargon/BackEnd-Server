// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// conexion a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'peticion realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('servidor en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});