var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

// modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion

    var tiposVarios = ['hospitales', 'medicos', 'usuarios'];

    // ejecucion
    if (tiposVarios.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no coleccion valida',
            error: { message: 'la coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no selecciona nada',
            error: { message: 'debe seleccionar una imagen' }
        });
    }

    //obetner nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            error: { message: 'las extensiones validas son' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personaliazo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // mover archivo del temporal a un path
    var path = `./upload/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'erro al mover archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     message: 'archivo movido'
        // });

    });




});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './upload/usuarios/' + usuario.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                if (err) {
                    res.status(500).json({
                        mensaje: 'error al cambiar foto',
                        error: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    message: 'imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });
        });
    }

    //medicos

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medicos) => {

            if (!medicos) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'no se encontro ningun medico'
                });
            }

            var pathViejo = './upload/medicos/' + medicos.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medicos.img = nombreArchivo;

            medicos.save((err, medicoGuardado) => {
                if (err) {
                    res.status(500).json({
                        mensaje: 'error al cambiar img medicos',
                        error: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    medico: medicoGuardado,
                    mensaje: 'imagen del medico actualizada'
                });
            });
        });
    }

    // Hopitales
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'no existe ningun hospital'
                });
            }

            var viejoPath = './upload/hospitales/' + hospital.img;

            if (fs.existsSync(viejoPath)) {
                fs.unlinkSync(viejoPath);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospital) => {
                return res.status(200).json({
                    ok: true,
                    hospital: hospital,
                    mensaje: 'usuario actualizado correctamente'
                });
            });
        });
    }

}
module.exports = app;