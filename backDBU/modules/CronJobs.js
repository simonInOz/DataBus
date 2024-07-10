const dbLib = require("../modules/dbLibTransactSql");
// var dateUtils = require("../modules/dateUtils");

// this module is run periodically using node-cron
//it loads the lst of jobs and checks what needs to be runn, runs them and updates the db

const TEST = false && global.gConfig.config_id != "prod";

async function check() {
  let status = "Ok";
  let errorList = [];

  //load list of active jobs
  const sql = "SELECT * FROM cronjobs WHERE active='Yes'";
  const result = await dbLib.dbQuery(sql);
  if (result.status != "Ok") {
    console.log("GVD528 error in getting cronjobs", result);
    errorList.push("Error in getting cronjobs");
    return { status: "Error" };
  } else {
    for (let rec of result.recordset) {
      const res = await checkJob(rec, errorList);
      if (res.status != "Ok") status = "Error";
    }
  }
  return { status: status };
}

async function checkJob(rec, errorList) {
  const id = rec.id;
  const name = rec.name;
  const freq = rec.cronFrequency;
  const op = rec.cronOperation;
  const params = rec.params;
  const lastRun = rec.lastRun;
  let createdBy = rec.createdBy;

  let status = "Ok";

  if (isDue(name, lastRun, freq, errorList)) {
    if (TEST) console.log("isDue TRUE", name, lastRun, freq);

    const result = await runJob(name, op, params, createdBy, errorList);

    // console.log("VHE823", name, freq, result);
    let sqlResult;
    if (freq == "Once") {
      sqlResult = await dbLib.dbUpdate(
        "cronJobs",
        id,
        [
          { name: "Active", value: "No" },
          { name: "lastRun", value: "now()" },
        ],
        false,
        "JGY428"
      );
    } else if (result.status == "Ok") {
      sqlResult = await dbLib.dbUpdate("cronJobs", id, [{ name: "lastRun", value: "now()" }], false, "KDY492");

      if (sqlResult.status != "Ok") {
        console.log("GU739", sqlResult);
        errorList.push("CronJob update failed for " + name);
        status = "Error";
      }
    }

    //save errors to cron_errors table
    for (let err of errorList) {
      await dbLib.dbInsertObject(
        "cron_errors",
        {
          user_ID: "cron",
          name: name,
          cronOperation: op,
          cronFrequency: freq,
          params: params,
          msg: err,
          read: "n",
          createdAt: "now()",
        },
        false,
        false,
        "CRE382"
      );
    }
    errorList = [];
  }
  return { status: status };
}

function isDue(name, lastRun, freq, errorList) {
  //   console.log("BGT666 isDue", name, lastRun, typeof lastRun, freq);
  const now = new Date(); //timezone?????
  let tomorrow = now;
  tomorrow.setDate(tomorrow.getDate() + 1);
  //is it hour 23?
  const hour = now.getHours(); //should be local hours
  //   const day = now.getDate();
  const tomorrowDay = tomorrow.getDate();
  const month = now.getMonth();
  let dayDiff = 1000;
  let hourDiff = 24 * dayDiff;
  let minuteDiff = hourDiff * 60;
  let secondDiff = minuteDiff * 60;
  if (lastRun) {
    const milliDiff = now.getTime() - lastRun.getTime();
    secondDiff = milliDiff / 1000;
    minuteDiff = milliDiff / 60;
    hourDiff = milliDiff / 60;
    dayDiff = hourDiff / 24;
    // console.log("CBF443 isDue", dayDiff, hourDiff, minuteDiff, secondDiff, milliDiff)
  } //if no last run, deem it ages ago
  switch (freq) {
    case "Once":
      return true;
    case "Every Minute":
      //is last run over 50 seconds old?
      if (secondDiff > 50) return true;
      break;
    case "Hourly":
      //is last run over 50 minutes old?
      if (minuteDiff > 50) return true;
      break;
    case "EOD": //end of day
      if (hour < 21) break;
      //is last run over 22 hours old?
      if (hourDiff > 22) return true;
      break;
    case "EOM": // end of month
      if (hour < 21) break;
      //are we in last day of month?
      if (tomorrowDay != 1) break;
      //is last run over 20 days old?
      if (dayDiff > 20) return true;
      break;
    case "Quarterly":
      if (hour < 21) break;
      //are we in last day of month?
      if (tomorrowDay != 1) break;
      //is month march, june, sept, dec?
      if (![2, 5, 8, 11].includes(month)) break;
      //is lastRun over 60 days old?
      if (dayDiff > 60) return true;
      break;
    case "Yearly":
      if (hour < 21) break;
      //are we in last day of month?
      if (tomorrowDay != 1) break;
      //are we in december
      if (month != 11) break;
      //is lastRun over 300 days old?
      if (dayDiff > 300) return true;
      break;
    default:
      errorList.push("BGR333 frequency " + freq + " not implemented");
      console.log("BGR333 frequency " + freq + " not implemented");
      break;
  }
  if (TEST) console.log("BGT777 isDue", name, lastRun, freq, "NOT DUE");
  return false;
}

async function runJob(name, op, params, createdBy, errorList) {
  let result = { status: "Ok" };
  try {
    switch (op.toLowerCase()) {
      case "tidytables":
        //just an example
        // result = await dbLib.dbTidyTables(params, errorList);
        break;
      case "dominodownload":
        //do the download!
        const tableName=params;
        
        break;
      default:
        errorList.push("HYT665 Unknown cron operation " + op + " " + name);
        result = { Status: "Error" };
    }
  } catch (e) {
    console.log("DRT876 error in runJob", name, e);
    result = { status: "Error" };
  }
  return result;
}

module.exports = {
  check: check,
};
