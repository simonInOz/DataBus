var express = require("express");
var router = express.Router();
//var dbLib = require("../modules/dbLibMySql");
var dbLib = require("../modules/dbLibTransactSql");
var dateUtils = require("../modules/dateUtils");
var auth = require("../modules/auth");
var authorisation = require("../modules/authorisation");
const DominoRest = require("../modules/DominoRest");
var baseUploadFields = "id, runBy, tableName, createdAt, overwritten, deleted,  overWrittenBy";

router.get("/", function (req, res, next) {
  res.send("db goes here");
});

const getById = async (req, res, table, key, id) => {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    let params = [id];
    const result = await dbLib.dbQuery("SELECT * FROM " + table + " WHERE " + key + "=?", params);
    res.send(result);
  } catch (err) {
    console.log("BCG538", err);
    res.status(500).send("remove " + table + " failed");
  }
};

function getEntries(p, name = null, extra = null) {
  if (p == null || p == "*") return [];
  let e = p.split(",");
  if (extra) {
    for (let ee in e) {
      e[ee] += extra;
    }
  }
  // if (name) console.log("VHU765", name, e);
  return e;
}

function getFilter(p, type = "to") {
  // console.log("VFR444 filter", p);

  let compare = "=";
  if (type == "min") compare = ">=";
  if (type == "max") compare = "<=";

  let s = "";
  if (p == null || p == "*") return s;
  let e = p.split(",");
  //format col=val|val,col=val
  for (let filter of e) {
    let bits = filter.split("=");
    if (bits.length == 2) {
      if (s.length > 0) s += " AND ";
      let vals = bits[1].split("|");
      if (vals.length > 1) s += "(";
      let i = 0;
      for (let val of vals) {
        if (i++ > 0) s += " OR ";
        if (isNaN(1 * val)) {
          //we get weirdness if % is in the URL stirng
          if (val.includes("LIKELIKE")) s += bits[0] + " LIKE '" + val.replaceAll("LIKELIKE", "%") + "'";
          else s += bits[0] + compare + "'" + val + "'";
        } else s += bits[0] + compare + val;
      }
      if (vals.length > 1) s += ")";
      console.log("BSY384", type, filter, s);
    }
  }
  // console.log("VFR888 filter", p, "->", s);
  return s;
}

router.get(
  "/special/:table/:start?/:maxLines?/:fields?/:filtersTo?/:filtersMin?/:filtersMax?/:sum?/:groupBy?/:orderBy?/:orderByDescending?",
  auth,
  async function (req, res, next) {
    if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
    try {
      const table = req.params.table;

      let start = req.params.start;
      if (start == null) start = 0;
      let maxLines = req.params.maxLines;
      if (maxLines == null) maxLines = 5;

      const filterTo = getFilter(req.params.filtersTo, "to");
      const filterMin = getFilter(req.params.filtersMin, "min");
      const filterMax = getFilter(req.params.filtersMax, "max");
      let fields = getEntries(req.params.fields, "fields");
      const sum = getEntries(req.params.sum, "sum");
      const groupBy = getEntries(req.params.groupBy, "groupBy");
      let orderBy = getEntries(req.params.orderBy, "orderBy");
      let orderByDescending = getEntries(req.params.orderByDescending, "orderByDescending", " DESC");
      if (orderBy.length == 0 && orderByDescending.length == 0) orderBy = "id";
      console.log("NGR428 orderBy", orderBy, "orderByDescending", orderByDescending);

      //cannot order by id if groupBy
      if (sum.length > 0 || groupBy.length > 0) {
        fields = [];
        if (orderBy == "id") orderBy = null;
      }

      for (let s of groupBy) {
        if (!fields.includes(s)) fields.push(s);
      }
      for (let s of sum) {
        const sumFunc = "sum(" + s + ") sum_" + s;
        if (!fields.includes(s) && !fields.includes(sumFunc)) fields.push(sumFunc);
      }

      let sqlCols = fields.toString().replaceAll(",", ", ");
      if (sqlCols.length == 0) sqlCols = "*";

      let sql = "SELECT " + sqlCols + " FROM " + table;

      let filters = [];
      if (filterTo.length > 0) filters.push(filterTo);
      if (filterMin.length > 0) filters.push(filterMin);
      if (filterMax.length > 0) filters.push(filterMax);
      let where = filters.join(" AND ");

      if (where.length > 0) sql += " WHERE " + where;

      if (groupBy.length > 0) sql += " GROUP BY " + groupBy.toString();

      if (orderBy && orderBy.length > 0) {
        sql += " ORDER BY " + orderBy;
        if (orderByDescending && orderByDescending.length > 0) {
          sql += ", " + orderByDescending;
        }
      } else if (orderByDescending && orderByDescending.length > 0) {
        sql += " ORDER BY " + orderByDescending;
      }

      //can only limit rows if no groupBy
      if (groupBy.length == 0 && start != null && maxLines != null)
        sql += " OFFSET " + start + " ROWS FETCH NEXT " + maxLines + " ROWS ONLY";

      let result = await dbLib.dbQuery(sql, [], false, "SPE884");
      console.log("NFU597", result.status, result.recordset.length + " records");
      res.send(result);
      return;
    } catch (e) {
      console.log("NDI493", e);
      res.send({ recordset: [] });
    }
  }
);

router.get("/uploadStats/:option/:param/:offsetMonths", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;
  let opts = ["1=1"];
  const option = req.params.option;
  const param = req.params.param;

  const offsetMonths = req.params.offsetMonths;
  let endDate = new Date();
  if (offsetMonths > 0) endDate.setMonth(endDate.getMonth() - offsetMonths);
  let startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 12);
  let startRP = dateUtils.getReportPeriod_ID(startDate);
  let endRP = dateUtils.getReportPeriod_ID(endDate);

  // console.log("NDY382 userInfo", req.userInfo, "offsetMonths",offsetMonths, startRP, endRP, "startDate", startDate, "endDate", endDate);

  if (option) {
    switch (option) {
      case "User":
        opts = ["user_ID='" + param + "'"];
        break;
      case "Members":
        opts = ["user_FI_ID<>'FI_APN'"];
        break;
      case "APN":
        opts = ["user_FI_ID='FI_APN'"];
        break;
      case "Combined":
        opts = ["FI_ID='*'"];
        break;
      case "Aggregated":
        opts = ["user_FI_ID <> FI_ID"];
        break;
      case "FI":
        if (param == "user_FI_ID") {
          opts = ["user_FI_ID = '" + req.userInfo.FI_ID + "'"];
        } else if (param != "*") opts = ["FI_ID = '" + req.params.param + "'"];
        break;
    }
  }
  try {
    const result = await dbLib.dbNamedQuery(
      "uploadStats",
      [opts, startRP, endRP]
      //  ,
      //  true,
      //  "HGF666"
    );
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/uploadsShort/:id", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery(
      "uploadsShort",
      [req.params.id]
      // ,
      // true,
      // "HGF666"
    );
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/testLoginDomino/:id", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;
  try {
    const result = await dbLib.dbQuery("select * from LoginSources where id=? AND active='Yes'", [req.params.id]);
    // console.log("NNH739", result);
    if (result.status == "Ok" && result.recordset.length == 1) {
      const rs = result.recordset[0];
      const server = rs.server;
      const URL = rs.URL;
      const userName = rs.userName;
      const pwd = rs.pwd;

      let dr = new DominoRest(server, null, URL, userName, pwd);
      dr.login(userName, pwd);

      res.send({ status: "Ok" });
    } else res.send({ status: "Fail" });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/testGetDomino/:id", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  try {
    let loginId = 0;
    let name = null;
    let getURL = null;

    let result = await dbLib.dbQuery(`select * from DataSources where id=${req.params.id} AND active='Yes'`, [], false, "LKI333");
    // console.log("NNH739", result);
    if (result.status == "Ok" && result.recordset.length == 1) {
      const rs = result.recordset[0];
      loginId = rs.idLoginSources;
      name = rs.name;
      getURL = rs.URL;
      // console.log("NFY665", loginId, getURL);

      const resultLogin = await dbLib.dbQuery(
        `select * from LoginSources where id=${loginId} AND active='Yes'`,
        [],
        false,
        "LFU754"
      );
      // console.log("NNH739", result);
      if (resultLogin.status == "Ok" && resultLogin.recordset.length == 1) {
        const rsLogin = resultLogin.recordset[0];
        const server = rsLogin.server;
        const loginURL = rsLogin.URL;
        const userName = rsLogin.userName;
        const pwd = rsLogin.pwd;

        let dr = new DominoRest(server, null, loginURL, userName, pwd);
        const loginResponse = await dr.login(userName, pwd);
        // console.log("JJU849", loginResponse);
        if (loginResponse) {
          let getResponse = await dr.get(getURL);
          let saveResponse = await dr.saveToTable(getResponse, "TEST", 45, req.params.id, name);
          res.send({ status: "Ok ish", rowsAffected: saveResponse.rowsAffected });
          return;
        }
      }
    } else {
      console.log("GTR554 dataSources lookup failed ");
    }
    res.send({ status: "Fail" });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/testGetDominoByName/:tableName", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  try {
    const tableName = req.params.tableName
    let dr = new DominoRest();
    const initResponse = await dr.initByTablename(tableName);
    const loginResponse = await dr.login();
    console.log("JJU849", loginResponse);
    if (loginResponse) {
      let getResponse = await dr.get();
      let saveResponse = await dr.saveToTable(getResponse, "TEST");
      res.send({ status: "Ok ish", rowsAffected: saveResponse.rowsAffected });
      return;
    }
    res.send({ status: "Fail" });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/allAggregatedMonthlyDue/:ReportPeriod_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "operator" }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("allAggregatedMonthlyDue", [req.params.ReportPeriod_ID]);
    // console.log("NGF523", result.status, result.recordset.length);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/allMembersMonthlyDue/:ReportPeriod_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "operator" }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("allMembersDue", ["Monthly", req.params.ReportPeriod_ID], true, 'BGF443"');
    // console.log("NGF523", result.status, result.recordset.length);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/allMembersQuarterlyDue/:ReportPeriod_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "operator" }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("allMembersDue", ["Quarterly", req.params.ReportPeriod_ID]);
    // console.log("NGF523", result.status, result.recordset.length);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});
router.get("/allMembersYearlyDue/:ReportPeriod_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "operator" }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("allMembersDue", ["Yearly", req.params.ReportPeriod_ID]);
    // console.log("NGF523", result.status, result.recordset.length);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

router.get("/poolErrors", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;
  res.send(dbLib.getPoolErrors());
});

router.get("/uploadStatistics/:monthMax?/:offset?", auth, async function (req, res, next) {
  try {
    if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;

    let sql = "SELECT ? Date, count(*) " + "FROM [dbo].[uploads] WHERE " + "(ReportPeriod_ID>=? AND ReportPeriod_ID<=?) ";

    //get prev month report period id and all the others
    let startDate = new Date();
    startDate.setDate(5); //set to 5th of month (1st might get tz problems)

    const monthMax = req.params.monthMax || 4;
    const offset = req.params.offset || 0;
    if (offset > 0) {
      startDate.setMonth(startDate.getMonth() - offset);
    }

    let months = [];
    let RPs = [];
    let texts = [];
    let results = [];

    let result;
    for (let m = 0; m < monthMax; m++) {
      months[m] = new Date(startDate.getTime());
      months[m].setMonth(startDate.getMonth() - m);
      RPs[m] = dateUtils.getReportPeriod_ID(months[m]);
      texts[m] = months[m].toLocaleDateString("en-US", { month: "short" }) + "/" + months[m].getFullYear();
      result = await dbLib.dbQuery(sql, [texts[m], RPs[m], RPs[m]]); //, true, "KKK543");
      results[m] = result.recordset[0];
    }

    let endFinYear = new Date();
    if (endFinYear.getMonth() < 5) endFinYear.setFullYear(endFinYear.getFullYear() - 1);
    endFinYear.setMonth(5);
    endFinYear.setDate(30);

    let startFinYear = new Date(endFinYear.getTime());
    startFinYear.setDate(startFinYear.getDate() + 1);
    startFinYear.setFullYear(startFinYear.getFullYear() - 1);
    //console.log("GDR332 start fin year", startFinYear,"-",  endFinYear)

    const startFinYearRP = dateUtils.getReportPeriod_ID(startFinYear);
    const endFinYearRP = dateUtils.getReportPeriod_ID(endFinYear);
    const finYearText = "LFY " + startFinYear.getFullYear() + "-" + endFinYear.getFullYear();
    RPs.push(startFinYearRP);
    RPs.push(endFinYearRP);

    let resultLastFinYear;
    resultLastFinYear = await dbLib.dbQuery(sql, [finYearText, startFinYearRP, endFinYearRP]);
    // }
    results.push(resultLastFinYear.recordset[0]);
    results.push(RPs);

    res.send({ status: "Ok", recordset: results });
  } catch (e) {
    console.log("GDE666", e);
    res.send({ status: "Error", errCode: "PTH483", err: e });
  }
});

router.get("/uploadErrors/:id/:limit?", auth, async function (req, res, next) {
  let limit = req.params.limit || 99;
  try {
    if (!authorisation.check(req.userInfo, { roles: ["user", "operator", "admin"] }, res)) return;
    //let sql = "SELECT TOP (" + limit + ") * FROM upload_errors WHERE uploads_ID='" + [req.params.id] + "' ";
    let sql =
      `SELECT ue.id, user_id, originalFilename, ue.code, msg, Data_Provided, createdAt, uploads_ID, error_level, addr, ec.Description, ` +
      `(ISNULL(ec.Suggestions,'') +' (' + ue.code +')') Suggestions FROM [dbo].[upload_errors] AS ue ` +
      `LEFT JOIN [dbo].[Error_Codes] AS ec ON ue.code = ec.Code ` +
      `WHERE error_level != 'TRIVIAL' AND uploads_ID='${req.params.id}' ORDER BY error_level DESC`;
    const rset = await dbLib.dbQuery(sql, [], false, "JYH776");
    res.send(rset.recordset);
  } catch (err) {
    console.log("HGF554 uploaderrors ERROR", err);
    res.send({ status: "Error", err: err });
  }
});

router.get("/uploadErrorsTrivial/:id", auth, async function (req, res, next) {
  try {
    if (!authorisation.check(req.userInfo, { roles: ["user", "operator", "admin"] }, res)) return;
    let sql = "SELECT * from [dbo].[upload_errors] WHERE error_level = 'TRIVIAL' AND uploads_ID='" + [req.params.id] + "' ";
    const rset = await dbLib.dbQuery(sql);
    res.send(rset.recordset);
  } catch (err) {
    console.log("GGT382 uploadErrorsTrivial ERROR", err);
    res.send({ status: "Error", err: err });
  }
});

router.post("/refUpdate", auth, async (req, res) => {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  await dbLib.update(req, res, "referenceFiles", [req.body.id]);
});

router.get("/uploadsRef/:filter", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  const filter = req.params.filter.toLowerCase();
  let sql =
    "SELECT id, user_id, created, Data_Provided, appliesFrom, appliesUntil, originalFname" +
    ", fname, sheetName, uniqueCell, uniqueCellValue, comment, active, MultipleFIs, tableName" +
    ", FISource, PeriodSource " +
    "FROM referenceFiles ";
  let where = "WHERE 1=1 ";
  if (filter.includes("current")) {
    where += "AND appliesFrom < getDate() AND appliesUntil > getDate() ";
  }
  if (filter.includes("inactive")) where += "AND active<>'yes' ";
  else if (filter.includes("active")) where += "AND active='yes' ";
  //other option is "all"

  sql += where + "ORDER BY created DESC";
  //console.log("BYT527", sql);
  try {
    let rs = await dbLib.dbQuery(sql);
    //console.log("jry332 ok");
    res.send(rs);
  } catch (err) {
    res.send(err);
  }
});

router.get("/ref/:id", auth, async (req, res) => {
  await getById(req, res, "referenceFiles", "id", req.params.id);
});

router.get("/byUploads_ID/:table/:id", auth, async (req, res) => {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  await getById(req, res, req.params.table, "uploads_ID", req.params.id);
});

const pageTables = {
  operator: ["Logins", "uploads", "FI_Forms", "extracted_data"],
  user: ["uploads", "FI_Forms"],
};

//this is for the pageable display
router.get("/page/:table/:idCol/:start?/:maxLines?/:orderBy?/:RP?/:maxRP?", auth, async function (req, res, next) {
  const table = req.params.table;
  //are we allowed to lookup this table?
  const role = dateUtils.getRole(req.userInfo);
  const user_ID = req.userInfo.user_ID;
  const userSubGroups = req.userInfo.SubGroups;
  const pageTable = pageTables[role];

  const FI_ID = req.userInfo.FI_ID;
  const idCol = req.params.idCol;
  console.log("NHT552", "table", table, "idCol", idCol, "role", role, "user_ID", user_ID);
  let orderBy = "id DESC";

  const search = req.query.s;
  const searchCol = req.query.c;
  const period = req.query.p;
  const fo = req.query.fo;
  const fi = req.query.f;
  const FI_IDparam = req.query.u;
  const user = req.query.user;

  let paging = true;
  if (req.query.paging) paging = req.query.paging == "y";

  let result;

  if (role != "admin" && !pageTable.includes(table)) {
    //table not permitted
    res.status(401).send("Table access for " + table + " not permitted");
    return;
  }

  try {
    let start = 0,
      maxLines = 20;

    let ReportPeriod = null;
    let maxReportPeriod = null;

    if (req.params.start) start = req.params.start;
    if (req.params.maxLines) maxLines = req.params.maxLines;
    if (req.params.orderBy) orderBy = req.params.orderBy;
    if (req.params.RP) ReportPeriod = req.params.RP;

    maxLines++; //overflow by one so we can detect end of info

    let params = [];

    let fields = "*";
    if (table == "uploads") fields = "[id], [runBy],[tableName], [createdAt],overwritten,[overWrittenBy], deleted";

    let sql = "SELECT " + fields + " FROM " + table + " WHERE 1=1 ";
    console.log("NNH729", sql);

    if (search) {
      const searchCols = searchCol.split(",");
      const searches = search.split(",");

      sql += "AND (";

      let j = 0;
      for (let searchParam of searches) {
        searchParam = searchParam.replace("%20", " ");
        if (j++ > 0) sql += " AND ";
        sql += " (";

        let i = 0;
        for (let col of searchCols) {
          if (i++ > 0) sql += " OR "; // multi parms
          if (search.includes("%")) sql += col.trim() + " LIKE ? ";
          else sql += col.trim() + "=? ";
          params.push(searchParam.trim());
        }
        sql += ")";
      }
      sql += ") ";
    }

    sql += "ORDER BY " + orderBy + " ";

    if (paging) sql += "OFFSET " + start + " ROWS FETCH NEXT " + maxLines + " ROWS ONLY";
    console.log("NGT752", sql);

    result = await dbLib.dbQuery(sql, params, false, "KHY638");

    //console.log("BDY629 result length", result.recordset.length, "FI_ID", FI_ID);
    res.send(result);
  } catch (err) {
    console.log("FCD334", err);
    res.send(result);
  }
});

//paged uploads
router.get("/userUploads/:opt/:start?/:maxLines?/:orderBy?", auth, async function (req, res, next) {
  //opt = FI
  let result;
  try {
    let start = 0,
      maxLines = 20;
    if (req.params.start) start = req.params.start;
    if (req.params.maxLines) maxLines = req.params.maxLines;
    const opt = req.params.opt;

    result = await getUploads(res, req.userInfo, opt, start, maxLines);
    // console.log("BDY372 getUploads result", result)
    res.send(result);
  } catch (err) {
    console.log("FCD335", err);
    res.send(result);
  }
});

async function getUploads(res, userInfo, opt, start, maxLines) {
  if (opt == "all") if (!authorisation.check(userInfo, { role: "operator" }, res)) return;

  let sql = "SELECT " + baseUploadFields + " FROM uploads  ";
  sql += "ORDER BY id DESC " + "OFFSET " + start + " ROWS FETCH NEXT " + maxLines + " ROWS ONLY";
  const result = await dbLib.dbQuery(sql, [], false, "DEW638");
  return result;
}

//paged uploads -specifcally for Operator
router.get("/opUploads/:FI_ID/:start?/:maxLines?/:orderBy?", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "operator" }, res)) return;
  const table = "uploads";
  try {
    let FI_ID = req.params.FI_ID;
    let idCol = "FI_ID";
    let orderBy = "id DESC";
    let start = 0,
      maxLines = 20;
    if (req.params.start) start = req.params.start;
    if (req.params.maxLines) maxLines = req.params.maxLines;
    if (req.params.orderBy) orderBy = req.params.orderBy;

    const sql =
      "SELECT * FROM " +
      table +
      " WHERE comment<>'Generated' AND " +
      idCol +
      "='" +
      FI_ID +
      "' ORDER BY " +
      orderBy +
      " OFFSET " +
      start +
      " ROWS FETCH NEXT " +
      maxLines +
      " ROWS ONLY";
    const result = await dbLib.dbQuery(sql, [], true, "GRY638");
    res.send(result);
  } catch (err) {
    console.log("6", err);
    res.status(500).send("Load " + table + " failed");
  }
});

router.get("/listSummaryData/:startDate/:endDate/:FI_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  try {
    const sql =
      "SELECT sg.code, sum(Number) sum_Number, sum(Value_In_Thousands) sum_Value_in_Thousands " +
      "FROM uploads up, subGroups sg, extracted_data ed " +
      "WHERE up.Data_Provided = sg.Data_Provided AND up.ReportPeriod_ID>=? AND up.ReportPeriod_ID<=? " +
      "   AND approved=1 AND ed.uploads_ID=up.id AND (up.FI_ID=? OR '*'=?)" +
      "GROUP BY sg.code " +
      "ORDER BY code ";
    const result = await dbLib.dbQuery(
      sql,
      [req.params.startDate, req.params.endDate, req.params.FI_ID, req.params.FI_ID],
      false,
      "LKJ777"
    );
    res.send(result);
  } catch (err) {
    console.log("GVS839", err);
    res.status(500).send("List faile");
  }
});

router.get("/getAction/:name/:number?", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;
  try {
    const sql = "SELECT operation FROM Action where name=?";
    const result = await dbLib.dbQuery(sql, [req.params.name]);
    res.send(result);
  } catch (err) {
    console.log("FRD382", err);
    res.status(500).send("Load getAction failed");
  }
});

router.get("/refTables", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("listAllTables");
    res.send(result);
  } catch (err) {
    console.log("BJR528", err);
    res.status(500).send("Load ref tables failed");
  }
});

router.get("/data/:uploads_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbNamedQuery("listData", [req.params.uploads_ID]); //, true, "SJR382");
    res.send(result);
  } catch (err) {
    console.log("DJY294", err);
    res.status(500).send("Load data tables failed");
  }
});

router.get("/customData/:tableName/:uploads_ID", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbQuery(
      "select * FROM " + req.params.tableName + " WHERE uploads_ID=?",
      [req.params.uploads_ID],
      true,
      "GSJ382"
    );
    res.send(result);
  } catch (err) {
    console.log("FCD427", err);
    res.status(500).send("Load custom data tables failed");
  }
});

router.get("/listTables", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbQuery(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME",
      [],
      false,
      "HHT535"
    );
    res.send(result);
  } catch (err) {
    console.log("FCD439", err);
    res.status(500).send("List tables failed");
  }
});

router.get("/listTableDefinitions/:tableName/:colName", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    let tableName = req.params.tableName;
    if (tableName == "*") tableName = "%%";
    let colName = req.params.colName;
    if (colName == null || colName == "*") colName = "%%";
    else colName = "%" + colName + "%";
    const result = await dbLib.dbQuery(
      "select tab.name as [table], col.name as [column], t.name as data_type, col.max_length, col.precision, col.is_nullable " +
        "from sys.tables as tab " +
        "inner join sys.columns as col on tab.object_id = col.object_id " +
        "left join sys.types as t on col.user_type_id = t.user_type_id " +
        "where tab.name like ? and col.name like ? " +
        "order by tab.name, col.name",
      [tableName, colName],
      false,
      "HHT735"
    );
    res.send(result);
  } catch (err) {
    console.log("FCD339", err);
    res.status(500).send("List table defnitions failed");
  }
});

router.get("/listLogTables", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbQuery(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%_log' ORDER BY TABLE_NAME",
      [],
      false,
      "HHT529"
    );
    res.send(result);
  } catch (err) {
    console.log("FCD429", err);
    res.status(500).send("List log tables failed");
  }
});

router.get("/listLogTable/:table/:period/:start/:maxLines", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    let sql = "SELECT * FROM " + req.params.table + " WHERE period=? ";
    sql += "ORDER BY id OFFSET " + req.params.start + " ROWS FETCH NEXT " + req.params.maxLines + " ROWS ONLY";
    const result = await dbLib.dbQuery(sql, [req.params.period], false, "HFT629");
    res.send(result);
  } catch (err) {
    console.log("FCD429", err);
    res.status(500).send("List log table failed");
  }
});

router.get("/fieldList/:table", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;

  const tableName = req.params.table;
  let sql =
    "SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH " + "FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=?";
  try {
    const result = await dbLib.dbQuery(sql, [tableName], false, "HFN663");
    res.send(result);
  } catch (err) {
    console.log("HCK529", err);
    res.status(500).send("fieldList lookup failed");
  }
});

router.get("/savedQueries", async function (req, res, next) {
  let sql = "SELECT * FROM savedQueries order by queryName";
  try {
    const result = await dbLib.dbQuery(sql, [], false, "GGV832");
    res.send(result);
  } catch (err) {
    console.log("GGV743", err);
    res.status(500).send("query lookup failed");
  }
});

router.get("/deleteQuery/:table/:queryName", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;

  const tableName = req.params.table;
  const queryName = req.params.queryName;

  let sql = "DELETE FROM savedQueries WHERE tableName=? AND queryName=?";
  try {
    const result = await dbLib.dbQuery(sql, [tableName, queryName], false, "GKV832");
    res.send(result);
  } catch (err) {
    console.log("GGV343", err);
    res.status(500).send("query delete failed");
  }
});

router.post("/saveQuery", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;

  try {
    let data = { tableName: req.body[0].tableName, created: "now()", queryName: req.body[0].queryName, info: req.body[0].json };
    await dbLib.dbDeleteRows("savedQueries", "queryName=?", [data.queryName]);
    const result = await dbLib.dbInsertObject("savedQueries", data);
    console.log("BGH493", result);
  } catch (e) {
    console.log("BGR444", e);
    res.send({ status: "Error" });
  }

  res.send({ status: "Ok" });
});

router.get("/getSavedQuery/:tableName/:queryName?", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;

  try {
    const tableName = req.params.tableName;

    let queryName = req.params.queryName;
    if (queryName == null) queryName = "*";

    const sql = "SELECT * FROM savedQueries WHERE tableName=? AND (queryName=? OR '*'=?) ORDER BY queryName";
    const result = await dbLib.dbQuery(sql, [tableName, queryName, queryName], false, "LKJ885");
    res.send(result);
  } catch (e) {
    console.log("BGR464", e);
    res.send({ status: "Error" });
  }
});

router.get("/tableList", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;

  try {
    const result = await dbLib.dbQuery(
      "SELECT distinct(TABLE_NAME) tableName FROM INFORMATION_SCHEMA.COLUMNS ORDER BY tableName",
      [],
      false,
      "JHN663"
    );
    res.send(result);
  } catch (err) {
    console.log("VFK529", err);
    res.status(500).send("tableList lookup failed");
  }
});

//tables accessible to admin (mostly lookup tables, all are of limited length, thus no paging)
const tables = [
  "loginsources",
  "datasources",
  "banner",
  "bpay_pi_code",
  "calcdetails",
  "cronjobs",
  "cron_errors",
  "config",
  "date",
  "eftpos_financial_instcode",
  "error_codes",
  "fi_details",
  "fi_frameworks",
  "fi_forms",
  "fi_forms_log",
  "historyuploads",
  "hvcs_bic",
  "rd_framework_map",
  "referencefiles",
  "streams",
  "subgroups",
  "tbl000_psms_voting_entitlement",
  "tbl001_indue_calc",
  "tbl005_tabledetails",
  "tbl008_weight",
  "tbl010_streamtype",
  "tbl011_inward_and_outward",
  "aggregatorcalc",
  "uploads",
  "reportconfig",
];

router.get("/sortLabels", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const result = await dbLib.dbQuery("SELECT * from config WHERE name='sortLabels'");
    res.send(result);
  } catch (err) {
    console.log("HNG611", err);
    res.status(500).send("Load sortLabels  failed");
  }
});

router.get("/FIsNoFrameworks", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  try {
    const today = dateUtils.getYYYYMMDD(new Date(), "-");
    const result = await dbLib.dbQuery(
      "select FI_ID, FI_Name, Primary_Mnemonic FROM FI_Details WHERE status <> 'inactive' AND FI_ID NOT IN ( " +
        "SELECT min(ff.FI_ID) FI_ID " +
        "FROM FI_Forms ff, FI_FRameworks fr, FI_Details fd  " +
        "WHERE ff.FI_ID = fd.FI_ID AND ff.FI_ID=fr.FI_ID " +
        "AND ff.Start_Date <? AND ff.End_Date >= ? " +
        "GROUP BY ff.fi_id) ORDER BY FI_Name",
      [today, today],
      true,
      "KJH666"
    );
    res.send(result);
  } catch (err) {
    console.log("GFD426", err);
    res.status(500).send("Load FI with no Frameworks failed");
  }
});

router.get("/cron_errors/markRead/:id", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  const tableName = "cron_errors";
  const id = req.params.id;
  // console.log("NJJ382", tableName, id)
  try {
    let sql = "UPDATE cron_errors SET [read]='y'";
    if (id != "*") sql += " WHERE id=" + id;

    const result = await dbLib.dbQuery(sql, [], false, "LGY553");
    res.send(result);
  } catch (err) {
    console.log("HFG552", err);
    res.status(500).send("update  " + tableName + " failed");
  }
});

router.get("/cron_errors/:option/:count?", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  const tableName = "cron_errors";
  const option = req.params.option;
  let count = 100;
  if (req.params.count) count = req.params.count;

  try {
    let sql = "SELECT top (" + count + ") * from cron_errors";
    if (option == "read") sql += " WHERE [read]='y'";
    if (option == "unread") sql += " WHERE [read] <> 'y'";

    sql += " ORDER BY ID DESC";

    const result = await dbLib.dbQuery(sql);
    // console.log("KJT529", result)
    res.send(result);
  } catch (err) {
    console.log("HNG661", err);
    res.status(500).send("Load " + tableName + " failed");
  }
});

router.get("/download/:table", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  const tableName = req.params.table;
  const tableNameLower = tableName.toLowerCase();
  try {
    let sql = "SELECT * from " + tableName;
    const result = await dbLib.dbQuery(sql);
    res.send(result);
  } catch (err) {
    console.log("HNG665", err);
    res.status(500).send("Load " + tableName + " failed");
  }
});

router.get("/:table", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator"] }, res)) return;
  const tableName = req.params.table;
  const tableNameLower = tableName.toLowerCase();
  try {
    if (tables.includes(tableNameLower) || tableNameLower.includes("stats")) {
      let sql = "SELECT * from " + tableName;

      if (tableName == "referenceFiles") sql += " ORDER BY ID DESC";

      const result = await dbLib.dbQuery(sql);
      res.send(result);
    } else res.status(405).send("Access to table " + tableName + " not permitted");
  } catch (err) {
    console.log("HNG665", err);
    res.status(500).send("Load " + tableName + " failed");
  }
});

router.get("/:table/:id", auth, async function (req, res) {
  if (!authorisation.check(req.userInfo, { roles: ["admin", "operator", "user"] }, res)) return;
  const tableName = req.params.table;
  const tableNameLower = tableName.toLowerCase();
  // console.log("MJY759", tableNameLower);
  try {
    if (tables.includes(tableNameLower) || tableNameLower.includes("stats")) {
      const id = req.params.id;
      // console.log("MJY759", tableNameLower, id);
      let sql;
      let result;
      if (id == "top") {
        sql = "SELECT TOP(1) * from " + tableName;
        result = await dbLib.dbQuery(sql);
      } else if (id == "first") {
        // sql = "SELECT TOP(1) * from " + tableName;
        // result = await dbLib.dbQuery(sql);
        // console.log("BFU445 FIRST", result);

        sql =
          "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH AS MAX_LENGTH, IS_NULLABLE, " +
          "NUMERIC_PRECISION, NUMERIC_SCALE, CHARACTER_MAXIMUM_LENGTH " +
          "FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? ";
        const res = await dbLib.dbQuery(sql, [tableName]);
        result = { status: "Ok", recordset: [] };
        result.recordset.push();
        let rowInfo = new Object();
        for (let row of res.recordset) {
          // console.log("NHY666", row);
          if (row.COLUMN_NAME == "id") rowInfo[row.COLUMN_NAME] = 1234;
          else {
            switch (row.DATA_TYPE.toLowerCase()) {
              case "int":
                rowInfo[row.COLUMN_NAME] = "int " + row.NUMERIC_PRECISION;
                break;
              case "decimal":
                rowInfo[row.COLUMN_NAME] =
                  "decimal " + row.NUMERIC_PRECISION + "." + row.NUMERIC_SCALE + row.IS_NULLABLE == "NO" ? " NOTNULL" : "";
                break;
              case "varchar":
                rowInfo[row.COLUMN_NAME] = "varchar " + row.MAX_LENGTH;
                break;
              case "datetime":
                rowInfo[row.COLUMN_NAME] = "datetime";
                break;
              default:
                rowInfo[row.COLUMN_NAME] = "varchar " + row.MAX_LENGTH;
                break;
            }
          }
        }
        result.recordset.push(rowInfo);
      } else {
        sql = "SELECT * from " + tableName + " WHERE id=" + id;
        result = await dbLib.dbQuery(sql);
      }
      // console.log("NGT552", result)
      res.send(result);
    } else res.status(405).send("Access to table " + tableName + " not permitted");
  } catch (err) {
    console.log("HNG665", err);
    res.status(500).send("Load " + tableName + " failed");
  }
});

router.post("/save/:op/:table", auth, async function (req, res, next) {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;

  // console.log("NDU556 save", "body=", req.body);

  const tableName = req.params.table;
  let id = null;
  let op = req.params.op;
  if (req.body[0].name == "id") {
    id = req.body[0].value;
  }
  let data = "";
  for (const field of req.body) {
    if (data.length > 0) data += ", ";
    data += field.name + "=" + field.value;
    // console.log("GFT554 save", field.name, field.value);
  }
  await dbLib.dbAudit(op + " " + tableName + " " + data, req.userInfo);

  try {
    let result;
    switch (op) {
      case "create":
      case "new":
        result = await dbLib.dbInsert(tableName, req.body, null, false, null, req.userInfo);
        //should be status:Ok
        break;
      case "edit":
        result = await dbLib.dbUpdate(tableName, id, req.body, false, "JFT637");
        //result = await dbLib.dbUpdate("TESTESTEST", id, req.body);
        //should be status:Ok
        break;
      case "delete":
        result = await dbLib.dbDeleteRows(tableName, "id=" + id);
        //should be status:Ok
        break;
      default:
        await dbLib.dbAudit(op + " ILLEGAL " + tableName, req.userInfo, "ZZZ777");
        res.status(500).send("Illegal operation " + op);
        return;
    }
    if (result.status != "Ok") {
      await dbLib.dbAudit(op + " FAILED " + tableName, req.userInfo, result.errorCode, result.err);
    }
    res.send(result);
  } catch (err) {
    console.log("HNG665", err);
    await dbLib.dbAudit(op + " FAILED " + tableName, req.userInfo, "HNG665", err);
    res.status(500).send("Load " + tableName + " failed");
  }
});

module.exports = router;
