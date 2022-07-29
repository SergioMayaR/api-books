const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");
const jwt = require("jsonwebtoken");

router.post("/api/filters/libros", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "SELECT libros.* FROM libros ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += "where " + search;
            }
            mysqlConection.query(query, (err, rows, fields) => {
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
router.post("/api/filters/editorial", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "select * from editorial ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += "where " + search;
            }
            mysqlConection.query(query, (err, rows, fields) => {
                if (!err) {
                    //res.json(rows); //Muestra el resultado
                    let body = rows
                    response.success(req, res, false, true, body, 200)
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
})
router.post("/api/filters/users", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "select * from users ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += "where " + search;
            }
            mysqlConection.query(query, (err, rows, fields) => {
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
})
//Por el METODO GET  genera una consulta a la bd
router.post("/api/filters/clientes", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "SELECT * FROM cliente ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += "where " + search;
            }
            mysqlConection.query(query, (err, rows, fields) => {
                if (!err) {
                    //res.json(rows); //Muestra el resultado
                    let body = rows;
                    response.success(req, res, false, true, body, 200)
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
});
router.post("/api/filters/cotizacion", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "select cotizacionCliente.*,cliente.* from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente WHERE estatus='Cotizada' ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += " and " + search;
            }

            mysqlConection.query(query, (err, rows, fields) => {
                if (!err) {
                    //res.json(rows); //Muestra el resultado
                    let body = rows;
                    response.success(req, res, false, true, body, 200)
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
});

router.post("/api/filters/facturacion", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            let data = req.body;
            let count = 0,
                search = "";
            query = "select cotizacionCliente.*,detalleCotizacion.*,libros.*,cliente.*from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente " +
                "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion " +
                "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where cotizacionCliente.estatus = 'Facturada' ";
            for (var i in data) {
                count++;
                if (count == 1) {
                    search += ' ' + i + ' like "%' + data[i] + '%"';
                } else {
                    search += ' AND ' + i + ' like "%' + data[i] + '%"';
                }
            }
            if (count > 0) {
                query += "AND " + search;
            }

            mysqlConection.query(query, (err, rows, fields) => {
                if (!err) {
                    //res.json(rows); //Muestra el resultado
                    let body = rows;
                    response.success(req, res, false, true, body, 200)
                } else {
                    res.json(err); //Muestra el error
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

module.exports = router; //Exporta la ruta
