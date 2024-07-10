const Mssql = require("mssql");
const dateUtils = require("./dateUtils");

const STATUS_OK = "Ok";
const STATUS_ERROR = "Error";
var connectionConfig = null;
//this is make Quokka happy
connectionConfig = {
  server: global.gConfig.dbserver,
  user: global.gConfig.dbuser,
  password: global.gConfig.dbpassword,
  database: global.gConfig.dbdatabase,
  encrypt: global.gConfig.dbencrypt,
  connectTimeout: global.gConfig.dbconnectTimeout,
  requestTimeout: global.gConfig.dbconnectTimeout, //try this
  debug: global.gConfig.dbDebug,
  port: global.gConfig.dbport,
  pool: {
    max: 8,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

//these named queries could be stored procedures
const queries = {
  listData: "SELECT * FROM extracted_data WHERE uploads_ID = ?",
  listAllTables: "SELECT * FROM SYSOBJECTS WHERE xtype = 'U' ORDER BY name",
  tableExists: "SELECT COUNT(*) countRows FROM information_schema.tables WHERE table_schema = 'dbo' AND table_name = ?",
  uploadCounts:
    "SELECT ReportPeriod_ID, count(*) Files_Uploaded " +
    "FROM [dbo].[uploads] " +
    "WHERE approved=? AND comment<>'Generated' AND ReportPeriod_ID IS NOT NULL " +
    "GROUP BY ReportPeriod_ID   " +
    "ORDER BY ReportPeriod_ID desc",
  uploadStats:
    "SELECT ReportPeriod_ID, count(*) total, sum(IIF(approved=1 AND overwritten IS NULL AND deleted IS NULL,1,0)) uploaded, " +
    "sum(IIF(comment IS NOT NULL AND LEN(comment)> 6 AND comment NOT LIKE 'Deleted by%',1,0)) commented, " +
    "sum(IIF(approved=0,1,0)) rejected, " +
    "sum(IIF(deleted IS NOT NULL,1,0)) deleted, " +
    "sum(IIF(overwritten IS NOT NULL,1,0)) overwritten " +
    "FROM [dbo].[uploads] " +
    "WHERE comment<>'Generated' AND ReportPeriod_ID IS NOT NULL AND ReportPeriod_ID <> 'RP_NaN' AND ReportPeriod_ID <> 'RP_xx' AND ReportPeriod_ID NOT LIKE 'RP_-%' " +
    "AND ? " +
    "AND ReportPeriod_ID >= ? AND ReportPeriod_ID <= ? " +
    "GROUP BY ReportPeriod_ID   " +
    "ORDER BY ReportPeriod_ID",
  uploadsShort: "SELECT id, user_ID, user_FI_ID, FI_ID, Data_Provided, createdAt FROM [dbo].[uploads] WHERE id=?",
};

Mssql.on("error", (err) => {
  console.log("MSSQL111 error", err);
  poolErrors.push({
    errorCode: "MSSQL111",
    code: err.code,
    originalError: err.originalError,
    cfg: connectionConfig,
    err: err,
  });
});

let pool = null;
let poolErrors = [];

const getPool = async () => {
  //pool = global.pool;
  try {
    for (let i = 0; i < 3; i++) {
      if (pool == null) {
        pool = await new Mssql.ConnectionPool(connectionConfig);
        pool.on = (err) => {
          console.log("GFR554 pool error", err);
          poolErrors.push({
            errorCode: "GFR554",
            code: err.code,
            originalError: err.originalError,
            cfg: connectionConfig,
            err: err,
          });
        };
      }
      if (pool) {
        if (!pool.connected) {
          try {
            await pool.connect();
          } catch (errPool) {
            const typeOfError = typeof errPool;
            console.log("BGD212 mssql pool error " + typeOfError + " " + errPool);
            if (errPool == null) errPool = { code: "NULL", originalError: "NULL ERROR" };
            poolErrors.push({
              errorCode: "BGD212",
              code: errPool.code,
              originalError: errPool.originalError,
              cfg: connectionConfig,
              type: typeOfError,
              err: errPool,
            });
          }
        }
      }

      if (pool && pool.connected) {
        global.pool = pool;
        return pool;
      }
    }
    //tried several times
    console.log("GBD554 pool failed to connect");
    poolErrors.push({
      errorCode: "GBD554",
      code: "",
      originalError: "",
      cfg: connectionConfig,
      err: "pool failed to connect",
    });
    return null;
  } catch (e) {
    console.log("TRD443 pool problem", e);
    poolErrors.push({
      errorCode: "TRD443",
      code: e.code,
      originalError: e.originalError,
      cfg: connectionConfig,
      err: e,
    });
    return null;
  }
};

function getPoolErrors() {
  return poolErrors;
}

function escape_string(s) {
  if (typeof s == "string") {
    const sOut = s.replace(/'/g, "''");
    return sOut;
  } else {
    return s;
  }
}

const checkVersion = () => {
  return "Version TransactSql v0.1";
};

const getParam = (param) => {
  let val = null;
  if (param == null) {
    val = "NULL";
  } else if (Array.isArray(param)) {
    let s = "";
    for (const a of param) {
      if (s.length > 0) s += ", ";
      s += getParam(a);
    }
    val = s;
  } else if (!isNaN(param)) {
    val = param;
  } else if (typeof param == "boolean") {
    val = param ? 1 : 0;
  } else if (param.includes(">") || param.includes("=")) {
    val = param;
  } else {
    let p = param;
    if (p.endsWith(":string")) p = p.substring(0, p.length - 7);
    val = "'" + escape_string(p) + "'";
  }
  // console.log("NGR555 getParam", param, "=>", val)
  return val;
};

const dbInsertParams = (sql, params, logName = "") => {
  try {
    if (typeof params != "undefined" && params && params.length > 0) {
      params.forEach((param) => {
        let val;

        //this is to handle IN, but callers reposibility to add the IN
        if (Array.isArray(param)) {
          val = "(";
          let first = true;
          for (const v of param) {
            if (!first) val += ", ";
            val += getParam(v);
            first = false;
          }
          val += ")";
        } else {
          val = getParam(param);
        }

        if (sql.indexOf("?") == -1) {
          console.log("BSH334 " + logName + " Too many parameters for sql " + sql);
          return sql;
        }
        sql = sql.replace("?", val);
      });
      if (sql.indexOf("?") > -1) {
        console.log("BSH334 " + logName + " Insufficient parameters for sql " + sql);
      }
    }
    sql = sql.replace("=NULL", " IS NULL");
    return sql;
  } catch (e) {
    console.log("HDR345 " + logName + " dbInsertParams error", e);
    return null;
  }
};

const dbAudit = async (operation, user = null, errCode = null, errMsg = null) => {
  await dbWriteAudit("Audit", operation, user, errCode, errMsg);
};

const dbAuditLogin = async (operation, user = null, errCode = null, errMsg = null, jwt = null, token = null) => {
  await dbWriteAudit("Logins", operation, user, errCode, errMsg, jwt, token);
};

const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

const dbWriteAudit = async (table, operation, user, errCode, errMsg, jwt = null, token = null) => {
  try {
    if (table == "Logins" || table == "Audit") {
      let userName = "unknown";
      let userGroups = "";
      let ip = "";
      let email = "";

      //see if we have a message we can get
      let msg = errMsg;
      if (msg) {
        if (errMsg.message) msg = errMsg.message;
        if (errMsg.errMsg) msg = errMsg.errMsg;
        if (errMsg.errMessage) msg = errMsg.errMessage;
        if (errMsg.errorMsg) msg = errMsg.errorMsg;
        if (errMsg.errorMessage) msg = errMsg.errorMessage;
      }
      if (isObject(msg)) msg = "object";

      if (user) {
        try {
          userName = user.user_ID;
          if (user.Email) email = user.Email;
          else email = "unknown";
          if (user.ip) {
            ip = user.ip; //NB only known at login, so an empty field in Audit. Oh, the waste!
          }
          for (let grp of user.Group) userGroups += grp + " ";
        } catch {}
      }
      let data = {
        date: "now()",
        operation: operation,
        userName: userName,
        ip: ip,
        groups: userGroups ? userGroups.substring(0, 7999) : null,
        errCode: errCode,
        errMsg: msg ? msg.substring(0, 7999) : null,
        email: email ? email.substring(0, 254) : null,
      };
      if (jwt != null && table == "Logins") data.jwt = jwt;
      if (token != null && table == "Logins") data.token = token;
      await dbInsertObject(table, data);
    } else {
      console.log("FRE888 audit error", table, operation);
      await dbAudit("Bad table call to audit " + table + " " + operation, user, errCode, null);
    }
  } catch (e) {
    console.log("VFR989 Audit Error", table, e);
    if (table == "Logins") {
      await dbAudit("Bad Logins SQL" + operation, user, errCode, e);
    }
  }
};

const dbDropTable = async (tableName, log = false, logName = "") => {
  const fullSql = "DROP TABLE IF EXISTS " + tableName;
  if (log) console.log("FVH382 ", logName, "connectTimeout", connectionConfig.connectTimeout, "fullsql", fullSql);
  try {
    let myPool = await getPool();
    let result = await myPool.request().query(fullSql);
    if (log) console.log("GBH773", logName, fullSql, result);
    return { status: STATUS_OK };
  } catch (err) {
    console.log("BGR552 query error ", fullSql, err);
    return {
      status: STATUS_ERROR,
      errorCode: "BGR552",
      sql: fullSql,
      err: err,
    };
  }
};

const dbTrim = async (table = "Action", maxDays = 150, log = false, logName = "") => {
  const fullSql = "DELETE " + table + " WHERE date < (GETDATE()-" + maxDays + ") OR date IS NULL";
  try {
    let myPool = await getPool();
    let result = await myPool.request().query(fullSql);
    if (log) console.log("GVD554", logName, fullSql, result);
    return { status: STATUS_OK };
  } catch (err) {
    console.log("GSU654 query error ", fullSql, err);
    return {
      status: STATUS_ERROR,
      errorCode: "GSU654",
      sql: fullSql,
      err: err,
    };
  }
};

const dbQuery = async (sql, params = [], log = false, logName = "") => {
  const fullSql = dbInsertParams(sql, params, logName);
  if (log) {
    // console.log("VFR123 ", logName, "sql", sql);
    console.log("VFR124 ", logName, "sql", fullSql);
  }
  try {
    let myPool = await getPool();
    if (myPool == null) {
      console.log("BHE394 pool connect failed");
      return { status: STATUS_ERROR, err: "DB Connection failed" };
    }
    let result = await myPool.request().query(fullSql);
    // if (log)
    //   console.log(
    //     "JYG223",
    //     logName,
    //     result.recordset ? result.recordset.length + " records" : "No records",
    //     result
    //   );
    return {
      status: STATUS_OK,
      recordset: result.recordset,
      rowsAffected: result.rowsAffected,
      sql: fullSql,
    };
  } catch (err) {
    console.log("BAH664 " + logName + " dbQuery error ", sql, "\n", fullSql, "\n", "err[", err, "]", typeof err);
    return {
      status: STATUS_ERROR,
      errorCode: "BAH664",
      sql: fullSql,
      params: params,
      err: err,
    };
  }
};

const dbQueryBinary = async (sql, colName, log = false) => {
  if (log) console.log("GDR547 sql", sql);
  try {
    let myPool = await getPool();
    let result = await myPool.request().query(sql);

    return result.recordset[0][colName];
  } catch (err) {
    console.log("BAH665 query error", sql, err);
    return { status: STATUS_ERROR, errorCode: "BAH665", sql: sql, err: err };
  }
};

const dbNamedQuery = async (name, params = [], log = false, logName = "") => {
  if (log) console.log("NGR333 dbNamedQuery", name, params, "log", log, "logName", logName);
  try {
    if (queries[name]) {
      const q = queries[name];
      const paramCount = (q.match(/\?/g) || []).length; //how many question marks. ie params needed
      // console.log("GHY662", paramCount, params.length);
      if (paramCount != params.length) {
        console.log("BGR254", logName, " dbNamedQuery [" + name + "] bad param count", params.length, "should be", paramCount);
        console.log("BGR255", params);
        return {
          status: STATUS_ERROR,
          errorCode: "GVF553",
          sql: "Query name " + name + " has incorrect param count. Needs " + paramCount + ", got " + params.length,
          params: params,
          err: "Query name " + name + " has incorrect param count. Needs " + paramCount + ", got " + params.length,
        };
      }
      const fullSql = dbInsertParams(q, params, logName);
      if (log) console.log("BGR123 sql", logName, name, fullSql);
      try {
        let myPool = await getPool();
        if (myPool == null)
          return {
            status: STATUS_ERROR,
            errorCode: "UJT445",
            err: "DB Connection failed",
          };
        let result = await myPool.request().query(fullSql);

        if (log) console.log("BGR124", logName, result.recordset.length + " records"); //, result.recordset);
        if (log) console.log("BGR125", logName, result.recordset); //, result.recordset);

        return { status: STATUS_OK, recordset: result.recordset };
      } catch (err) {
        console.log("GDR523 namedQuery [" + name + "] error ", err, fullSql);
        return {
          status: STATUS_ERROR,
          errorCode: "GDR523",
          sql: fullSql,
          params: params,
          err: err,
        };
      }
    } else {
      console.log("VDF443 No query named " + name);
      return {
        status: STATUS_ERROR,
        errorCode: "VFD443",
        sql: "No query named " + name,
        err: "No query named " + name,
        params: params,
      };
    }
  } catch (e) {
    console.log("dbNamedQuery error", e);
    return {
      status: STATUS_ERROR,
      errorCode: "BHR834",
      sql: "Failed query name " + name,
      err: e,
      params: params,
    };
  }
};

function dbIsNumeric(s) {
  if (typeof s === "number") return true;
  const result = /^\d+$/.test(s);
  return result;
}

function dbEscape(s) {
  // if (typeof s == "string") console.log("dbescape111 ", s, s.replace(/'/g, "''"));
  // else console.log("dbescape222", s, typeof s);

  if (typeof s == "string") return s.replace(/'/g, "''");
  else return s;
}

const dbInsertSQL = (table, params = [], returnId = false, log = false, logName = null, userInfo) => {
  let sql = "INSERT INTO " + table + " (";

  let vals = " VALUES (";
  if (typeof params != "undefined" && params.length > 0)
    for (var p = 0; p < params.length; p++) {
      const param = params[p];
      if (p > 0) {
        sql += ", ";
        vals += ", ";
      }
      sql += "[" + param.name + "]";

      if (param.value == "now()") vals += "GETDATE()";
      else if (userInfo && param.value == "user()") vals += "'" + userInfo.user_ID + "'";
      else if (dbIsNumeric(param.value) && param.type && param.type == "INT") {
        vals += param.value;
      } else if (param.value === null || "null" === param.value || "NULL" === param.value) vals += "NULL";
      else vals += "'" + dbEscape(param.value) + "'";
    }
  sql += ") ";
  if (returnId) sql += "\nOUTPUT INSERTED.ID\n";
  sql += vals + ")";
  if (log) console.log("HDY382", logName, sql);
  return sql;
};

const dbInsert = async (table, params = [], returnId = false, log = false, logName = "", userInfo = null) => {
  // if (userInfo) console.log("NSY392", userInfo);
  let sql;
  try {
    sql = dbInsertSQL(table, params, returnId, log, logName, userInfo);
    if (log) console.log("QAG112 dbInsert " + logName, sql);
    const myPool = await getPool();
    const response = await myPool.request().query(sql);
    if (returnId) {
      if (log) console.log("FFR319 dbInsert " + logName, response.recordset[0].ID);
      return { status: STATUS_OK, id: response.recordset[0].ID };
    } else return { status: STATUS_OK };
  } catch (err) {
    if (logName != "none") console.log("FVG773 error ", sql, err);
    return { status: STATUS_ERROR, errorCode: "FVG773", err: err };
  }
};

const dbInsertObjectSQL = (table, params = {}, returnId = false, log = false, logName = "", warningsOff = false) => {
  if (log) console.log("bdy223", logName, params);
  let sql = "";
  if (warningsOff) sql += "SET ANSI_WARNINGS OFF\n";
  sql += "INSERT INTO " + table + " (";

  let vals = " VALUES (";
  if (typeof params != "undefined") {
    let p = 0;
    for (var key in params) {
      const val = params[key];

      if (p++ > 0) {
        sql += ", ";
        vals += ", ";
      }
      sql += "[" + key + "]";

      if (val == null) vals += "NULL";
      else if (val == "now()" || val == "currentDate") vals += "GETDATE()";
      else if (dbIsNumeric(val)) {
        vals += val;
      } else vals += "'" + dbEscape(val) + "'";
    }
    sql += ") ";
    if (returnId) sql += " OUTPUT INSERTED.ID  ";
    sql += vals + ")";
    if (warningsOff) sql += "\nSET ANSI_WARNINGS ON";

    if (log) {
      console.log("NDY485 " + logName + " insertObject", sql);
      // await dbWriteAudit("Audit", "SQLinsertObject", null, "NDY485", sql, null);
    }
  }
  return sql;
};

const dbInsertObject = async (table, params = {}, returnId = false, log = false, logName = "", warningsOff = false) => {
  let sql = "";
  try {
    sql += dbInsertObjectSQL(table, params, returnId, log, logName, warningsOff);

    const myPool = await getPool();
    const response = await myPool.request().query(sql);
    if (log) console.log("HYF473", logName, response);
    if (returnId) return { status: STATUS_OK, id: response.recordset[0].ID };
    else return { status: STATUS_OK };
  } catch (err) {
    if ("none" != logName) {
      console.log("ASW333 " + logName + " dbInsertObject error", err.message, sql, err);
      console.log("ASW444 " + logName, params);
    }
    return {
      status: STATUS_ERROR,
      errorCode: "ASW333",
      sql: sql,
      errMsg: err.message,
      err: err,
    };
  }
};

const dbClearTable = async (table, log = false) => {
  try {
    const sql = "DELETE FROM " + table;
    if (log) console.log("KHY553 clearTable", sql);

    const myPool = await getPool();
    const result = await myPool.request().query(sql);
    //console.log("BGF428 clearTable", table, result);
    return { status: STATUS_OK };
  } catch (err) {
    console.log("BVV943 clearTable error ");
    return { status: STATUS_ERROR, errorCode: "BVV943", err: err };
  }
};

const dbUpdate = async (table, id, params, log = false, logName = "") => {
  let sql;
  try {
    if (log) console.log("HHG733 dbUpdate " + logName + " params", params);

    sql = "UPDATE " + table + " SET ";

    let first = true;
    params.forEach((param) => {
      if (param.name == "id") id = param.value;
      if (param.name != "id") {
        if (!first) {
          sql += ", ";
        }
        sql += "[" + param.name + "]";
        const val = param.value;
        if (val == null || (typeof val == "string" && val == "")) sql += "=NULL";
        else if (val == "now()" || val == "currentDate") sql += "=GETDATE()";
        else sql += "='" + escape_string(val) + "'";
        first = false;
      }
    });
    if (id != "*") sql += " WHERE id=" + id;

    if (log) console.log("HTF524 dbUpdate " + logName + " SQL", sql);

    const myPool = await getPool();
    const result = await myPool.request().query(sql);
    if (log) console.log("GFY765", logName, result);

    return { status: STATUS_OK };
  } catch (err) {
    console.log("BYJ527 error ", sql, err);
    return { status: STATUS_ERROR, errorCode: "BXJ526", err: err };
  }
};

const dbGetConfig = async (name, def = null) => {
  try {
    const result = await dbQuery("SELECT * FROM config where name=?", [name]);
    if (result.status == "Ok") {
      if (name.toLowerCase().includes("date")) return result.recordset[0].Date;
      return result.recordset[0].value;
    }
    return null;
  } catch (e) {
    console.log("NSU382 dbGetConfig", name, e);
    return def;
  }
};

const dbRename = async (oldName, newName) => {
  try {
    let res = await dbTableExists(oldName);
    if (res) {
      const result = await dbQuery(`sp_rename '${oldName}', '${newName}'`, []);
      if (result.status == "Ok") {
        return { status: "Ok" };
      }
    } else return {status:"Ok"}
    return { status: "Error" };
  } catch (e) {
    console.log("GBD729 dbRename", oldName, newName, e);
    return { status: "Error" };
  }
};

const dbTableExists = async (tableName) => {
  try {
    let sql = queries.tableExists;
    sql = dbInsertParams(sql, [tableName]);

    const myPool = await getPool();
    const result = await myPool.request().query(sql);

    //console.log("NDF538 table " + tableName + " exists " + result.recordset[0].countRows);
    return result.recordset[0].countRows == 1;
  } catch (err) {
    return false;
  }
};

const dbCreateNewTable = async (tableName, log = false, logName = null) => {
  try {
    let sql = "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='" + tableName + "' AND xtype='U')\n";
    sql += "   CREATE TABLE " + tableName + " ( " + "id int identity not null primary key";
    sql += ")";
    const params = [];
    await dbQuery(sql, params, log, logName);
    return { status: STATUS_OK };
  } catch (err) {
    console.log("HFD372 createNewTable error", err);
    return { status: STATUS_ERROR, errorCode: "HFD372", err: err };
  }
};

const dbCopyTable = async (tableName, newTableName, extraCols = [], moreWhere = null, log = false) => {
  try {
    //let sql = "IF EXISTS (SELECT * FROM sysobjects WHERE name='" + tableName + "' AND xtype='U' )"
    let sql = "SELECT * INTO " + newTableName + " FROM " + tableName;
    if (moreWhere) sql += " WHERE " + moreWhere;
    const params = [];
    let result = await dbQuery(sql, params, log);
    if (log) console.log("NFGY293", result);
    if (result.status == "Ok") {
      result = await dbAddCols(newTableName, extraCols, log);
      console.log("FFD427", result);
    }
    return { result };
  } catch (err) {
    console.log("HFD372 createNewTable error", err);
    return { status: STATUS_ERROR, errorCode: "HFD372", err: err };
  }
};

const dbGetColName = (col) => {
  return col.name.replace(/\W/g, "");
};

const dbGetColType = (col) => {
  if (col.type) {
    switch (col.type.toUpperCase()) {
      case "INT":
      case "":
        return "INT";
      case "TEXT":
      case "TXT":
        return "varchar(255)";
      case "BIGTEXT":
      case "BIGTXT":
        return "varchar(max)";
      case "DATE":
      case "DATETIME":
        return "datetime";
      default:
        return col.type;
    }
  }
  return "INT";
};

const dbAddCols = async (tableName, cols, log = false) => {
  let sql = "";
  try {
    let count = 0;
    cols.forEach((col) => {
      const colName = dbGetColName(col);
      sql += "IF COL_LENGTH('" + tableName + "', '" + colName + "') IS NULL\n";
      sql += "BEGIN\n";
      sql += "   ALTER TABLE " + tableName + "\n";
      sql += "   ADD [" + colName + "] " + dbGetColType(col);
      if (typeof col.def != "undefined") {
        sql += " NOT NULL DEFAULT " + col.def;
      }
      sql += "\n";
      sql += "END\n";
      count++;
    });
    if (log) console.log("NHD638 dbAddCols", sql);
    if (count > 0) {
      const myPool = await getPool();
      const result = await myPool.request().query(sql);
    }
    return { status: STATUS_OK };
  } catch (err) {
    console.log("BDF384 addCols " + sql);
    return { status: STATUS_ERROR, errorCode: "BDF384", err: err };
  }
};

const dbDeleteRows = async (table, where = null, params = [], log = false, logName = "") => {
  let sql;
  try {
    sql = "DELETE FROM " + table;
    if (where) sql += " WHERE " + where;
    sql = dbInsertParams(sql, params, logName);
    if (log) console.log("FRT666 " + logName + " dbDeleteRows", sql);
    const myPool = await getPool();
    const result = await myPool.request().query(sql);
    if (log) console.log("DRF637 " + logName + " dbDeleteRows  rowsAffected", result.rowsAffected);
    return { status: STATUS_OK, rowsAffected: result.rowsAffected };
  } catch (e) {
    console.log("HDR283 dbSqDeleteRows " + table + " Error", sql, e);
    return { status: STATUS_ERROR, errorCode: "HDR283", err: e };
  }
};

const dbLookup = async (table, lookup_field, sought, result_field) => {
  const sql = "SELECT " + result_field + " xxx FROM " + table + " WHERE " + lookup_field + "=?";
  const params = [sought];
  const result = await dbQuery(sql, params); //, true, "HJJ732");
  try {
    return result.recordset[0].xxx;
  } catch (e) {
    return null;
  }
};

const dbAddBinary = async (table, idColName, id, colName, data) => {
  try {
    const myPool = await getPool();
    var ps = new Mssql.PreparedStatement(myPool);
    ps.input("data", Mssql.VarBinary);
    const sql = "UPDATE " + table + "  SET " + colName + "=(@data) WHERE " + idColName + "='" + id + "'";
    //console.log("NDY483 sql=" + sql);

    //console.log("FTG662 sql prepare");
    await ps.prepare(sql);

    //console.log("FTG662 sql execute");
    await ps.execute({ data: data });

    //console.log("FTG662 sql UNprepare");
    await ps.unprepare();
    //console.log("FTG662 complete");
    return { status: STATUS_OK };
  } catch (e) {
    console.log("BFS483 error", e);
    return { status: "error3" };
  }
};

const dbGetFI = async (Mnemonic, log = false, logName = null) => {
  console.log("NNH666 dbGetFI", Mnemonic);
  try {
    let sql = "SELECT TOP(1) FI_ID FROM FI_Details WHERE Primary_Mnemonic=?";
    sql = dbInsertParams(sql, [Mnemonic], logName);

    const myPool = await getPool();
    const result = await myPool.request().query(sql);
    const FI_ID = result.recordset[0].FI_ID;
    if (log) console.log("GBF553 " + logName + " getFI_ID", Mnemonic, FI_ID, sql);
    return FI_ID;
  } catch (err) {
    console.log("NNV665 dbLib.dbGetFI", Mnemonic, err);
    return null;
  }
};

const dbSetAction = async (opName, operation, userInfo = null, log = false, logName = null) => {
  if (log) console.log("AHYS839", "opName", opName, "operation", operation, "logName", logName);
  if (opName) {
    try {
      let sql = "UPDATE Action SET operation='" + operation + "', [Date]=getDate() WHERE name=?";
      if (log) console.log("BSY112", logName, sql);
      let result = await dbQuery(sql, [opName], log, logName);
      if (result.rowsAffected == 0) {
        result = await dbInsert("Action", [
          { name: "name", value: opName },
          { name: "operation", value: operation },
        ]);
      }
      if (
        !operation.includes("Completed") &&
        !operation.includes("table") &&
        !operation.includes("Error_Codes") &&
        (operation.includes("err") || operation.includes("Err"))
      )
        await dbAudit("Action " + opName, userInfo, "Error", operation);
    } catch (err) {
      console.log("FJY294", err);
    }
  }
};

module.exports = {
  OK: STATUS_OK,
  ERROR: STATUS_ERROR,
  getParam: getParam, //TEST
  getPoolErrors: getPoolErrors,
  checkVersion: checkVersion,
  dbAddBinary: dbAddBinary,
  dbAddCols: dbAddCols,
  dbAudit: dbAudit,
  dbAuditLogin: dbAuditLogin,
  dbClearTable: dbClearTable,
  dbCopyTable: dbCopyTable,
  dbCreateNewTable: dbCreateNewTable,
  dbDeleteRows: dbDeleteRows,
  dbDropTable: dbDropTable,
  dbGetConfig: dbGetConfig,
  dbGetFI: dbGetFI,
  dbInsert: dbInsert,
  dbInsertObject: dbInsertObject,
  dbInsertObjectSQL: dbInsertObjectSQL,
  dbInsertParams: dbInsertParams,
  dbInsertSQL: dbInsertSQL,
  dbNamedQuery: dbNamedQuery,
  dbQuery: dbQuery,
  dbQueryBinary: dbQueryBinary,
  dbRename: dbRename,
  dbSetAction: dbSetAction,
  dbTableExists: dbTableExists,
  dbTrim: dbTrim,
  dbUpdate: dbUpdate,
};
