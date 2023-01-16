const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const response = require("../network/response");
const mysqlConection = require("../database"); //Importa la conexión de database
const jwt = require("jsonwebtoken");
const multer = require("multer")
const fs = require("fs");/* 
var storage = multer.memoryStorage()
const upload = multer({ storage: storage }) */

const upload = multer({ dest: 'uploads/' })


const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }])
const cpUploadLibros = upload.fields([{ name: 'portada', maxCount: 1 }, { name: 'contraportada', maxCount: 1 }])
//Por el METODO GET  genera una consulta a la bd
router.get("/api/libros/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      mysqlConection.query("SELECT * FROM libros", (err, rows, fields) => {
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
router.get("/api/libros/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      const { id } = req.params;
      mysqlConection.query(
        "select * from libros where idLibro = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            let body = rows[0]
            console.log(body)
            //if(body["pathImgPortada"]){
            //const base64 = fs.readFileSync("lgoDoc.png", "base64");
            //}
            //console.log(base64)
            response.success(req, res, false, true, body, 200)
            //res.json(rows[0]); //Muestra el resultado
          } else {
            res.json(err); //Muestra el error
          }
        });
    }
  })
});
//Por el METODO GET y pasando un valor obtiene un registro por su ID
router.get("/api/historialLibros/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {

      const { id } = req.params;
      mysqlConection.query(
        "Select cotizacionCliente.*,detalleCotizacion.*,cliente.*from cotizacionCliente " +
        "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente " +
        "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion " +
        "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where libros.idLibro = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            let body = rows
            response.success(req, res, false, true, body, 200)
            //res.json(rows[0]); //Muestra el resultado
          } else {
            res.json(err); //Muestra el error
          }
        }
      );
    }
  })
});

//Por el METODO POST Guarda un nuevo registro dentro de la BD
router.post("/api/libros/", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      let query = ""
      var { isbn, titulo, autor, editorial, anio, descripcion, fecha, idProv, numFact, placePub, precio, issn, tipo, numRevista } = req.body;
      if (!issn) {
        issn = " "
      }
      if (!isbn) {
        isbn = " "
      }
      if (tipo == "Libro") {
        query = ' tipo ="Libro" and anio = "' + anio + '" and isbn like "%' + isbn + '%"'
      } else {
        query = ' tipo ="Revista" and anio = "' + anio + '" and issn like "%' + issn + '%" and numRevista="' + numRevista + '"';
      }
      mysqlConection.query("SELECT * FROM libros where" + query, (err, rows, fields) => {
        if (!err) {
          let flag = false;
          //res.send("Enviado");
          for (let i = 0; i < rows.length; i++) {
            if (tipo == "Libro") {
              let split = rows[i].isbn.split(";")
              for (let j = 0; j < split.length; j++) {
                let replace = split[j].replace("/ /g", "")
                if (replace == isbn) {
                  flag = true;
                  break;
                }
              }
            } else {
              let split = rows[i].issn.split(";")
              for (let j = 0; j < split.length; j++) {
                let replace = split[j].replace("/ /g", "")
                if (replace == issn) {
                  flag = true;
                  break;
                }
              }
            }
          }
          if (flag) {
            body = {
              error: "El libro ya fue agregado"
            }
            response.error(req, res, true, false, body, 403, "Error")
          } else {
            var dataBody = req.body;
            var dataColums = "";
            var dataColumsVal = ""
            var array = [];
            for (var i in dataBody) {
              if (dataBody[i]) {
                if (dataColums.length != 0) {
                  dataColums += ",";
                  dataColumsVal += ",";
                }
                dataColums += " " + i;
                dataColumsVal += " ?";
                array.push(dataBody[i]);
              } else if (i == "paginas" || i == "numCopias") {
                if (dataColums.length != 0) {
                  dataColums += ",";
                  dataColumsVal += ",";
                }
                dataColums += " " + i;
                dataColumsVal += " ?";
                array.push(null);
              } else {
                if (dataColums.length != 0) {
                  dataColums += ",";
                  dataColumsVal += ",";
                }
                dataColums += " " + i;
                dataColumsVal += " ?";
                array.push("");
              }
            }

            const query = "INSERT INTO libros (" + dataColums + ") VALUES (" + dataColumsVal + ")";
            mysqlConection.query(query, array, (err, rows, fields) => {
              if (!err) {
                //res.send("Enviado");
                let body = { estatus: "Enviado" }
                response.success(req, res, false, true, body, 200)
              } else {
                res.json(err); //Muestra el error
              }
            });
          }
        } else {
          res.json(err); //Muestra el error
        }
      })
      /*  */
    }
  })
});

//Por el METODO POST Guarda un nuevo registro dentro de la BD
//router.post("/api/libros/", verifyToken, (req, res) => {
router.post("/api/addImagelibro/", cpUpload, (req, res) => {
  var { id } = req.body
  req.body.imge = {
    mimetype: req.files["image"][0].mimetype,
    originalname: req.files["image"][0].originalname
  }

  fs.renameSync(req.files["image"][0].path, "uploads/" + req.files["image"][0].originalname)
  /* jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      
    }
  }) */
  let body = { estatus: "Enviado", path: __dirname, paht1: req.files["image"][0].path }
  response.success(req, res, false, true, body, 200)
});

//Por medio del METODO PUT se actualiza un registro
router.put("/api/libros/:isbn", verifyToken, cpUploadLibros, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      mysqlConection.query('UPDATE libros SET pathImgPortada= null WHERE pathImgPortada= "null" OR pathImgPortada= ""', (err, rows, fields) => {
        if (!err) {
          mysqlConection.query('UPDATE libros SET pathImgContraportada= null WHERE pathImgContraportada= "null" OR pathImgContraportada= ""', (err, rows, fields) => {
            if (!err) {
              const { isbn } = req.params;
              mysqlConection.query(
                "select * from libros where idLibro = ?",
                [isbn],
                (err, dataConsulta, fields) => {
                  if (!err) {
                    if (dataConsulta[0]["pathImgPortada"]) {
                      if (req.files["portada"]) {
                        fs.unlinkSync("uploads/" + dataConsulta[0]["pathImgPortada"])
                      }
                    }

                    if (dataConsulta[0]["pathImgContraportada"]) {
                      if (req.files["contraportada"]) {
                        fs.unlinkSync("uploads/" + dataConsulta[0]["pathImgContraportada"])
                      }
                    }

                    var dataBody = req.body;
                    var data = "";
                    var array = [];
                    for (var i in dataBody) {
                      if (dataBody[i] != "" && dataBody[i] != null && dataBody[i] != "null" && dataBody[i] != undefined ) {
                        if (data.length != 0) {
                          data += ",";
                        }
                        data += i + "= ?";
                        array.push(dataBody[i]);
                      } else if (i == "paginas" || i == "numCopias") {
                        if (data.length != 0) {
                          data += ",";
                        }
                        data += i + "= ?";
                        array.push(null);


                      } else {
                        if (data.length != 0) {
                          data += ",";
                        }
                        data += i + "= ?";
                        array.push("");
                      }
                    }
                    if (req.files) {
                      console.log("------req.files--------")
                      if (req.files["portada"]) {
                        let typeSplit = req.files["portada"][0].originalname.split(".")
                        let type = typeSplit[typeSplit.length - 1]
                        let path = "uploads/portada" + isbn + "." + type
                        fs.renameSync(req.files["portada"][0].path, path)
                        if (data.length != 0) {
                          data += ",";
                        }
                        data += "pathImgPortada = ?";
                        array.push("portada" + isbn + "." + type);

                      }
                      if (req.files["contraportada"]) {
                        let typeSplit = req.files["contraportada"][0].originalname.split(".")
                        let type = typeSplit[typeSplit.length - 1]
                        console.log(type)
                        let path = "uploads/contraportada" + isbn + "." + type

                        fs.renameSync(req.files["contraportada"][0].path, path)
                        if (data.length != 0) {
                          data += ",";
                        }
                        data += "pathImgContraportada = ?";
                        array.push("contraportada" + isbn + "." + type);
                      }
                    }
                    array.push(isbn);
                    console.log(data)
                    const query = "update libros set " + data + " where idLibro =?;";
                    mysqlConection.query(query, array, (err, rows, fields) => {
                      if (!err) {
                        let body = { status: "Actualizado",dataFiles: req.files,data:req.body}
                        response.success(req, res, false, true, body, 200)
                      } else {
                        console.log(err)
                      }
                    });
                  } else {
                    res.json(err); //Muestra el error
                  }
                });
            }
          })
        }
      })
    }
  })
});

//Por medio del METODO DELETE se elimina un registro
router.delete("/api/libros/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret_token', (error, authData) => {
    if (error) {
      response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    } else {
      const { id } = req.params;
      mysqlConection.query(
        "delete from libros where idLibro = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            let body = { status: "Elimiado" }
            response.success(req, res, false, true, body, 200)
            //res.json({ status: "Elimiado" });
          } else {
          }
        }
      );
    }
  })
});// Authorization: Bearer <token>


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
