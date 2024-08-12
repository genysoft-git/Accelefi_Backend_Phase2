const mysql = require("mysql2");

const config = {
  host: "digitaldealer.cha9iskvgvwx.us-west-2.rds.amazonaws.com",
  user: "admin",
  password: "hG7%Lkl0q",
  database: "digital_sandbox",
  port: "3306",
  connectionTimeout: 10000,
};

const connection = new mysql.createConnection(config);

connection.connect(function (err) {
  if (err) {
    console.log("! Connection not established:", err);
  } else {
    console.log("Connection established");
  }
});

exports.databaseConnection = connection;
