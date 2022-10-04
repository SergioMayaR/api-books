const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const response = require("../network/response");
const docx = require("docx")
const fs = require('fs');
const moment = require("moment")
const { BorderStyle } = require('docx');
const mysqlConection = require("../database"); //Importa la conexión de database

const {
    Document,
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    ImageRun,
    Media,
    Packer,
    Paragraph,
    VerticalPositionAlign,
    VerticalPositionRelativeFrom,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    Footer,
    Header,
    PageBreak,
    PageNumber,
    NumberFormat,
    TextRun
} = docx;

const imageBase64Data = "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";
//Respuesta de la ruta padre
router.get("/api/catalogos-libros/", function (req, res) {
    mysqlConection.query("SELECT libros.* FROM libros LEFT JOIN detalleCatalogo "
    +"ON libros.idLibro = detalleCatalogo.id_libro WHERE detalleCatalogo.id_libro IS NULL", (err, rows, fields) => {
            console.log(rows)
            
            if (!err) {
                //res.json(newArray); //Muestra el resultado
                
                response.success(req, res, false, true, rows, 200)
            } else {
                res.json(err); //Muestra el error
            }
        });
})

//Respuesta de la ruta padre
router.get("/api/catalogos/", function (req, res) {
    mysqlConection.query("SELECT catalogos.*,detalleCatalogo.*,libros.* FROM detalleCatalogo "
        + "INNER JOIN catalogos ON detalleCatalogo.id_catalogo = catalogos.id_catalogo "
        + "INNER JOIN libros ON libros.idLibro = detalleCatalogo.id_libro;", (err, rows, fields) => {
            console.log(err)
            var arrayGroup = {};
            console.log(rows)
            rows.forEach(x => {
                if (!arrayGroup.hasOwnProperty(x.id_catalogo)) {
                    //Si no existe generamos la propiedad
                    arrayGroup[x.id_catalogo] = {
                        "id_catalogo": x.id_catalogo,
                        "nombre": x.name,
                        "fecha": x.date,
                        "libros": []
                    };
                }

                arrayGroup[x.id_catalogo].libros.push(x);
            })
            let newArray = []
            for (var i in arrayGroup) {
                newArray.push(arrayGroup[i])
            }
            if (!err) {
                //res.json(newArray); //Muestra el resultado
                let body = newArray
                response.success(req, res, false, true, newArray, 200)
            } else {
                res.json(err); //Muestra el error
            }
        });
})
//Respuesta para la creación de catalogos
router.post("/api/catalogos/", function (req, res) {
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
    const { name, datos } = req.body;
    var fecha = moment().format('YYYY-MM-DD');
    var arrayData = [];
    const query = "INSERT INTO catalogos (name,date) VALUES (?, ?)";
    mysqlConection.query(query, [name, fecha], (err, rows, fields) => {
        if (!err) {
            var id_catalogo = rows.insertId;
            for (let i = 0; i < datos.length; i++) {
                let array = [id_catalogo, datos[i].idLibro]
                arrayData.push(array)
            }
            const query2 = "INSERT INTO detalleCatalogo (id_catalogo,id_libro) VALUES ?";
            mysqlConection.query(query2, [arrayData], (err, rows, fields) => {
                if (!err) {
                    let body = { "idCotizacion": id_catalogo }
                    response.success(req, res, false, true, body, 200)
                } else {
                }
            });
        } else {
        }
    });
})

//Por medio del METODO DELETE se elimina un registro
router.delete("/api/catalogo/:id", (req, res) => {
    /*  jwt.verify(req.token, 'secret_token', (error, authData) => {
       if (error) {
         response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
       } else { */
    const { id } = req.params;
    mysqlConection.query(
        "delete from detalleCatalogo where id_catalogo = ?",
        [id],
        (err, rows, fields) => {
            if (!err) {
                mysqlConection.query(
                    "delete from catalogos where id_catalogo = ?",
                    [id],
                    (err, rows, fields) => {
                        if (!err) {
                            let body = { status: "Elimiado" }
                            response.success(req, res, false, true, body, 200)
                        } else {
                        }
                    })
                //res.json({ status: "Elimiado" });
            } else {
            }
        }
    );
    /*  }
   }) */
});


//Respuesta de la ruta padre
router.get("/api/createCatalogo/", function (req, res) {
    let number = 497, estado = "Guanajuato", code = "GTO"
    mysqlConection.query("select * from libros where placePub=? order by tema asc", [estado], (err, rows, fields) => {
        if (!err) {
            let data = []
            var arrayGroup = {};
            rows.forEach(x => {
                if (!arrayGroup.hasOwnProperty(x.tema)) {
                    //Si no existe generamos la propiedad
                    arrayGroup[x.tema] = {
                        "tema": x.tema,
                        "libros": []
                    };
                }

                arrayGroup[x.tema].libros.push(x);
            })
            let newArray = []
            for (var i in arrayGroup) {
                newArray.push(arrayGroup[i])
            }
            const table0 = new Table({
                columnWidths: [10505, 10505],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: {
                                    size: 9105,
                                    type: WidthType.DXA,
                                },
                                height: {
                                    size: 8565
                                },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "MARTIN DE JESUS SANCHEZ ESPINOSA",
                                                color: "008f39",
                                                size: 44,
                                                bold: true,
                                                italics: true

                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "LIBROS DE TODO MEXICO",
                                                color: "2740f1",
                                                size: 36,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Río Churubusco 230 B-4",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Col. San Diego Churubusco, C.P. 04210",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Coyoacán, México, D.F.",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    //Imagen
                                    new Paragraph({
                                        children: [
                                            new ImageRun({
                                                data: fs.readFileSync("lgoDoc.png"),
                                                alignment: AlignmentType.CENTER,
                                                transformation: {
                                                    width: 200,
                                                    height: 200,
                                                }

                                            })
                                        ],
                                        alignment: AlignmentType.CENTER
                                    }),
                                    new Paragraph({

                                        children: [
                                            new TextRun({
                                                text: "Apartado Postal COM-032, CP 04831",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Apartado Postal COM-032, CP 04831",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Tel./Fax: +52 (55) 5688 - 9610",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "librosmexicanos@yahoo.com.mx",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Catalog no. " + number,
                                                color: "2740f1",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: estado,
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Retrospective & Latest Publications / March 2021",
                                                color: "520887",
                                                size: 22,
                                                bold: true,
                                                italics: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                            })
                        ],
                    })
                ],
            });
            var arrayContenido = []
            for (let i = 0; i < newArray.length; i++) {
                if (newArray[i].tema) {
                    console.log("------------------")
                    console.log("newArray[i].tema")

                    arrayContenido.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: newArray[i].tema,
                                    color: "008f39",
                                    size: 40,
                                    bold: true,
                                    italics: true
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                        })
                    )
                    for (let j = 0; j < newArray[i].libros.length; j++) {
                        console.log("#NTRO")
                        var textoCont = []
                        if (newArray[i].libros[j].autor) {
                            textoCont.push(new TextRun({
                                text: newArray[i].libros[j].autor + ".",
                                size: 22,
                            }))
                        }
                        if (newArray[i].libros[j].titulo) {
                            textoCont.push(new TextRun({
                                text: " " + newArray[i].libros[j].titulo,
                                size: 22,
                                bold: true,
                            }))
                        }
                        if (newArray[i].libros[j].editorial) {
                            textoCont.push(new TextRun({
                                text: ", " + newArray[i].libros[j].editorial,
                                size: 22
                            }))
                        }

                        if (newArray[i].libros[j].placePub) {
                            textoCont.push(new TextRun({
                                text: ", " + newArray[i].libros[j].placePub,
                                size: 22
                            }))
                        }
                        if (newArray[i].libros[j].dimensiones) {
                            textoCont.push(new TextRun({
                                text: ", Dimensiones " + newArray[i].libros[j].dimensiones,
                                size: 22
                            }))
                        }

                        if (newArray[i].libros[j].paginas) {
                            textoCont.push(new TextRun({
                                text: ", " + newArray[i].libros[j].paginas + " paginas",
                                size: 22
                            }))
                        }
                        if (newArray[i].libros[j].descripcion) {
                            textoCont.push(new TextRun({
                                text: ", " + newArray[i].libros[j].descripcion,
                                size: 22
                            }))
                        }

                        console.log(textoCont.length)
                        arrayContenido.push(
                            new Paragraph({
                                children: textoCont
                            })
                        )
                        arrayContenido.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: "497PB48                      $21.00                           Sent to: None.",
                                    size: 22,
                                    bold: true,
                                })]
                            })
                        )
                    }
                    console.log("------------------")
                }
            }
            const doc = new Document({
                sections: [
                    {
                        children: [
                            table0
                        ],
                    },
                    {
                        headers: {
                            default: new Header({
                                children: [

                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "MJSE",
                                                color: "#009948",
                                                size: 18,
                                            })],
                                        alignment: AlignmentType.CENTER
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Catalog no. 493JL  :  Jalisco.	                                                                                                                                  MJSE",
                                                alignment: AlignmentType.CENTER,
                                                color: "#009948",
                                                size: 18,
                                            })]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Apartado Postal COM-032, C.P. 04831, México, DF.                                             librosmexicanos@yahoo.com.mx",
                                                alignment: AlignmentType.CENTER,
                                                color: "#009948",
                                                size: 18,
                                            })]
                                    }),

                                    /* new Paragraph({
                                        children: [

                                            new TextRun("Foo Bar corp. "),
                                            new TextRun({
                                                children: ["Page Number ", PageNumber.CURRENT],
                                            }),
                                            new TextRun({
                                                children: [" to ", PageNumber.TOTAL_PAGES_IN_SECTION],
                                            }),
                                        ],
                                    }), */
                                ],
                            }),
                        },
                        children: arrayContenido,
                    }
                ],
            });
            Packer.toBuffer(doc).then((buffer) => {
                fs.writeFileSync("My Document.docx", buffer);
            });
            let body = rows
            //Genera la respuesta que se dara
            respuesta = {
                error: true,
                codigo: 200,
                msg: newArray
            };
            res.send(respuesta); //Envia una respuesta
        } else {
            res.json(err); //Muestra el error
        }
    });
});

module.exports = router; //Exporta la ruta