const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());

var port = process.env.PORT || 8000; //Obtenemos el puerto por donde se conecta
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//para poder trabajar con las cookies
app.use(cookieParser())


 //Respuesta de la ruta padre
app.get('/', function(req, res) {
    //Genera la respuesta que se dara
    respuesta = {
        error: true,
        codigo: 200,
        mensaje: 'Punto de inicio'
    };
    res.send(respuesta); //Envia una respuesta
}); 

app.get('/api/img/:img', function(req, res){
    const { img } = req.params;
    res.sendFile( __dirname+`/uploads/${img}` );
});

app.use(require("./Routes/authController")); //Genera una ruta para llamarla;
app.use(require("./Routes/empleoyes")); //Genera una ruta para llamarla;
app.use(require("./Routes/libros")); //Genera una ruta para llamarla;
app.use(require("./Routes/editoriales")); //Genera una ruta para llamarla;
app.use(require("./Routes/filters")); //Genera una ruta para llamarla;
app.use(require("./Routes/clientes")); //Genera una ruta para llamarla;
app.use(require("./Routes/contadores")); //Genera una ruta para llamarla;
app.use(require("./Routes/cotizaciones")); //Genera una ruta para llamarla;
app.use(require("./Routes/facturacion")); //Genera una ruta para llamarla;
app.use(require("./Routes/catalogos")); //Genera una ruta para llamarla;

//Para eliminar la cache 
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
console.log(port);//Se imprime el puerto donde se ubica
app.listen(port); //llama el puerto