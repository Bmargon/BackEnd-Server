var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../config/config').seed;
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'erro al buscar usuario'
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                error: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - password',
                error: err
            });
        }

        usuarioDB.password = ':)';

        // crear token
        var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: 14400 });

        res.status(201).json({
            ok: true,
            usuario: 'todo okey en el login',
            token: token,
            body: usuarioDB,
            id: usuarioDB._id
        });

    });

});

module.exports = app;