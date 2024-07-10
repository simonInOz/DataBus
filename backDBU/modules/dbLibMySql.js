const mysql = require("mysql");

const connect = () => {
  var con = mysql.createConnection({
    host: "localhost",
    user: "apnUser",
    database: "testdb",
    password: "blueMoon1666",
  });
  return con;
};

const query = (res, name, sql, parms = []) => {
  var con = connect();
  con.connect((err) => {
    if (err) res.send(name + " Connection error " + err);
    else {
      con.query(sql, parms, (err, rows) => {
        if (err) res.send(name + " query error" + err + " id=" + parms[0]);
        else res.send(rows);
        con.end();
      });
    }
  });
};

const tableExists = (schema, tablename, exists) => {
  const sql =
    "SELECT COUNT(*) rowcount FROM information_schema.tables " +
    "WHERE table_schema = ? " +
    "AND table_name = ?";
  var con = connect();
  con.connect((err) => {
    if (err) {
      exists(tablename, false, err);
    } else {
      con.query(sql, [schema, tablename], (err, rows) => {
        if (err) {
          con.end();
          exists(false, err);
        } else {
          const rowCount = rows[0].rowcount;
          con.end();
          exists(rowCount==1);
        }
      });
    }
  });
};

module.exports = {
  query: query,
  tableExists: tableExists,
};
