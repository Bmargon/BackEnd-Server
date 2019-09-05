var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../config/config').seed;
var app = express();
var Usuario = require('../models/usuario');

// goole
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
//
//
// Google


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
};


app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token).catch(e => {

        return res.status(403).json({
            ok: false,
            mensaje: 'token no valido'
        });

    });

    Usuario.findOne({ email: googleUser.eamil }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'erro al buscar usuario'
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'debe de entrar normal'
                });
            } else {

                // crear token
                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: 'todo okey en el login',
                    token: token,
                    body: usuarioDB,
                    id: usuarioDB._id
                });

            }
        } else {
            // el usuario no existe por lo que hay que creearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: 14400 });


                res.status(201).json({
                    ok: true,
                    usuario: 'todo okey en el login',
                    token: token,
                    body: usuarioDB,
                    id: usuarioDB._id
                });

            });
        }

    });

    // res.status(201).json({
    //     ok: true,
    //     googleuser: googleUser,
    // });

});

//
//
// Normal
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