// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// Inicializar variables
var app = express();

// Body parse
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// importar rutas
var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
// conexion a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});

// Rutas
app.use('/usuario', usuariosRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('servidor en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});