var express = require('express');
var app = express();
var mdAuth = require('../middlewares/auth');
var Medico = require('../models/medico');


//
// Obtener Medicos  
//

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'no se pudieron objener usuario',
                        error: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });

            }
        );
});


//
// Actualizar Medicos  
//
app.put('/:id', mdAuth.verificaToken, (req, res, next) => {

    id = req.params.id;
    body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el medico con el id' + id + 'no existe',
                    errors: { mensaje: 'no existe medico con este id' }
                });
            }
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar el medico',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});



//
// Eliminar Medicos  
//
app.delete('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al elminar medico',
                error: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un medico con ese id',
                error: 'no existe'
            });
        }
        res.status(200).json({
            ok: true,
            medicoNuevo: 'medico eliminado correctamente',
            medico: medico
        });
    });



});


//
// Crear Medicos  
//

app.post('/', mdAuth.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({

        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save((err, nuevoMedico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al crear medico',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            medicoNuevo: nuevoMedico
        });
    });
});


module.exports = app;