const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const response = require("../network/response");
const mysqlConection = require("../database"); //Importa la conexión de database
const moment = require("moment")
const jwt = require("jsonwebtoken");
//Por el METODO GET  genera una consulta a la bd

router.get("/api/cotizaciones/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            mysqlConection.query("select cotizacionCliente.*,cliente.* from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente WHERE estatus='Cotizada'", (err, rows, fields) => {
                    if (!err) {
                        let body = rows
                        response.success(req, res, false, true, body, 200)
                        //res.json(rows); //Muestra el resultado
                    } else {
                        res.json(err); //Muestra el error
                    }
                });
        }
    })
});


router.get("/api/cotizaciones/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            var obj = {
                dataCliente: [],
                dataLibros: []
            }
            mysqlConection.query("select cotizacionCliente.*,cliente.* from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente where cotizacionCliente.id_cotizacion =" + id, (err, rows, fields) => {
                    if (!err) {
                        obj["dataCliente"] = rows
                        mysqlConection.query("select detalleCotizacion.*,libros.* from cotizacionCliente"
                            + " INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion"
                            + " INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where cotizacionCliente.id_cotizacion =" + id, (err, rows, fields) => {
                                if (!err) {
                                    obj["dataLibros"] = rows
                                    let body = obj
                                    response.success(req, res, false, true, body, 200)

                                } else {
                                    res.json(err); //Muestra el error
                                }
                            });
                    } else {
                        res.json(err); //Muestra el error
                    }
                });
        }
    })
});

router.post("/api/cotizaciones/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            /* Ejemplo de envio de datos para el POST
            {
                "idCliente":3,
                "datos":[{
                    "idLibro":60, 
                    "cantidad":2,
                    "precio":50
                },{
                    "idLibro":2, 
                    "cantidad":2,
                    "precio":50
                }]
            } */
            const { idCliente, datos } = req.body;
            var fecha = moment().format('YYYY-MM-DD');
            var arrayData = [];
            const query = "INSERT INTO cotizacionCliente (id_cliente,fecha_cotizacion,estatus) VALUES (?, ?, ?)";
            mysqlConection.query(query, [idCliente, fecha, "Facturada"], (err, rows, fields) => {
                if (!err) {
                    var id_cotizacionCliente = rows.insertId;
                    for (let i = 0; i < datos.length; i++) {
                        let array = [id_cotizacionCliente, datos[i].idLibro, datos[i].cantidad, datos[i].precio]
                        arrayData.push(array)
                    }
                    const query2 = "INSERT INTO detalleCotizacion (id_cotizacion,id_libro,cantidad,precio) VALUES ?";
                    mysqlConection.query(query2, [arrayData], (err, rows, fields) => {
                        if (!err) {

                            let body = { "idCotizacion": id_cotizacionCliente }
                            response.success(req, res, false, true, body, 200)
                        } else {
                        }
                    });
                } else {
                }
            });
        }
    })
});


router.delete("/api/cotizaciones/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query(
                "delete from detalleCotizacion where id_cotizacion = ?",
                [id],
                (err, rows, fields) => {
                    if (!err) {
                        mysqlConection.query(
                            "delete from cotizacionCliente where id_cotizacion = ?",
                            [id],
                            (err, rows, fields) => {
                                if (!err) {
                                    let body = { status: "Elimiado" }
                                    response.success(req, res, false, true, body, 200)
                                } else {
                                }
                            });
                    } else {
                    }
                });
        }
    })
});

// Authorization: Bearer <token>
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    }
}
//Ageragr PUT para actualizar alguna factura, actualizar cotización
module.exports = router; //Exporta la ruta