const express = require("express");
const router = express.Router();
const connection = require("../db.js").databaseConnection;
/* GET users listing. */
router.get("/", function (req, res, next) {
  let sql = `SELECT
  a.customer_Year,
  a.customer_Make,
  a.customer_Model,
  a.customer_Stylename,
  Date(a.customer_Dealdate) as Date,
  a.customer_Vin,a.customer_Dealnumber ,a.customer_Vehicletype,
  concat(b.user_Firstname,' ',b.user_Lastname) as FinanaceMgr,
  concat(b.user_Firstname,' ',b.user_Lastname) as SalesPerson,
  if (a.customer_Status=1,'Active','InActive') as Status,
  a.customer_Purchasetype,
  a.customer_Miles,a.customer_Msrp,
  df.total_price_after_protection,dp.product_value,pp.productName,pp.productType,df.total_price_after_protection,df.new_payment
FROM customerverification a
join user b on a.customer_Createdby=b.id
join deal_finalpayment df on df.deal_number=a.customer_Dealnumber left join deal_products dp on a.customer_Dealnumber=dp.deal_number left join pen_products as pp on dp.productID=pp.productID group by a.customer_Dealnumber`;

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

router.get("/managers", function (req, res, next) {
  let sql = "select * from customerverification";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/salesperson", function (req, res, next) {
  let sql = "select sales_Person from deal_closed";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/salesmanagers", function (req, res, next) {
  let sql = "select sales_Manager from deal_closed;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/lender", function (req, res, next) {
  let sql = "select lender from deal_closed;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/rate", function (req, res, next) {
  let sql = "select rate_Deviationreason from deal_closed;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/reserve", function (req, res, next) {
  let sql = "select reserve_Method from deal_closed;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

module.exports = router;
