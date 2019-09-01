var seed = require('../config/config').seed;
var jwt = require('jsonwebtoken');


//
// Verificar oken
//
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, seed, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token incorrecto',
                error: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}