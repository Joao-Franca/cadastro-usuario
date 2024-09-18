const express = require("express");
const router = express.Router();
const pool = require("../db.js")
const bcrypt = require('bcrypt')   //Serve para colocar um hash quando cadastra a senha

//Rota para exibir nosso formulário de login
router.get("/", (req, res) => {
    res.render("login");
  });
  
  //Rota para exibir nosso formulário de cadastro
  router.get("/cadastro", (req, res) => {
    res.render("cadastro");
  });

 
 
  //Rota para processar formulário de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try{
      const query = 'SELECT * FROM users WHERE email = $1'
      const result = await pool.query(query, [email])
  
      if(result.rows.length > 0 ){
        const user = result.rows[0]
  
        //Verficica a senha fornecida corresponde a criptografada
        const isMatch = await bcrypt.compare(password, user.password)
  
        if(isMatch){
          res.redirect('/clientes/clientes')
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
  

    //Rota para processar nosso formulário de cadastro
router.post("/cadastro", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      //gerar um salt de 10 rounds
      const hashedPassword = await bcrypt.hash(password, 10)
      const query =
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id";
      const values = [name, email, hashedPassword];
      const result = await pool.query(query, values);
  
      res.redirect("/users/");
    } catch (err) {
      console.error("Erro ao cadastrar usuário", err);
      res.status(500).send("Erro ao cadastrar usuário");
    }
  });

  module.exports = router
