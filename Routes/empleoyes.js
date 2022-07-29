const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");
const jwt = require("jsonwebtoken");


//Por el METODO GET  genera una consulta a la bd
router.get("/api/empleoyes/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      mysqlConection.query("SELECT * FROM users", (err, rows, fields) => {
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
//Por el METODO GET y pasando un valor obtiene un registro por su ID
router.get("/api/empleoyes/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  mysqlConection.query(
    "select * from users where id = ?",
    [id],
    (err, rows, fields) => {
      if (!err) {
        let body = rows[0]
        response.success(req, res, false, true, body, 200)
        //res.json(rows[0]); //Muestra el resultado
      } else {
        res.json(err); //Muestra el error
      }
    }
  );
});

//Por medio del METODO PUT se actualiza un registro
router.put("/api/empleoyes/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { nombre, correo, tipo } = req.body;
  var data = "";
  var array = [];
  if (nombre) {
    if (data.length != 0) {
      data += ",";
    }
    data += "nombre= ?";
    array.push(nombre);
  }
  if (correo) {
    if (data.length != 0) {
      data += ",";
    }
    data += "correo= ?";
    array.push(correo);
  }
  if (tipo) {
    if (data.length != 0) {
      data += ",";
    }
    data += "tipo= ?";
    array.push(tipo);
  }
  console.log(data,"DATAS")
  array.push(id);
  const query = "update users set " + data + " where id =?;";
  mysqlConection.query(query, array, (err, rows, fields) => {
    if (!err) {
      let body = { status: "Actualizado" }
      response.success(req, res, false, true, body, 200)
    } else {
     // console.log(err)
    }
  });
});

//Por medio del METODO DELETE se elimina un registro
router.delete("/api/empleoyes/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  mysqlConection.query(
    "delete from users where id = ?",
    [id],
    (err, rows, fields) => {
      if (!err) {
        let body = { status: "Elimiado" }
        response.success(req, res, false, true, body, 200)
      } else {
      }
    }
  );
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
