const express = require("express");
const router = express.Router();
const connection = require("../db.js").databaseConnection;
/* GET home page. */
router.get("/", async function (req, res, next) {
  let sql = "select * from closed_deal";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

module.exports = router;
