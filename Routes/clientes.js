const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");
const jwt = require("jsonwebtoken");

//Por el METODO GET  genera una consulta a la bd
router.get("/api/clientes", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      mysqlConection.query("SELECT *, CONCAT(calle,' ', numero,' ',codigoPostal,' ',ciudad,' ',estado)  As direccion FROM cliente ", (err, rows, fields) => {
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
//Por el METODO GET y pasando un valor obtiene un registro por su ID
router.get("/api/cliente/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { id } = req.params;
      mysqlConection.query(
        "select * from cliente where idcliente = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            //res.json(rows[0]); //Muestra el resultado
            let body = rows[0]
            response.success(req, res, false, true, body, 200)

          } else {
            res.json(err); //Muestra el error
          }
        }
      );
    }
  })
});
//Por el METODO POST Guarda un nuevo registro dentro de la BD
router.post("/api/cliente/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { nombre, telefono, email, calle, numero, codigoPostal, ciudad, estado } = req.body;
      mysqlConection.query("SELECT * from cliente where email = ?",
        [email], (err, rows, fields) => {
          if (!err) {
            if (rows.length > 0) {
              body = {
                error: "El cliente ya fue agregado"
              }
              response.error(req, res, true, false, body, 403, "Error")
            } else {
              const query = "INSERT INTO cliente (nombre,telefono,email,calle,numero,codigoPostal,ciudad,estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
              mysqlConection.query(query, [nombre, telefono, email, calle, numero, codigoPostal, ciudad, estado], (err, rows, fields) => {
                if (!err) {
                  /* res.send("Enviado"); */
                  let body = { status: "Agregado correctamente" }
                  response.success(req, res, false, true, body, 200)
                } else {
                }
              });
            }
          }
        })
    }
  });
})
//Por medio del METODO PUT se actualiza un registro
router.put("/api/cliente/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { id } = req.params;
      const { nombre, telefono, email, calle, numero, codigoPostal, ciudad, estado } = req.body;
      var data = "";
      var array = [];
      if (nombre) {
        if (data.length != 0) {
          data += ",";
        }
        data += "nombre= ?";
        array.push(nombre);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "nombre= ?";
        array.push("");
      }

      if (telefono) {
        if (data.length != 0) {
          data += ",";
        }
        data += "telefono= ?";
        array.push(telefono);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "telefono= ?";
        array.push("");
      }

      if (email) {
        if (data.length != 0) {
          data += ",";
        }
        data += "email= ?";
        array.push(email);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "email= ?";
        array.push("");
      }

      if (calle) {
        if (data.length != 0) {
          data += ",";
        }
        data += "calle= ?";
        array.push(calle);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "calle= ?";
        array.push("");
      }

      if (numero) {
        if (data.length != 0) {
          data += ",";
        }
        data += "numero= ?";
        array.push(numero);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "numero= ?";
        array.push("");
      }

      if (codigoPostal) {
        if (data.length != 0) {
          data += ",";
        }
        data += "codigoPostal= ?";
        array.push(codigoPostal);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "codigoPostal= ?";
        array.push("");
      }

      if (ciudad) {
        if (data.length != 0) {
          data += ",";
        }
        data += "ciudad= ?";
        array.push(ciudad);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "ciudad= ?";
        array.push("");
      }

      if (estado) {
        if (data.length != 0) {
          data += ",";
        }
        data += "estado= ?";
        array.push(estado);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "estado= ?";
        array.push("");
      }
      array.push(id);
      const query = "update cliente set " + data + " where idcliente =?;";
      mysqlConection.query(query, array, (err, rows, fields) => {
        if (!err) {
          //res.json({ status: "Actualizado" });
          let body = { status: "Actualizado" }
          response.success(req, res, false, true, body, 200)
        } else {
        }
      });
    }
  })
});
//Por medio del METODO DELETE se elimina un registro
router.delete("/api/cliente/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      const { id } = req.params;
      mysqlConection.query(
        "delete from cliente where idcliente = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            /* res.json({ status: "Elimiado" }); */
            let body = { status: "Elimiado" }
            response.success(req, res, false, true, body, 200)
          } else {
          }
        }
      );
    }
  });
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