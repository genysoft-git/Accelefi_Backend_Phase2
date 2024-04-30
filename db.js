const mysql = require("mysql2");

const config = {
  host: "localhost",
  user: "root",
  password: "sysadmin",
  database: "accelefidb",
  port: "3306",
};

const conn = new mysql.createConnection(config);

conn.connect(function (err) {
  if (err) {
    console.log("! Connection not established:", err);
  } else {
    console.log("Connection established");
  }
});
console.log(config);
