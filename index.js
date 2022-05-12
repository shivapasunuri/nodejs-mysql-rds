const express = require("express");
const SSHConnection = require("./conn");
const router = require("./router");
const app = express();

app.use(express.json());

app.listen(4040, () => {
  console.log("Server started on port 4040");
});

SSHConnection.then((mysql) => {
  mysql.query(`show tables`, (err, tables) => {
    console.log(tables);
  });
}).catch((err) => {
  console.log("SSH err", err);
});

app.use("/datatable", router);
