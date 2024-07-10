var dbLib = require("./dbLibTransactSql");
const UPLOAD_ERRORS_TABLE = "upload_errors";

const ok = (response) => {
  if (response && response.status && response.status != dbLib.OK) return false;
  return true;
};

class ErrorHandler {
    constructor(user_ID, originalFnam) {
      this.user_ID = user_ID;
      this.originalFnam = originalFnam;
      this.errorCount = 0;
    }
  
    async insert(uploads_ID, error_level, errorCode, msg, addr = null, Data_Provided=null) {
      const params = [
        { name: "originalFilename", value: this.originalFnam },
        { name: "user_ID", value: this.user_ID },
        { name: "uploads_ID", value: uploads_ID },
        { name: "code", value: errorCode },
        { name: "error_level", value: error_level },
        { name: "addr", value: addr },
        { name: "msg", value: msg },
        { name: "Data_Provided", value: Data_Provided },
        { name: "createdAt", value: "now()" },
      ];
      this.errorCount++;
      //console.log("ERR443 errorCode",errorCode, "msg", msg);
      let response = await dbLib.dbInsert(UPLOAD_ERRORS_TABLE, params);
      if (!ok(response.status)) throw "GFC332 SQL error failed insert to upload_errors table";
    }

    async clear(uploadsID){
      const sql="DELETE "+UPLOAD_ERRORS_TABLE+" WHERE uploads_ID=?"
      await dbLib.dbQuery(sql, [uploadsID])
    }
  }
  
  module.exports = ErrorHandler;
