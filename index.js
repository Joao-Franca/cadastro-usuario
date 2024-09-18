const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db.js")
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); 

app.use(express.static('public'));


// Importar as rotas
const clientesRoutes = require("./routes/clientes");
const usersRoutes = require("./routes/users");

// Usar as rotas
app.use("/clientes", clientesRoutes);
app.use("/users", usersRoutes);



app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000!!!");
});
