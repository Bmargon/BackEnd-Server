var express = require('express');
var app = express();
var mdAuth = require('../middlewares/auth');
var Hospital = require('../models/hospital');

//
// Obtener todos los hospitales
//
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'no se pudieron obtener hospitales',
                        error: err
                    });
                }
                if (!hospital) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'no se pudieron encontrar hospitales',
                        error: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'peticion get hospitales ok',
                        hospitales: hospital,
                        total: conteo
                    });
                });

            }
        );
});
//
// Borrar un hospital
//
app.delete('/:id', mdAuth.verificaToken, (req, res, next) => {

    id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: hospitalBorrado
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un hospital con ese id',
                error: 'no existe'
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'hospital borrado',
            usuario: hospitalBorrado

        });
    });
});

//
// Actualizar un hospital
//
app.put('/:id', mdAuth.verificaToken, (req, res, next) => {

    id = req.params.id;
    body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el hospital con el id' + id + 'no existe',
                    errors: { mensaje: 'no existe hospital con este id' }
                });
            }
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el hospital',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

//
// Crear un hospital
//

app.post('/', mdAuth.verificaToken, (req, res) => {

    body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, nuevoHospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no se pudieron crear hospitales',
                error: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'hospital creado correctamente',
            hospital: nuevoHospital
        });
    });
});

module.exports = app;