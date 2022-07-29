const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");

const jwt = require("jsonwebtoken");

//Por el METODO GET  genera una consulta a la bd
router.get("/api/countFactura/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {

            mysqlConection.query("SELECT * FROM Contadores Where tipo='Factura'", (err, rows, fields) => {
                if (!err) {
                    res.json(rows); //Muestra el resultado
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
});

router.put("/api/updateFactura/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("SELECT * FROM Contadores Where tipo='Factura'", (err, rows, fields) => {
                if (!err) {
                    var data = "contador= ?";
                    var array = [];
                    var number = rows[0]["contador"] + 1
                    array.push(number);
                    array.push("Factura");
                    const query = "update Contadores set " + data + " where tipo =?;";
                    mysqlConection.query(query, array, (err, rows, fields) => {
                        if (!err) {
                            res.json({ number: number });
                        } else {
                        }
                    });
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
});
//Por el METODO GET  genera una consulta a la bd
router.get("/api/countCotizador/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            mysqlConection.query("SELECT * FROM Contadores Where tipo='Cotizador'", (err, rows, fields) => {
                if (!err) {
                    res.json(rows); //Muestra el resultado
                } else {
                    res.json(err); //Muestra el error
                }
            });
        }
    })
});
router.put("/api/updateCotizador/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("SELECT * FROM Contadores Where tipo='Cotizador'", (err, rows, fields) => {
                if (!err) {
                    var data = "contador= ?";
                    var array = [];
                    var number = rows[0]["contador"] + 1
                    array.push(number);
                    array.push("Cotizador");
                    const query = "update Contadores set " + data + " where tipo =?;";
                    mysqlConection.query(query, array, (err, rows, fields) => {
                        if (!err) {
                            res.json({ number: number });
                        } else {
                        }
                    });
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