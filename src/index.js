const Express = require("express");
const CorsMiddleware = require("cors");
const { initializeDB } = require("./lib/db/");
const RequestHandler = require("./lib/handlers/handlers");

const API = Express();

//*Settings
API.set("port", process.env.PORT || 5000);

//*Middleware
//*retorna formato json del body de cualquier request
API.use(Express.json()); //* Express.json => return (req, res, next) => (), 

API.use(Express.urlencoded({ extended: false })); //*Transforma los datos de campo-valor de un formulario y lo va a pasar a json 

//*For security reasons we need to add cors middleware
API.use(CorsMiddleware());

//* localhost:5000/v1/to-dos
API.use("/api/v1", RequestHandler);

//* starting the server
API.listen(API.get("port"), () => {
  console.log(`Server on port ${API.get("port")}`);

  //*Inicializar la base de datos
  initializeDB().then(() => {
    console.log("DATABASE READY");
  });
});
