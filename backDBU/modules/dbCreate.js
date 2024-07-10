var dbLib = require("../modules/dbLibTransactSql");
const fs = require("fs");
const CONFIG = "./config";

const create = async () => {
  console.log("AAA111 create")
  //scan all db create files - get latest
  var files = fs.readdirSync(CONFIG);
  files.sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  let sql;
  let topFile;
  let topVer = 0;
  let errors = [];

  for (let f of files) {
    if (f.toLowerCase().startsWith("createdb_") && !f.toLowerCase().includes("retired")) {
      const ver = f.match(/(\d+)/)[0];
      //console.log("kfy444", f, ver);
      if (ver > topVer) {
        topVer = ver;
        topFile = f;
      }
    }
  }
    //run latest file
  if (topVer > 0) {
    //load file to string
    console.log("DBX111 createDb", topFile);
    sql = fs.readFileSync(CONFIG + "/" + topFile, "utf-8");
    const result = await dbLib.dbQuery(sql);
    if (result.status != "Ok") {
      errors.push(result);
      console.log("GFT374 sql ERROR", result);
    }
  }

  // for each db update file
  // run update files in order
  // update files must be repeatable
  for (let f of files) {
    if (f.toLowerCase().startsWith("updatedb_")) {
      const ver = f.match(/(\d+)/)[0];
      console.log("kfy444", CONFIG + "/" + f, ver);
      //load file to sql
      sql = fs.readFileSync(CONFIG + "/" + f, "utf-8");
      //console.log("KUY334 sql",sql)
      const result = await dbLib.dbQuery(sql);
      if (result.status != "Ok") {
        errors.push(result);
        console.log("HTF553 sql ERROR", result);
      }
    }
  }
  if (errors.length > 0) return { status: "Error", errors: errors };
  else return { status: "Ok", errors: [] };
};

module.exports = {
  create: create,
};
