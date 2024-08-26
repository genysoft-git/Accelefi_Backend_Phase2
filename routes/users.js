const express = require("express");
const router = express.Router();
const connection = require("../db.js").databaseConnection;
/* GET users listing. */
router.get("/", function (req, res, next) {
  let sql = `SELECT
  a.customer_Year,
  a.customer_Make,
  a.customer_Model,
  a.customer_Stylename,a.customer_TotalAmountFinanced,
  Date(a.customer_Dealdate) as Date,
  a.customer_Vin,a.customer_Dealnumber ,a.customer_Vehicletype,
  concat(b.user_Firstname,' ',b.user_Lastname) as FinanaceMgr,
  concat(b.user_Firstname,' ',b.user_Lastname) as SalesPerson,
  if (a.customer_Status=1,'Active','InActive') as Status,
  a.customer_Purchasetype,
  a.customer_Miles,a.customer_Msrp
FROM customerverification a
join user b on a.customer_Createdby=b.id
`;

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

router.get("/managers", function (req, res, next) {
  let sql =
    "select concat(user_Firstname,' ',user_Lastname) as FinanaceMgr,user_Location from user where user_Role=9";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/salesperson", function (req, res, next) {
  let sql =
    "select concat(user_Firstname,' ',user_Lastname) as SalesPrsn,user_Location from user where user_Role=11;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/salesmanagers", function (req, res, next) {
  let sql =
    "select concat(user_Firstname,' ',user_Lastname) as SalesMgr,user_Location from user where user_Role=7;;";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/lender", function (req, res, next) {
  let sql =
    "select distinct( dp.deal_number),dp.product_value,pp.productName,pp.productType,df.total_price_after_protection,df.new_payment from deal_products dp left join deal_finalpayment df on dp.deal_number=df.deal_number left join pen_products as pp on dp.productID=pp.productID";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.get("/rate", function (req, res, next) {
  let sql =
    "select ml.purchase_lenderid,ml.purchase_lendername,ml.purchase_lendernumber,ml.purchase_lenderaddress,lm.location_id,lm.id,lm.lenders_id,ml.book_forusedcarvalue from lender_mapping lm left join master_lender ml on ml.purchase_lenderid=lm.lenders_id";

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
router.post("/closeDeal", (req, res) => {
  console.log(req.body);
  let {
    dealNumber,
    buyRate,
    totalGross,
    backGross,
    selectedValue,
    lender,
    creditScore,
    frontGross,
    financeReserve,
    valueMethod,
    vehicleValue,
    sellRate,
    reserve_amount,
    financeManagerDropdown,
    salesPersonDropdown,
    salesManagerDropdown,
    notes,
    loanToValue,
    qualifiedUnit,
    selectedReason,
  } = req.body;
  const sql_query = `update customerverification set customer_Status=0 where customer_Dealnumber='${dealNumber}';`;

  connection.query(sql_query, (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 1) {
      const sql_query = `insert into closed_deal (back_gross,buy_rate,credit_score,deal_no,finance_mgr,finance_reserve,front_gross,lender,loan_to_value,notes,purchase_type,qulified_unit,reserve_method,
reserve_method_value,sales_mgr,sales_person,sell_rate,total_gross,value_method,vehicle_value,rate_deviation_reason) values ('${backGross}',${buyRate},${creditScore},'${dealNumber}','${financeManagerDropdown.FinanaceMgr}',${financeReserve},${frontGross},'${lender.purchase_lendername}','${loanToValue}','${notes}','','${qualifiedUnit[0]}','${selectedValue}',${reserve_amount},'${salesManagerDropdown.SalesMgr}','${salesPersonDropdown.SalesPrsn}',${sellRate},${totalGross},'${valueMethod}',${vehicleValue},'${selectedReason}')`;
      connection.query(sql_query, (err, results) => {
        if (err) throw err;
        res.send(results);
      });
    } else {
      res.send(results);
    }
  });
});
module.exports = router;
