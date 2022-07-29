const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");
const jwt = require("jsonwebtoken");

//Por el METODO GET  genera una consulta a la bd
router.get("/api/editorial/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      mysqlConection.query("SELECT * FROM editorial ", (err, rows, fields) => {
        if (!err) {
          res.json(rows); //Muestra el resultado
        } else {
          res.json(err); //Muestra el error
        }
      });
    }
  })
});
//Por el METODO GET y pasando un valor obtiene un registro por su ID
router.get("/api/editorial/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      const { id } = req.params;
      mysqlConection.query(
        "select * from editorial where ideditorial = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            res.json(rows[0]); //Muestra el resultado
          } else {
            res.json(err); //Muestra el error
          }
        }
      );
    }
  })
});
//Por el METODO POST Guarda un nuevo registro dentro de la BD
router.post("/api/editorial/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      const { id, nombre, estado, direccion, descripcion } = req.body;
      const query = "INSERT INTO editorial (ideditorial,editorialName,editorialState,editorialAddress,editorialDescription) VALUES (?, ?, ?, ?, ?)";
      mysqlConection.query(query, [id, nombre, estado, direccion, descripcion], (err, rows, fields) => {
        if (!err) {
          res.send("Enviado");
        } else {
        }
      });
    }
  })
});
//Por medio del METODO PUT se actualiza un registro
router.put("/api/editorial/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { id } = req.params;
      const { nombre, estado, direccion, descripcion } = req.body;
      var data = "";
      var array = [];
      if (nombre) {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialName= ?";
        array.push(nombre);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialName= ?";
        array.push("");
      }

      if (estado) {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialState= ?";
        array.push(estado);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialState= ?";
        array.push("");
      }

      if (direccion) {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialAddress= ?";
        array.push(direccion);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialAddress= ?";
        array.push("");
      }

      if (descripcion) {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialDescription= ?";
        array.push(descripcion);
      } else {
        if (data.length != 0) {
          data += ",";
        }
        data += "editorialDescription= ?";
        array.push("");
      }

      array.push(id);
      const query = "update editorial set " + data + " where ideditorial =?;";
      mysqlConection.query(query, array, (err, rows, fields) => {
        if (!err) {
          res.json({ status: "Actualizado" });
        } else {

        }
      });
    }
  })
});
//Por medio del METODO DELETE se elimina un registro
router.delete("/api/editorial/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { id } = req.params;
      mysqlConection.query(
        "delete from editorial where ideditorial = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            res.json({ status: "Elimiado" });
          } else {
          }
        }
      );
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