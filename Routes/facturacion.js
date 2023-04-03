const express = require("express"); //Declara express
const router = express.Router(); //Obtiene las rutas
const mysqlConection = require("../database"); //Importa la conexión de database
const response = require("../network/response");
const moment = require("moment")
const jwt = require("jsonwebtoken");
var xl = require('excel4node');
const url = require('url');
//Por el METODO GET  genera una consulta a la bd
const { ToWords } = require('to-words');
const toWords = new ToWords({
    localeCode: 'en-US',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
    }
});

router.get("/api/allDataFacturas/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {

        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            var dataAllFacturacion={}
            mysqlConection.query("select cotizacionCliente.*,detalleCotizacion.*,libros.*,cliente.* from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente " +
                "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion " +
                "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where cotizacionCliente.estatus = 'Facturada'", (err, rows, fields) => {
                    var arrayGroup = {};
                    rows.forEach(x => {
                        if (!arrayGroup.hasOwnProperty(x.id_cotizacion)) {
                            //Si no existe generamos la propiedad
                            arrayGroup[x.id_cotizacion] = {
                                "id_cotizacion": x.id_cotizacion,
                                "id_cliente": x.id_cliente,
                                "fecha_cotizacion": x.fecha_cotizacion,
                                "estatus": x.estatus,
                                "idFactura": x.idFactura,
                                "fecha_facturada": x.fecha_facturada,
                                "idcliente": x.idcliente,
                                "nombre": x.nombre,
                                "direccion":x.calle +" "+ x.numero +" "+ x.codigoPostal + " "+x.ciudad + " " +x.estado,
                                "calle": x.calle,
                                "numero": x.numero,
                                "codigoPostal": x.codigoPostal,
                                "ciudad": x.ciudad,
                                "estado": x.estado,
                                "telefono": x.telefono,
                                "email": x.email,
                                "libros": []
                            };
                        }

                        arrayGroup[x.id_cotizacion].libros.push(x);
                    })
                    let newArray = []
                    for (var i in arrayGroup) {
                        newArray.push(arrayGroup[i])
                    }
                    dataAllFacturacion.facturacion=newArray;
                    if (!err) {
                        mysqlConection.query("SELECT *, CONCAT(calle,' ', numero,' ',codigoPostal,' ',ciudad,' ',estado)  As direccion FROM cliente ", (err, rows, fields) => {
                            if (!err) {
                              //res.json(rows); //Muestra el resultado
                              dataAllFacturacion.clientes=rows;
                              mysqlConection.query("SELECT * FROM libros", (err, rows, fields) => {
                                if (!err) {
                                  let body = rows
                                  dataAllFacturacion.libros=rows;
                                  response.success(req, res, false, true, dataAllFacturacion, 200)
                                  //res.json(rows); //Muestra el resultado
                                } else {
                                  res.json(err); //Muestra el error
                                }
                              });
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
router.get("/api/facturas/", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {

        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            mysqlConection.query("select cotizacionCliente.*,detalleCotizacion.*,libros.*,cliente.* from cotizacionCliente " +
                "INNER JOIN cliente ON cotizacionCliente.id_cliente = cliente.idcliente " +
                "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion " +
                "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where cotizacionCliente.estatus = 'Facturada'", (err, rows, fields) => {
                    var arrayGroup = {};
                    rows.forEach(x => {
                        if (!arrayGroup.hasOwnProperty(x.id_cotizacion)) {
                            //Si no existe generamos la propiedad
                            arrayGroup[x.id_cotizacion] = {
                                "id_cotizacion": x.id_cotizacion,
                                "id_cliente": x.id_cliente,
                                "fecha_cotizacion": x.fecha_cotizacion,
                                "estatus": x.estatus,
                                "idFactura": x.idFactura,
                                "fecha_facturada": x.fecha_facturada,
                                "idcliente": x.idcliente,
                                "nombre": x.nombre,
                                "direccion":x.calle +" "+ x.numero +" "+ x.codigoPostal + " "+x.ciudad + " " +x.estado,
                                "calle": x.calle,
                                "numero": x.numero,
                                "codigoPostal": x.codigoPostal,
                                "ciudad": x.ciudad,
                                "estado": x.estado,
                                "telefono": x.telefono,
                                "email": x.email,
                                "libros": []
                            };
                        }

                        arrayGroup[x.id_cotizacion].libros.push(x);
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
        }
    })
});

router.get("/api/facturas/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("select detalleCotizacion.*,libros.* from cotizacionCliente "
                + "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion "
                + "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro where cotizacionCliente.id_cotizacion = " + id, (err, rows, fields) => {
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

router.put("/api/factura/:id", verifyToken, (req, res) => {
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
                        data2 = "", array2 = [];
                        if (!err) {

                            data2 += "estatus= ?,";
                            array2.push("Facturada");

                            data2 += "idFactura= ?,";
                            array2.push(number);

                            data2 += "fecha_facturada= ? ";
                            array2.push(moment().format("YYYY-MM-DD"));

                            array2.push(id);
                            const query2 = "update cotizacionCliente set " + data2 + " where id_cotizacion =?;";
                            mysqlConection.query(query2, array2, (err, rows, fields) => {
                                if (!err) {
                                    //res.json({ factura: number });
                                    let body = { factura: number }
                                    response.success(req, res, false, true, body, 200)
                                } else {
                                }
                            });
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

router.get('/api/excel', async (req, res, next) => {
    var wb = new xl.Workbook({
        defaultFont: {
            size: 12,
            name: 'Times New Roman',
            color: '#000000',
        },
    });

    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');


    res.setHeader("Content-Disposition", "attachment;filename=" + 'excel.xlsx')
    // do some stuff
    wb.write('excel.xlsx', res);
});

router.get("/api/excelPedido/:id", verifyTokenParas, (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    jwt.verify(queryObject["token"], 'secret_token', (error, authData) => {
        if (error) {
            console.log(error)
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("select detalleCotizacion.*,libros.*,cliente.* from cotizacionCliente "
                + "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion "
                + "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro "
                + "INNER JOIN cliente ON cliente.idcliente= cotizacionCliente.id_cliente "
                + "where cotizacionCliente.id_cotizacion = " + id, (err, rows, fields) => {
                    var arrayGroup = {};
                    rows.forEach(x => {
                        if (!arrayGroup.hasOwnProperty(x.id_cotizacion)) {
                            //Si no existe generamos la propiedad
                            arrayGroup[x.id_cotizacion] = {
                                "id_cotizacion": x.id_cotizacion,
                                "id_cliente": x.id_cliente,
                                "fecha_cotizacion": x.fecha_cotizacion,
                                "estatus": x.estatus,
                                "idFactura": x.idFactura,
                                "fecha_facturada": x.fecha_facturada,
                                "idcliente": x.idcliente,
                                "nombre": x.nombre,
                                "calle": x.calle,
                                "numero": x.numero,
                                "codigoPostal": x.codigoPostal,
                                "ciudad": x.ciudad,
                                "estado": x.estado,
                                "telefono": x.telefono,
                                "email": x.email,
                                "libros": []
                            };
                        }

                        arrayGroup[x.id_cotizacion].libros.push(x);
                    })
                    let newArray = []
                    for (var i in arrayGroup) {
                        newArray.push(arrayGroup[i])
                    }
                    if (!err) {
                        let body = createExcelPedido(newArray[0].libros, res, newArray[0]);
                        
                        //response.success(req, res, false, true, {body:body}, 200)
                    } else {
                        res.json(err); //Muestra el error
                    }
                });
        }
    })
});

router.get("/api/excelContrato/:id", verifyTokenParas, (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    jwt.verify(queryObject["token"], 'secret_token', (error, authData) => {
        if (error) {
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("select detalleCotizacion.*,libros.*,cliente.* from cotizacionCliente "
                + "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion "
                + "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro "
                + "INNER JOIN cliente ON cliente.idcliente= cotizacionCliente.id_cliente "
                + "where cotizacionCliente.id_cotizacion = " + id, (err, rows, fields) => {
                    var arrayGroup = {};
                    rows.forEach(x => {
                        if (!arrayGroup.hasOwnProperty(x.id_cotizacion)) {
                            //Si no existe generamos la propiedad
                            arrayGroup[x.id_cotizacion] = {
                                "id_cotizacion": x.id_cotizacion,
                                "id_cliente": x.id_cliente,
                                "fecha_cotizacion": x.fecha_cotizacion,
                                "estatus": x.estatus,
                                "idFactura": x.idFactura,
                                "fecha_facturada": x.fecha_facturada,
                                "idcliente": x.idcliente,
                                "nombre": x.nombre,
                                "calle": x.calle,
                                "numero": x.numero,
                                "codigoPostal": x.codigoPostal,
                                "ciudad": x.ciudad,
                                "estado": x.estado,
                                "telefono": x.telefono,
                                "email": x.email,
                                "libros": []
                            };
                        }

                        arrayGroup[x.id_cotizacion].libros.push(x);
                    })
                    let newArray = []
                    for (var i in arrayGroup) {
                        newArray.push(arrayGroup[i])
                    }
                    if (!err) {
                        let body = createExcelContrato(newArray[0].libros, res, newArray[0]);
                        //response.success(req, res, false, true, {body:body}, 200)
                    } else {
                        res.json(err); //Muestra el error
                    }
                });
        }
    })
});

router.get("/api/marc21/:id", verifyTokenParas, (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    jwt.verify(queryObject["token"], 'secret_token', (error, authData) => {
        if (error) {
            console.log(error)
            response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
        } else {
            const { id } = req.params;
            mysqlConection.query("select detalleCotizacion.*,libros.*,cliente.*, cotizacionCliente.* from cotizacionCliente "
                + "INNER JOIN detalleCotizacion ON cotizacionCliente.id_cotizacion = detalleCotizacion.id_cotizacion "
                + "INNER JOIN libros ON libros.idLibro = detalleCotizacion.id_libro "
                + "INNER JOIN cliente ON cliente.idcliente= cotizacionCliente.id_cliente "
                + "where cotizacionCliente.id_cotizacion = " + id, (err, rows, fields) => {
                    var arrayGroup = {};
                    rows.forEach(x => {
                        if (!arrayGroup.hasOwnProperty(x.id_cotizacion)) {
                            //Si no existe generamos la propiedad
                            arrayGroup[x.id_cotizacion] = {
                                "id_cotizacion": x.id_cotizacion,
                                "id_cliente": x.id_cliente,
                                "fecha_cotizacion": x.fecha_cotizacion,
                                "estatus": x.estatus,
                                "idFactura": x.idFactura,
                                "fecha_facturada": x.fecha_facturada,
                                "idcliente": x.idcliente,
                                "nombre": x.nombre,
                                "calle": x.calle,
                                "numero": x.numero,
                                "codigoPostal": x.codigoPostal,
                                "ciudad": x.ciudad,
                                "estado": x.estado,
                                "telefono": x.telefono,
                                "email": x.email,
                                "libros": []
                            };
                        }

                        arrayGroup[x.id_cotizacion].libros.push(x);
                    })
                    let newArray = []
                    for (var i in arrayGroup) {
                        newArray.push(arrayGroup[i])
                    }
                    if (!err) {
                        let libros = newArray[0].libros;
                        let nameTxt = "Factura " + newArray[0].id_cotizacion;
                        let contenidoMarc = "";
                        console.log(newArray)
                        console.log(newArray[0]["libros"])
                        for (let i = 0; i < libros.length; i++) {
                            let libro = libros[i];
                            const regex = /^(El\s|EL\s|el\s|La\s|la\s|LA\s|Las\s|LAS\s|las\s|los\s|Los\s|LOS\s)/g
                            libro.titulo=libro.titulo.replace(regex,"")
                            
                            let dataMarc = [
                                ['=LDR 00457nam a2200121Ia 4500'], //0 
                                ['\n=008  220425?'+moment().format("YYYY")+'\\\\\\\\MX\\\\\\\\\\\\\\\\\\\\\\\\000\\0\\SPA\\d'], // 1
                                ['\n=020  \\\\$a '], //2 ISBN   
                                ['\n=040  \\\\$a mx'], //3
                                ['\n=100  1\\$a '], //4 AUTOR
                                ['\n=245  10$a '], //5 TITULO
                                ['\n=260  2\\$a '], //6 CADENA DE TEXTO
                                ['\n=300  \\\\$a '], //7 DESCRIP FISICA
                                ['\n=980  '] //8 FACTURA FECHA ANIO MES DIA
                            ]

                            dataMarc[2] = libro.isbn ? dataMarc[2] + libro.isbn : dataMarc[2] + '';

                            //dataMarc[2] = libro.issn ? dataMarc[2] + libro.issn : dataMarc[2] + '';

                            //dataMarc[5] = libro.code_country ? dataMarc[5] + libro.code_country : dataMarc[5] + 'MX';

                            dataMarc[4] = libro.autor ? dataMarc[4] + libro.autor+"." : dataMarc[4] + '';

                            dataMarc[5] = libro.titulo ? dataMarc[5] + libro.titulo+ '.' : dataMarc[5] + '';

                            let pub = libro.placePub ? "" + libro.placePub + ' ' : '';
                            pub = libro.editorial ? pub + "$b" + libro.editorial + ' ' : pub;
                            pub = libro.anio ? pub + '$c ' + libro.anio + '' : pub;
                            dataMarc[6] = pub ? dataMarc[6] + pub + ".": dataMarc[6] + '';
                            console.log(libro.descripcion)
                            if(!libro.descripcion){
                                libro.descripcion=""
                            }

                            //dataMarc[7] = libro.descripcion ? dataMarc[7] + libro.descripcion+ '.' : dataMarc[7] + '';
                            dataMarc[7] = libro.paginas ? dataMarc[7] + libro.paginas+ '.' : dataMarc[7] + ' ';
                            dataMarc[7] = libro.nota ? dataMarc[7] + libro.nota+ '.' : dataMarc[7] + ' ';
                            dataMarc[7] = libro.dimensiones ? dataMarc[7] + libro.dimensiones+ '.' : dataMarc[7] + ' ';
                            
                            //dataMarc[10] = libro.anio ? dataMarc[10] + libro.anio : dataMarc[10] + '';
                            //dataMarc[11] = libro.nota ? dataMarc[11] + libro.nota : dataMarc[11] + '';
                            dataMarc[8] = dataMarc[8] + '\\\\$b' + moment(libro.fecha_cotizacion).format("YYYYMMDD") + '$f' + newArray[0].id_cotizacion + "$s" + libro.precio;

                            if(!libro.descripcion){
                                dataMarc.splice(7,1)
                            }
                            const reducer = (acumulator, curr) => acumulator + curr;
                            let contenidoLibroMarc = dataMarc.reduce(reducer);
                            contenidoLibroMarc = contenidoLibroMarc + '\n'

                            contenidoMarc = contenidoMarc + contenidoLibroMarc + '\n'

                        }

                        //let body = createExcelPedido(newArray[0].libros, res, newArray[0]);
                        res.setHeader("Content-disposition", "attachment; filename="+nameTxt+".txt");
                        res.setHeader("Content-type", "text/plain");
                        res.charset = "UTF-8";
                        res.write(contenidoMarc);
                        res.end();
                        // response.success(req, res, false, true, { body: contenidoMarc }, 200)
                    } else {
                        res.json(err); //Muestra el error
                    }
                });
        }
    })
});

// Authorization: Bearer <token>
function verifyToken(req, res, next) {
    console.log(req.headers)
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    }
}

function verifyTokenParas(req, res, next) {
    const queryObject = url.parse(req.url, true).query;

    const bearerHeader = queryObject["token"];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        response.error(req, res, true, false, "Prohibido", 403, "Prohibido")
    }
}

function createExcelPedido(data, res, facturacion) {
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook({
        defaultFont: {
            size: 10,
            name: 'Times New Roman',
            color: '#000000',
        },
    });

    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    const top = {
        border: {
            top: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const bottom = {
        border: {
            bottom: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const right = {
        border: {
            right: {
                style: "thin",
                color: "#030303"
            }
        }
    }

    const left = {
        border: {
            left: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const centerText = {
        alignment: { // §18.8.1
            horizontal: 'center'
        }
    }
    const rigthText = {
        alignment: { // §18.8.1
            horizontal: 'right'
        }
    }
    const bold = {
        font: {
            bold: true
        }
    }
    const price = {
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    }
    ws.column(2).setWidth(18);
    ws.column(3).setWidth(50);
    //(ROW,COL)
    ws.cell(2, 1).string('Date:').style(centerText)
    let today = moment().format("DD-MMMM-YYYY");
    today = today.replace("-", " ").replace("-", " ");

    ws.cell(2, 2).string(today).style(centerText)
    ws.cell(2, 3).string('Invoice number:').style(rigthText)
    ws.cell(2, 4).number(facturacion.id_cotizacion).style(rigthText)
    ws.cell(7, 3).string('As per your order (prices are in American dollars).').style(centerText)

    ws.cell(3, 1).string(facturacion.nombre)
    ws.cell(4, 1).string( facturacion.numero+ " "+ facturacion.calle)
    ws.cell(5, 1).string(facturacion.ciudad +", "+facturacion.estado+". "+facturacion.codigoPostal)

    ws.cell(3, 1).style(top).style(left)
    ws.cell(4, 1).style(left)
    ws.cell(5, 1).style(left)

    ws.cell(6, 1).style(left)
    ws.cell(3, 2).style(top)
    ws.cell(3, 3).style(top)

    ws.cell(3, 4).style(top).style(right)
    ws.cell(4, 4).style(right)
    ws.cell(5, 4).style(right)

    ws.cell(6, 1).style(bottom)
    ws.cell(6, 2).style(bottom)
    ws.cell(6, 3).style(bottom)
    ws.cell(6, 4).style(bottom).style(right)

    ws.cell(8, 1).string('Quantity').style(top).style(bottom).style(centerText).style(bold)
    ws.cell(8, 2).string('Order number').style(top).style(bottom).style(centerText).style(bold)
    ws.cell(8, 3).string('Titles').style(top).style(bottom).style(centerText).style(bold)
    ws.cell(8, 4).string('Unit Price').style(top).style(bottom).style(rigthText).style(bold)
    let sumTotal = 0
    let row = 9;

    for (let i = 0; i < data.length; i++) {
        ws.cell(row, 1).number(data[i].cantidad)
        ws.cell(row, 2).string("").style(centerText)
        ws.cell(row, 3).string(data[i].titulo).style({ alignment: { wrapText: true}})
        ws.cell(row, 4).number(parseFloat(data[i].precio)).style(price)
        sumTotal += parseFloat(data[i].precio)
        row++
    }
    ws.cell(row, 1).formula('SUM(A9:A' + (row - 1) + ")")
    ws.cell(row, 3).string('Subtotal').style(rigthText).style(bold)
    ws.cell(row, 4).formula('SUM(D9:D' + (row - 1) + ")").style(top).style(rigthText).style(bold).style(price)
    let totalSum = "D" + (row) + ":D"
    row++
    ws.cell(row, 3).string('Shipping').style(rigthText).style(bold)
    //let Shipping=0.15

    ws.cell(row, 4).formula("D" + (row - 1) + "*15%").style(rigthText).style(price)
    totalSum = totalSum + row
    row++
    ws.cell(row, 3).string('Total').style(rigthText).style(bold)
    ws.cell(row, 4).formula('SUM(' + totalSum + ')').style(price)
    row++
    sumIva = sumTotal + (sumTotal * 0.15)
    var numss = toWords.convert(sumIva);
    ws.cell(row, 3).string(numss).style(bold).style(centerText)
    row = row + 2
    ws.cell(row, 3).string("Makes all checks payable to:").style(bold).style(centerText)
    row = row + 2
    ws.cell(row, 3).string("Martín de Jesús Sánchez Espinosa").style(bold).style(centerText)
    row++
    ws.cell(row, 3).string("MJSE").style(bold).style(centerText)
    row = row + 6;
    ws.cell(row, 3).string("THANK YOU FOR YOUR BUSINESS!").style(bold).style(centerText)
    ws.cell(row, 1).style(bottom)
    ws.cell(row, 2).style(bottom)
    ws.cell(row, 3).style(bottom)
    ws.cell(row, 4).style(bottom)
    wb.write("Contrato " + facturacion.id_cotizacion + ".xlsx", res);
}

function createExcelContrato(data, res, facturacion) {
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook({
        defaultFont: {
            size: 10,
            name: 'Times New Roman',
            color: '#000000',
        },
    });

    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    const top = {
        border: {
            top: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const bottom = {
        border: {
            bottom: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const right = {
        border: {
            right: {
                style: "thin",
                color: "#030303"
            }
        }
    }

    const left = {
        border: {
            left: {
                style: "thin",
                color: "#030303"
            }
        }
    }
    const centerText = {
        alignment: { // §18.8.1
            horizontal: 'center'
        }
    }
    const rigthText = {
        alignment: { // §18.8.1
            horizontal: 'right'
        }
    }
    const bold = {
        font: {
            bold: true
        }
    }
    const price = {
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    }
    ws.column(2).setWidth(60);
    //(ROW,COL)
    ws.cell(2, 1).string('Date:').style(centerText)
    let today = moment().format("DD-MMMM-YYYY");
    today = today.replace("-", " ").replace("-", " ")
    ws.cell(2, 2).string(today + '                                                      Invoice number:')
    ws.cell(2, 3).number(facturacion.id_cotizacion).style(rigthText)
    ws.cell(7, 2).string('As per your order (prices are in American dollars).').style(centerText)

    ws.cell(3, 1).string(facturacion.nombre)
    ws.cell(4, 1).string( facturacion.numero+ " "+ facturacion.calle)
    ws.cell(5, 1).string(facturacion.ciudad +", "+facturacion.estado+". "+facturacion.codigoPostal)

    ws.cell(3, 1).style(top).style(left)
    ws.cell(4, 1).style(left)
    ws.cell(5, 1).style(left)

    ws.cell(6, 1).style(left)
    ws.cell(3, 2).style(top)
    ws.cell(3, 3).style(top)

    ws.cell(3, 3).style(top).style(right)
    ws.cell(4, 3).style(right)
    ws.cell(5, 3).style(right)

    ws.cell(6, 1).style(bottom)
    ws.cell(6, 2).style(bottom)
    ws.cell(6, 3).style(bottom)
    ws.cell(6, 3).style(right)

    ws.cell(8, 1).string('Quantity').style(top).style(bottom).style(centerText).style(bold)
    //ws.cell(8, 2).string('Order number').style(top).style(bottom).style(centerText).style(bold)
    ws.cell(8, 2).string('Titles').style(top).style(bottom).style(centerText).style(bold)
    ws.cell(8, 3).string('Unit Price').style(top).style(bottom).style(rigthText).style(bold)
    let sumTotal = 0
    let row = 9;

    for (let i = 0; i < data.length; i++) {
        ws.cell(row, 1).number(data[i].cantidad)
        //ws.cell(row, 2).string("").style(centerText)
        ws.cell(row, 2).string(data[i].titulo).style({ alignment: { wrapText: true}})
        ws.cell(row, 3).number(parseFloat(data[i].precio)).style(price)
        sumTotal += parseFloat(data[i].precio)
        row++
    }
    ws.cell(row, 1).formula('SUM(A9:A' + (row - 1) + ")")
    ws.cell(row, 2).string('Subtotal').style(rigthText).style(bold)
    ws.cell(row, 3).formula('SUM(C9:C' + (row - 1) + ")").style(top).style(rigthText).style(bold).style(price)
    let totalSum = "C" + (row) + ":C"
    row++
    ws.cell(row, 2).string('Shipping').style(rigthText).style(bold)
    //let Shipping=0.15

    ws.cell(row, 3).formula("C" + (row - 1) + "*15%").style(rigthText).style(price)
    totalSum = totalSum + row
    row++
    ws.cell(row, 2).string('Total').style(rigthText).style(bold)
    ws.cell(row, 3).formula('SUM(' + totalSum + ')').style(price)
    row++
    sumIva = sumTotal + (sumTotal * 0.15)
    var numss = toWords.convert(sumIva);
    ws.cell(row, 2).string(numss).style(bold).style(centerText)
    row = row + 2
    ws.cell(row, 2).string("Makes all checks payable to:").style(bold).style(centerText)
    row = row + 2
    ws.cell(row, 2).string("Martín de Jesús Sánchez Espinosa").style(bold).style(centerText)
    row++
    ws.cell(row, 2).string("MJSE").style(bold).style(centerText)
    row = row + 6;
    ws.cell(row, 2).string("THANK YOU FOR YOUR BUSINESS!").style(bold).style(centerText)
    ws.cell(row, 1).style(bottom)
    ws.cell(row, 2).style(bottom)
    ws.cell(row, 3).style(bottom)
    wb.write("Pedido " + facturacion.id_cotizacion + ".xlsx", res);
}
//Ageragr PUT para actualizar alguna factura, actualizar cotización
module.exports = router; //Exporta la ruta