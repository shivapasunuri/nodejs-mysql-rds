const { Client } = require("ssh2");
const mysql = require("mysql2");
require("dotenv").config();

const sshClient = new Client();

const dbServer = {
  host: process.env.DSTHOST,
  port: 3306,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DB,
};

const tunnelConfig = {
  host: process.env.SSH_HOST,
  port: 22,
  username: process.env.SSH_USER,
  privateKey: require("fs").readFileSync(process.env.SSH_KEY),
};
const forwardConfig = {
  srcHost: "127.0.0.1", // any valid address
  srcPort: 3306, // any valid port
  dstHost: dbServer.host, // destination database
  dstPort: dbServer.port, // destination port
};

const SSHConnection = new Promise((resolve, reject) => {
  sshClient
    .on("ready", () => {
      sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        forwardConfig.dstHost,
        forwardConfig.dstPort,
        (err, stream) => {
          if (err) reject(err);
          const updatedDbServer = {
            ...dbServer,
            stream,
          };
          const connection = mysql.createConnection(updatedDbServer);
          connection.connect((error) => {
            if (error) {
              reject(error);
            }
            resolve(connection);
          });
        }
      );
    })
    .connect(tunnelConfig);
});

module.exports = SSHConnection;
