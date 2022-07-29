const mysql = require("mysql"); //Se declara mysql
//Se genera la conexión a mysql
const mysqlConacttion = mysql.createConnection({
  host: "34.67.244.163", //Se declara el host de la bd
  user: "ptree", //Obtenemos el usuario al que se conectara
  password: "Ptree2021ñ", //Obtiene el password
  database: "Alpha", //Se hace la referencia al bd
});
//Valida que la conexión este funcionando
mysqlConacttion.connect(function (error) {
  if (error) {
    return error;
  } else {
  }
});
module.exports = mysqlConacttion; //Exporta la conexión
