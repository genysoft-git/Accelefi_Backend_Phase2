const express = require("express");
const router = express.Router();
// const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const connection = require("../db.js").databaseConnection;
/* GET users listing. */
router.get("/", function (req, res, next) {
  let sql = `SELECT
  a.customer_Year,
  a.customer_Make,
  a.customer_Model,
  a.customer_Stylename,a.customer_TotalAmountFinanced,CT.customer_trademake,CT.customer_tradeyear,CT.customer_trademodel,CT.customer_Trademiles,
  Date(a.customer_Dealdate) as Date,
  a.customer_Vin,a.customer_Dealnumber ,a.customer_Vehicletype,
  concat(b.user_Firstname,' ',b.user_Lastname) as FinanaceMgr,
  concat(b.user_Firstname,' ',b.user_Lastname) as SalesPerson,
  if (a.customer_Status=1,'Active','InActive') as Status,
  a.customer_Purchasetype,
  a.customer_Miles,a.customer_Msrp
FROM customerverification a
join user b on a.customer_Createdby=b.id
join customerverification_tradeinfo CT on CT.customerverification_id=a.customer_Id
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
    selectedButton,
    date,
    outsideLender,
  } = req.body;
  let sql_query;
  if (selectedButton === "close") {
    sql_query = `update customerverification set customer_Status=0 where customer_Dealnumber='${dealNumber}';`;
  } else {
    sql_query = `update customerverification set customer_Status=2 where customer_Dealnumber='${dealNumber}';`;
  }

  connection.query(sql_query, (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 1) {
      const sql_query = `insert into closed_deal (
      back_gross,
      buy_rate,
      credit_score,
      deal_no,
      finance_mgr,
      finance_reserve,
      front_gross,
      lender,
      loan_to_value,
      notes,
      qulified_unit,
      reserve_method,
      reserve_method_value,
      sales_mgr,
      sales_person,
      sell_rate,
      total_gross,
      vehicle_value,
      value_method,
      rate_deviation_reason,closed_deal_date,is_out_side_lender,out_side_lender) values (
      '${backGross}',
      ${buyRate},
      ${creditScore},
      '${dealNumber}',
      '${financeManagerDropdown}',
      ${financeReserve},
      ${frontGross},
      '${lender}',
      '${loanToValue}',
      '${notes}',
      '${qualifiedUnit}',
      '${selectedValue}',
      '${reserve_amount}',
      '${salesManagerDropdown}',
      '${salesPersonDropdown}',
      ${sellRate},
      ${totalGross},
      ${vehicleValue},
      '${valueMethod}',
      '${selectedReason}','${new Date(date)
        .toISOString()
        .slice(0, 10)
        .replace("T", " ")}','${outsideLender.isYesChecked ? "Yes" : "No"}','${
        outsideLender.outSideLender
      }')`;
      connection.query(sql_query, (err, results) => {
        if (err) throw err;
        res.send(results);
      });
    } else {
      res.send(results);
    }
  });
});

router.get("/reactivatedeal", (req, res) => {
  const sql_query =
    "select CD.*,CV.customer_Make,CV.customer_Model,CV.customer_Dealnumber,CV.customer_Vehicletype,CV.customer_Purchasetype,CV.customer_Vehicletype,CT.customer_trademake,CT.customer_tradeyear,CT.customer_trademodel,CT.customer_Trademiles from closed_deal as CD left join customerverification as CV on CD.deal_no=CV.customer_Dealnumber left join customerverification_tradeinfo CT on CV.customer_Id = CT.customerverification_id;";
  connection.query(sql_query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});
router.post("/reactive", (req, res) => {
  const { dealNumber, selectedButton } = req.body;
  let sql_query;
  if (selectedButton === "active") {
    sql_query = `update customerverification set customer_Status=1 where customer_Dealnumber='${dealNumber}';`;
  } else {
    sql_query = `update customerverification set customer_Status=2 where customer_Dealnumber='${dealNumber}';`;
  }

  connection.query(sql_query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

router.post("/reports", (req, res) => {
  console.log(req.body);

  const { startDate, endDate, purchaseType, vehicleType } = req.body;

  let sp_query = `CALL GetReports('${new Date(startDate)
    .toISOString()
    .slice(0, 10)}','${new Date(endDate)
    .toISOString()
    .slice(
      0,
      10
    )}','${purchaseType}','${vehicleType}',@use_qualified_count,@new_qualified_count,@new_finance_count,@used_finance_count,@new_cash_count,@used_cash_count,@lease_count,@used_count,@new_count,@new_financeReserve,@used_financeReserve);`;

  console.log(sp_query);

  connection.query(sp_query, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.send(results);
  });
});
module.exports = router;
