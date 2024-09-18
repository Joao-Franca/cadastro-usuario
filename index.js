const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db.js")
const bcrypt = require('bcrypt')   //Serve para colocar um hash quando cadastra a senha


const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); 

app.use(express.static('public'));

//Rota para exibir nosso formulário de login
app.get("/login", (req, res) => {
  res.render("login");
});

//Rota para exibir nosso formulário de cadastro
app.get("/cadastro", (req, res) => {
  res.render("cadastro");
});

app.get("/cliente", (req, res) => {
  res.render("cliente");
});


//Rota para processar nosso formulário de cadastro
app.post("/cadastro", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    //gerar um salt de 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10)
    const query =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id";
    const values = [name, email, hashedPassword];
    const result = await pool.query(query, values);

    res.redirect("/login");
  } catch (err) {
    console.error("Erro ao cadastrar usuário", err);
    res.status(500).send("Erro ao cadastrar usuário");
  }
});


//Rota para renderizar clientes cadastrados
app.get("/clientes", async (req, res) => {
  let clientes = (await pool.query("SELECT * FROM clientes")).rows;
  console.log(clientes)
  res.render("clientes", { clientes });
});


app.post("/cliente", async (req, res) => {
  const { nome, endereco, cidade, cpf, rg, telefone } = req.body;
  try {
 
    const query = "INSERT INTO clientes (nome, endereco, cidade, cpf, rg, telefone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    const values = [nome, endereco, cidade, cpf, rg, telefone];
    const result = await pool.query(query, values);

    res.redirect("/clientes");
  } catch (err) {
    console.error("Erro ao cadastrar cliente", err);
    res.status(500).send("Erro ao cadastrar cliente");
  }
});


//Rota para processar formulário de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try{
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])

    if(result.rows.length > 0 ){
      const user = result.rows[0]

      //Verficica a senha fornecida corresponde a criptografada
      const isMatch = await bcrypt.compare(password, user.password)

      if(isMatch){
        res.redirect('/clientes')
      }else{
        res.status(400).send('Senha Incorreta')
      }
    }else{
      res.status(400).send('Usuário não encontrado')
    }
  }catch(err){
    console.error('Erro ao realizar o login', err);
    res.status(500).send("Erro ao processar o login.");
  }
})


// Rota para deletar cliente
app.post("/clientes/:id/delete", async (req, res) => {
  const clienteId = req.params.id;
  try {
    await pool.query("DELETE FROM clientes WHERE id = $1", [clienteId]);
    res.redirect("/clientes");  // Redireciona de volta para a lista de clientes após a exclusão
  } catch (err) {
    console.error("Erro ao deletar cliente", err);
    res.status(500).send("Erro ao deletar cliente");
  }
});


// Rota para atualizar o cliente
app.post('/clientes/:id/update', async (req, res) => {
  const clienteId = req.params.id;
  const { nome, endereco, cpf, rg, telefone } = req.body;
  
  try {
    await pool.query(
      'UPDATE clientes SET nome = $1, endereco = $2, cpf = $3, rg = $4, telefone = $5 WHERE id = $6',
      [nome, endereco, cpf, rg, telefone, clienteId]
    );
    res.redirect('/clientes'); // Redireciona para a lista de clientes após a edição
  } catch (err) {
    console.error('Erro ao atualizar cliente', err);
    res.status(500).send('Erro ao atualizar cliente');
  }
});


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000!!!");
});
