var dbLib = require("../modules/dbLibTransactSql");

class DominoRest {
  server = null;
  port = null;
  user = null;
  pwd = null;
  loginURL = null;
  bearer = null;
  lastBody = null;
  lastURL = null;
  idDataSources = null;
  tableName=null;

  constructor(server = null, port = null, loginURL = null, user = null, pwd = null) {
    this.server = server;
    this.port = port;
    this.loginURL = loginURL;
    this.user = user;
    this.pwd = pwd;
  }

  async initByTablename(tableName) {
    let result = await dbLib.dbQuery(
      `select top(1) * from DataSources where name='${tableName}' AND active='Yes' order by id desc`,
      [],
      false,
      "LKI333"
    );
    // console.log("NNH739", result);
    if (result.status == "Ok" && result.recordset.length == 1) {
      const rs = result.recordset[0];
      this.loginId = rs.idLoginSources;
      this.name = rs.name;
      this.getURL = rs.URL;
      this.idDataSources = rs.id;
      this.tableName=tableName;
      // console.log("NFY665", this.loginId, this.name, this.getURL);

      const resultLogin = await dbLib.dbQuery(
        `select * from LoginSources where id=${this.loginId} AND active='Yes'`,
        [],
        false,
        "LFU754"
      );
      // console.log("NNH739", result);
      if (resultLogin.status == "Ok" && resultLogin.recordset.length == 1) {
        const rsLogin = resultLogin.recordset[0];
        this.server = rsLogin.server;
        this.loginURL = rsLogin.URL;
        this.userName = rsLogin.userName;
        this.pwd = rsLogin.pwd;
        // console.log("HGR356", this.server, this.loginURL, this.userName, this.pwd);

        return { status: "Ok" };
      }
    }
    throw new Error("NDY823 Error DominoRest login"  )
  }

  login = async (userName = null, pwd = null) => {
    try {
      if (userName) this.userName = userName;
      if (pwd) this.pwd = pwd;

      let URL = "";
      if (this.server) URL += this.server;
      if (this.port) URL += ":" + this.port;
      URL += this.loginURL;
      this.lastURL = URL;
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: this.userName, password: this.pwd }),
      });

      const jBody = await response.json();

      if (jBody.bearer) {
        this.bearer = jBody.bearer;
        return true;
      }
      //return false
      throw new Error("VFY632 No bearer returned");
    } catch (err) {
      console.log("DOM765", err);
      throw err;
    }
  };

  isBearerAvailable = () => {
    if (this.bearer == null) return false;
    //check bearer timeout
    //if still valid (say for 5 minutes) return true
    return false;
  };

  get = async (getURL = null) => {
    if (getURL) this.getURL = getURL;
    if (!this.isBearerAvailable) {
      if (this.bearer == null) throw new Error(`AFR442 Attempt to get ${URL} failed. Not logged in`);
      if (!(await this.login(this.user, this.pwd))) {
        throw new Error("HYT665 Login failed");
      }
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.bearer}`,
      },
    };

    try {
      let URL = "";
      if (this.server) URL += this.server;
      if (this.port) URL += ":" + this.port;

      if (!this.getURL.startsWith("/") && !URL.endsWith("/")) URL += "/";
      URL += this.getURL;

      this.lastURL = URL;
      // console.log("DOM528 get URL", URL);

      const response = await fetch(URL, options);
      if (response.status != 200) {
        throw new Error(`DFR593 Query returned failure status ${response.status}: ${response.statusText}`);
      }
      const jBody = await response.json();
      // console.log("LDY729", jBody)
      // Add additional checks here
      return jBody;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  saveToTable = async (data, runBy, maxRows = 99999, idDataSources = null, tableName = null) => {
    if (idDataSources) this.idDataSources = idDataSources;
    if (tableName) this.tableName = tableName;

    try {
      // console.log("MFF528", this.tableName, data.length);
      const params = [
        { name: "createdAt", value: "now()" },
        { name: "tableName", value: this.tableName },
        { name: "runBy", value: runBy },
      ];
      let response = await dbLib.dbInsert("uploads", params, true); //, true, "VVV321");
      if (response.status != "Ok") {
        console.log("JUT638 throw");
        throw "BVF554 SQL error failed insert to uploads table";
      }
      const idUploads = response.id;
      // console.log("NHT736 UPLOADS table insert ok. uploads id=", idUploads);

      await dbLib.dbCreateNewTable("tempTable");
      let colNames = [];
      let cols = [];
      let row = [];
      for (let key in data[0]) {
        const originalKey = key;
        if (key.startsWith("@")) key = key.substring(1);
        cols.push({ name: key, type: "TXT" });
        colNames.push(key);
      }
      cols.push({ name: "idUploads", type: "INT" });
      // console.log("NVV854 cols", cols);
      // console.log("HDY651 row", row);
      await dbLib.dbAddCols("tempTable", cols);

      //await dbLib.dbQuery("DELETE FROM "+tableName)

      let allSql = "";
      let rowCount = 0;
      let forceAddCols = [];
      for (let dataRow of data) {
        row = [];
        for (let key in dataRow) {
          const originalKey = key;
          if (key.startsWith("@")) key = key.substring(1);
          if (!colNames.includes(key)) {
            const newCols = [{ name: key, type: "TXT" }];
            const resAddCol = await dbLib.dbAddCols("tempTable", newCols);
            if (resAddCol.status != "Ok") {
              console.log("FXJ829 error adding col", key);
              break;
            }
            colNames.push(key);
            forceAddCols.push(key);
          }
          row[key] = dataRow[originalKey];
        }
        row.idUploads = idUploads;
        let sql = dbLib.dbInsertObjectSQL("tempTable", row, false, false, "LKJ846");
        allSql += "\n" + sql;
        //const res = await dbLib.dbInsertObject("tempTable", row, false, false, "LKJ846");
        //if (res.status != "Ok") break;
        rowCount++;
        if (rowCount > maxRows) break;
        if (rowCount % 100 == 0) {
          const res = await dbLib.dbQuery(allSql, [], false, "GGR321");
          if (res.status != "Ok") {
            console.log("GFD553 Sql insert error", res);
            console.log("GFD554 ", allSql);

            await dbLib.dbQuery(allSql, [], true, "HDY483");
            throw new Error("GFD554 DominoRest sql insert error")
          }
          allSql = "";

          if (rowCount % 1000 == 0) console.log("SDE194", rowCount, "rows added");
        }
      }
      //finish
      if (allSql.length > 1) {
        let resu = await dbLib.dbQuery(allSql, [], false, "GGR321");
        if (resu.status != "Ok") {
          resu = await dbLib.dbQuery(allSql, [], true, "GGR322");
          console.log("Sql insert error", resu);
          throw new Error("BDU733 DominoRest insert error")
        }
        allSql = "";
      }

      if (forceAddCols.length > 0) console.log("NDY773 force col Add", forceAddCols);
      console.log("BSU392 added", rowCount, "rows to tempTable");

      const res = await dbLib.dbQuery(`update DataSources SET LastRun=GETDATE() WHERE id=${this.idDataSources}`, []);

      //if all ok rename temp
      const resDrop = await dbLib.dbDropTable(this.tableName + "_old");
      const resRename = await dbLib.dbRename(this.tableName, this.tableName + "_old");
      const resRename2 = await dbLib.dbRename("tempTable", this.tableName);

      console.log("BHR883", "saved", rowCount, "rows from Domino to", this.tableName);
      return { status: "Ok", rowsAffected: rowCount };
    } catch (e) {
      throw new Error("MHY665 DominoRest error " +e)
    }
  };

  getServer = () => {
    return this.server;
  };
  getPort = () => {
    return this.port;
  };
  getLoginURL = () => {
    return this.loginURL;
  };
  getBearer = () => {
    return this.bearer;
  };
  getLastBody = () => {
    return this.lastBody;
  };
  getLastURL = () => {
    return this.lastURL;
  };
}

module.exports = DominoRest;
