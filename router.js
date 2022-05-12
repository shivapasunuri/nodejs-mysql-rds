const SSHConnection = require("./conn");
const router = require("express").Router();
const moment = require("moment");

router
  .post("/", (req, res) => {
    console.log(req.body);

    var dateNow = new Date();
    var time = dateNow.getTime();
    time += 2 * 60 * 60 * 1000;
    var dateExp = new Date(time);

    // const sqlStartDate = dateNow
    //   .toISOString()
    //   .replace("T", " ")
    //   .replace("Z", "");
    // const sqlEndDate = dateExp.toISOString().replace("T", " ").replace("Z", "");

    // console.log("StartDate", sqlStartDate);
    // console.log("Enddate", sqlEndDate);
    console.log(moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
    console.log(moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss"));
    const sqlStartDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const sqlEndDate = moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss");

    SSHConnection.then((mysql) => {
      mysql.query(
        `insert into datatable(name,startdate,enddate) values('${req.body.name}','${sqlStartDate}','${sqlEndDate}')`,
        (err, response) => {
          if (!err) {
            console.log(response);
            res.status(200).send({ msg: "Data added!!" });
          } else {
            console.log(err.message);
            res.status(500).send({ msg: "Sql insertion error" });
          }
        }
      );
    }).catch((err) => {
      console.log(err.message);
      res.status(500).send({ msg: "SSH Error" });
    });
  })
  .get("/", (req, res) => {
    SSHConnection.then((mysql) => {
      mysql.query(
        `select * from datatable where id = '${req.query.id}'`,
        (err, data) => {
          if (!err) {
            console.log(data);
            const dateNow = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            const validTill = moment(new Date(data[0].enddate)).format(
              "YYYY-MM-DD HH:mm:ss"
              );
            res.send(data);
          } else {
            console.log(err.message);
            req.status(500).send({ msg: "SQL error" });
          }
        }
      );
    }).catch((err) => {
      console.log(err.message);
      res.status(500).send({ msg: "SSH Error" });
    });
  })
  .get("/alldata", (req, res) => {
    SSHConnection.then((mysql) => {
      mysql.query(`select * from datatable`, (err, alldata) => {
        if (!err) {
          console.log(alldata);
          res.send(JSON.stringify(alldata));
        } else {
          console.log(err.message);
          res.status(500).send({ msg: "SQL error!!" });
        }
      });
    }).catch((err) => {
      console.log(err.message);
      res.status(500).send({ msg: "SSH error!!" });
    });
  });

module.exports = router;
