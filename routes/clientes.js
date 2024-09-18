const express = require("express");
const router = express.Router();
const pool = require("../db.js")


  //Rota para cadastrar clientes
  router.get("/cliente", (req, res) => {
    res.render("cliente");
  });


    //Rota para cadastrar um cliente
router.post("/cliente", async (req, res) => {
    const { nome, endereco, cidade, cpf, rg, telefone } = req.body;
    try {
   
      const query = "INSERT INTO clientes (nome, endereco, cidade, cpf, rg, telefone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
      const values = [nome, endereco, cidade, cpf, rg, telefone];
      const result = await pool.query(query, values);
  
      res.redirect("/clientes/clientes");
    } catch (err) {
      console.error("Erro ao cadastrar cliente", err);
      res.status(500).send("Erro ao cadastrar cliente");
    }
  });



    //Rota para renderizar clientes cadastrados
router.get("/clientes", async (req, res) => {
    let clientes = (await pool.query("SELECT * FROM clientes")).rows;
    console.log(clientes)
    res.render("clientes", { clientes });
  });


// Rota para deletar cliente
router.post("/:id/delete", async (req, res) => {
    const clienteId = req.params.id;
    try {
      await pool.query("DELETE FROM clientes WHERE id = $1", [clienteId]);
      res.redirect("/clientes/clientes");  // Redireciona de volta para a lista de clientes após a exclusão
    } catch (err) {
      console.error("Erro ao deletar cliente", err);
      res.status(500).send("Erro ao deletar cliente");
    }
  });
  
  
  // Rota para atualizar o cliente
  router.post('/:id/update', async (req, res) => {
    const clienteId = req.params.id;
    const { nome, endereco, cpf, rg, telefone } = req.body;
    
    try {
      await pool.query(
        'UPDATE clientes SET nome = $1, endereco = $2, cpf = $3, rg = $4, telefone = $5 WHERE id = $6',
        [nome, endereco, cpf, rg, telefone, clienteId]
      );
      res.redirect('/clientes/clientes'); // Redireciona para a lista de clientes após a edição
    } catch (err) {
      console.error('Erro ao atualizar cliente', err);
      res.status(500).send('Erro ao atualizar cliente');
    }
  });

  module.exports = router