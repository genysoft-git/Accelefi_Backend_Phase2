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
    vehicleType,
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
      back_gross,buy_rate,credit_score,deal_no,finance_mgr,finance_reserve,front_gross,lender,loan_to_value,notes,qulified_unit,reserve_method,reserve_method_value,sales_mgr,sales_person,
      sell_rate,total_gross,vehicle_value,value_method,rate_deviation_reason,closed_deal_date,is_out_side_lender,out_side_lender,vehicle_type)
      values (
      '${backGross}',${buyRate},${creditScore},'${dealNumber}','${financeManagerDropdown}',${financeReserve},${frontGross},'${lender}','${loanToValue}','${notes}','${qualifiedUnit}','${selectedValue}','${reserve_amount}','${salesManagerDropdown}','${salesPersonDropdown}',${sellRate},${totalGross},${vehicleValue},'${valueMethod}','${selectedReason}','${new Date(
        date
      )
        .toISOString()
        .slice(0, 10)
        .replace("T", " ")}','${outsideLender.isYesChecked ? "Yes" : "No"}','${
        outsideLender.outSideLender
      }','${vehicleType}') on duplicate key update back_gross='${backGross}',buy_rate=${buyRate},credit_score=${creditScore},finance_mgr='${financeManagerDropdown}',finance_reserve=${financeReserve},front_gross=${frontGross},lender='${lender}',loan_to_value='${loanToValue}',notes='${notes}',qulified_unit='${qualifiedUnit}',reserve_method='${selectedValue}',reserve_method_value='${reserve_amount}',sales_mgr='${salesManagerDropdown}',sales_person='${salesPersonDropdown}',sell_rate=${sellRate},total_gross=${totalGross},vehicle_value=${vehicleValue},value_method='${valueMethod}',rate_deviation_reason='${selectedReason}',closed_deal_date='${new Date(
        date
      )
        .toISOString()
        .slice(0, 10)
        .replace("T", " ")}',is_out_side_lender='${
        outsideLender.isYesChecked ? "Yes" : "No"
      }',out_side_lender='${
        outsideLender.outSideLender
      }',vehicle_type='${vehicleType}'`;
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

  let reportResult = null;
  let financeResult = null;

  const checkAndRespond = () => {
    if (reportResult && financeResult) {
      // If both results are ready, respond with the combined data
      res.send({
        report: reportResult,
        finance: financeResult,
      });
    }
  };
  const { startDate, endDate, purchaseType, vehicleType } = req.body;

  const formattedStartDate = new Date(startDate).toISOString().slice(0, 10);
  const formattedEndDate = new Date(endDate).toISOString().slice(0, 10);

  let finance_query = `call GetFinance('${formattedStartDate}','${formattedEndDate}');
`;

  let report_query = `CALL GetReports('${formattedStartDate}','${formattedEndDate}','${purchaseType}','${vehicleType}',@use_qualified_count,@new_qualified_count,@new_finance_count,@used_finance_count,@new_cash_count,@used_cash_count,@lease_count,@used_count,@new_count,@new_financeReserve,@used_financeReserve,@qualified_new_cash_deals , @qualified_used_cash_deals , @qualified_new_finance_deals , @qualified_used_finance_deals , @qualified_lease_deals , @total_new_cash_deal , @total_used_cash_deal , @total_new_finance_deal , @total_used_finance_deal , @total_new_lease_deal );`;

  connection.query(report_query, (err, report_results) => {
    if (err) throw err;
    // console.log(report_results);
    reportResult = report_results[0][0];
    checkAndRespond();
  });

  connection.query(finance_query, (err, results) => {
    if (err) throw err;
    // console.log(results);
    financeResult = results[0];
    checkAndRespond();
  });
});

router.post("/org", (req, res) => {
  console.log(req.body);

  const { id, org } = req.body;
  let user_Role = null;
  let sql_query = `select * from user where id=${id}`;
  connection.query(sql_query, (err, results) => {
    let query;
    if (err) throw err;
    user_Role = results[0].user_Role;
    if (user_Role === 1) {
      query = `select id,org_name from manage_organization where is_deleted=0`;
    } else {
      query = `select id,org_name from manage_organization where is_deleted=0 and id=${org}`;
    }
    console.log(query);

    connection.query(query, (err, results) => {
      if (err) throw err;

      res.send({
        user_Role: user_Role,
        organization: results,
      });
    });
  });
});
router.post("/dealership", (req, res) => {
  const { dealer } = req.body;

  const dealership_query = `select location_Id,organization_id,location_Name from location where organization_id=${dealer} and is_deleted=0;`;
  connection.query(dealership_query, (err, results) => {
    if (err) throw err;

    res.send({ dealership: results });
  });
});
router.post("/dealerusers", (req, res) => {
  const { location } = req.body;

  const dealership_query = `SELECT
 concat(user_Firstname, '',
  user_Lastname) as name, user_Role,
  CASE
    WHEN user_Role = 9 THEN 'Finance Manager'
    WHEN user_Role = 7 THEN 'Sales Manager'
    WHEN user_Role = 11 THEN 'Sales Person'
    ELSE 'Unknown Role'
  END AS user_Role_Label,
  user_Location
FROM user
WHERE user_Role IN (9, 7, 11)
  AND user_Location = ${location}
  AND is_deleted = 0;`;
  connection.query(dealership_query, (err, results) => {
    if (err) throw err;

    res.send({ dealership: results });
  });
});
module.exports = router;
