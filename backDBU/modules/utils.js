var fs = require("fs");
var path = require("path");
const dbLib = require("./dbLibTransactSql");
const OK = "Ok";
const ERROR = "Error";
const TEST = false;

const responseOk = (response) => {
  if (response && response.status && response.status != OK) return false;
  return true;
};

const containsValue = (arr, name, value) => {
  for (const a of arr) {
    if (a[name] == value) return true;
  }
  return false;
};

function getAddr(rowNo, colNo) {
  if (rowNo < 1) return undefined;
  if (colNo < 1) return undefined;
  let addr = "";
  const colIndex = Math.floor((colNo - 1) / 26);
  const cellIndex = ((colNo - 1) % 26) + 1;

  if (colIndex > 0) {
    addr += String.fromCharCode(colIndex + 64);
  }
  addr += String.fromCharCode(cellIndex + 64);
  addr += rowNo;
  return addr;
}

function getExcelDate(v) {
  //get from excel int
  let utc_days = Math.floor(v - 25569);
  let utc_secs = utc_days * 86400;
  let utc_ms = utc_secs * 1000;
  let date = new Date(utc_ms);
  return date;
}

function getExcelQuarter(v) {
  const date = getExcelDate(v);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = 1 + Math.floor(month / 4);
  const quarterYear = "Q" + quarter + " " + year;
  const yearQuarter = year + " Q" + quarter;
  const RP_ID = getReportPeriod_ID(date);
  return {
    year: year,
    quarter: quarter,
    quarterYear: quarterYear,
    yearQuarter: yearQuarter,
    ReportPeriod_ID: RP_ID,
    date: date,
  };
}
function getDateInfo(inDate = null, adjust = 0, type = "Q", log = false) {
  if (log) console.log("BSJ382 getDateinfo", inDate, adjust, type);

  let date;
  if (inDate) date = inDate;
  else date = new Date();

  if (adjust != 0 && type) {
    let adjustType = type.toUpperCase().substring(0, 1);
    const m = date.getMonth();
    const y = date.getFullYear();
    const d = date.getDate();
    switch (adjustType) {
      case "Q":
        date.setMonth(m + adjust * 3);
        break;
      case "M":
        date.setMonth(m + adjust);
        break;
      case "Y":
        date.setFullYear(y + adjust);
        break;
      case "D":
        date.setDate(d + adjust);
        break;
      default:
        console.log("NDY334 dateUtils.getDateInfo illegal adjust type", type);
    }
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = 1 + Math.floor(month / 4);
  const quarterYear = "Q" + quarter + " " + year;
  const yearQuarter = year + " Q" + quarter;
  const RP_ID = getReportPeriod_ID(date);
  const result = {
    year: year,
    quarter: quarter,
    quarterYear: quarterYear,
    yearQuarter: yearQuarter,
    ReportPeriod_ID: RP_ID,
    date: date,
  };
  if (log) console.log("DSW221 dateUtils.getDateInfo", date, adjust, type, result);
  return result;
}

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const longMonths = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "Jun",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getShortMonth(m) {
  return months[m];
}
function getLongMonth(m) {
  return longMonths[m];
}

function getMonthYear(vv) {
  let v = vv;
  let date_info = null;
  if (typeof v == "string") {
    v = v.replace(" ", "/");
    v = v.replace("FY", "");
    let bits = v.split("/");
    console.log("BGD273 date", v, bits, "length", bits.length);
    if (bits.length == 3) {
      // dd/mm/yyyy
      try {
        const mon = parseInt(bits[1] - 1);
        date_info = new Date(parseInt(bits[2]), mon, parseInt(bits[0]), 14);
        //new Date will happily accept 31/02/2022 - and just adjust to March
        //so compare the actual month figure to the month generated
        if (mon != date_info.getMonth()) date_info = null; //bad date
      } catch (e) {
        console.log("DFR833", bits, e);
        date_info = null; //bad date
      }
      //2pm UTC to get correct day in Oz
    } else if (bits.length == 2) {
      //month/year
      let mm = parseInt(bits[0]) - 1;
      let yy = parseInt(bits[1]);

      //Handle text months
      //console.log("MFY372", mm, yy);
      if (Number.isNaN(mm)) {
        let mmm = bits[0].toLowerCase();
        console.log("MFY8872", mmm);
        for (let mon = 0; mon < 12; mon++) {
          if (mmm.startsWith(months[mon])) mm = mon;
        }
      }

      //handle years 22 -> 2022
      if (!Number.isNaN(yy) && yy < 2000) yy += 2000;

      console.log("MFY992", mm, yy);

      date_info = new Date(yy, mm, 1, 14);
      console.log("BDE283 date", v, date_info);
    } else date_info = null; //error
  } else {
    date_info = getExcelDate(v);
  }
  if (date_info && date_info.getFullYear() > 2019 && date_info.getFullYear() < 2050)
    return {
      month: date_info.getMonth() + 1,
      year: date_info.getFullYear(),
      date: date_info,
    };
  else return { month: null, year: null, date: null };
}

function getYYYYMMDD(date, delim = "/") {
  let d = padZero(date.getDate());
  let m = padZero(date.getMonth() + 1);
  const y = date.getFullYear();
  return y + delim + m + delim + d;
}

//get date from string
function getDate(v) {
  try {
    if (v == null) return null;
    let date_info;
    let bits = v.split("/");
    if (bits.length == 1) bits = v.split("-");
    if (bits.length == 3) {
      if (bits[2].length == 4) {
        if (bits[1].length == 3) {
          //dd/MMM/yyyy
          const mon = months.indexOf(bits[1].toLowerCase());
          date_info = new Date(bits[2], mon, bits[0]);
        } else {
          // dd/mm/yyyy
          // new Date(y, m, d) NB month is month INDEX (0==jan)
          date_info = new Date(bits[2], bits[1] - 1, bits[0]);
        }
      } else {
        // yyyy/mm/dd
        date_info = new Date(bits[0], bits[1] - 1, bits[2]);
      }
    } else if (bits.length == 2) {
      // month/year or year/month
      if (bits[0].length == 4) date_info = new Date(bits[0], bits[1] - 1, 0); // yyyy/mm
      else date_info = new Date(bits[1], bits[0] - 1, 0); // mm/yyyy
    }
    // console.log("DDT384 date", v, bits.toString(), date_info);
    return date_info;
  } catch {
    return null;
  }
}

function getYearMonth(rp_ID) {
  const n = rp_ID.replaceAll("RP_", "");
  const m = (n - 1) % 12; //java month 0=jan
  const y = Math.floor((n - 1) / 12) + 2012;
  return { year: y, unixMonth: m, month: m + 1, shortYear: y % 100 };
}

function periodToRP(period) {
  const d = "01/" + period.substring(0, 3) + "/20" + period.substring(3, 5);
  const date = getDate(d);
  const RP_ID = getReportPeriod_ID(date);
  return RP_ID;
}

//NB The ReportPeriod_ID is the extended version with _day, only used in "createDateInfo"
function getFiscalFromDate(date = null) {
  if (date == null) date = new Date();
  const RP_ID = getReportPeriod_ID(date);
  //console.log("KGT332", date, RP_ID)
  const d = date;

  const monthName = getLongMonth(d.getMonth());
  // const shortMonthName = getShortMonth(d.unixMonth);
  const qtr = 1 + ((Math.floor(d.getMonth() / 3) + 6) % 4);

  let mm = padZero(d.getMonth() + 1);

  const yearMonth = "" + d.getFullYear() + "" + mm;
  // let fiscalYear = d.getFullYear();
  // let startFiscalYear = d.getFullYear() - 1;
  // let startRealFiscalYear = d.getFullYear();
  // const fiscalPeriod = 1 + ((d.getMonth() + 6) % 12);
  // if (d.getMonth() > 5) {
  //   startFiscalYear = d.getFullYear();
  //   startRealFiscalYear = d.getFullYear() + 1;
  //   fiscalYear++;
  // }
  let fiscalYearShort = d.getFullYear() - 2000;
  let startFiscalYear = d.getFullYear() - 1 - 2000;
  let startRealFiscalYear = d.getFullYear() - 2000;
  const fiscalPeriod = 1 + ((d.getMonth() + 6) % 12);
  if (d.getMonth() > 5) {
    startFiscalYear = d.getFullYear() - 2000;
    startRealFiscalYear = d.getFullYear() + 1 - 2000;
    fiscalYearShort++;
  }

  const endFiscalYear = startFiscalYear + 1;
  const endRealFiscalYear = startRealFiscalYear + 1;

  const fiscalQuarter = "Q" + qtr + " " + (2000 + fiscalYearShort);

  const fiscalRange = "JUL" + startFiscalYear + " - JUN" + endFiscalYear;

  const day = d.getDate();
  let RP_ID_ext = RP_ID;
  if (day > 1) RP_ID_ext += "_" + day;

  const realFiscalRange = "JUL" + startRealFiscalYear + " - JUN" + endRealFiscalYear;
  return {
    Date: d.getFullYear() + "-" + padZero(d.getMonth() + 1) + "-" + padZero(d.getDate()),
    ReportPeriod_ID: RP_ID_ext,
    MonthName: monthName,
    Month: d.getMonth() + 1,
    Year: d.getFullYear(),
    YearMonth: yearMonth,
    Quarter: qtr,
    FiscalYear: 2000 + fiscalYearShort,
    FiscalPeriod: fiscalPeriod,
    FiscalQuarter_FiscalYear: fiscalQuarter,
    FiscalRange: fiscalRange,
    RealFiscalRange: realFiscalRange,
    Day: day,
  };
}

function getFiscalYear(date = null) {
  let d = new Date();
  if (date != null) d = date;

  const RP_ID = getReportPeriod_ID(d);

  let startFiscalYear = d.getFullYear();
  if (d.getMonth() < 6) {
    startFiscalYear = d.getFullYear() - 1;
  }
  const start = new Date(startFiscalYear, 6, 1, 12);
  const end = new Date(startFiscalYear + 1, 5, 30, 12);

  return {
    Date: d.getFullYear() + "-" + padZero(d.getMonth() + 1) + "-" + padZero(d.getDate()),
    Fiscal: startFiscalYear + " - " + (startFiscalYear + 1),
    ReportPeriod_ID: RP_ID,
    startFiscalYear: start,
    endFiscalYear: end,
    startRP: getReportPeriod_ID(start),
    endRP: getReportPeriod_ID(end),
  };
}

function checkYYYYMMDD(v) {
  try {
    let date_info = getDate(v);
    if (v == null) return null;
    const result = getYYYYMMDD(date_info);
    //console.log("HDR428", v, date_info, result)
    return result;
  } catch {
    return null;
  }
}

function padZero(s) {
  if (s < 10) return "0" + s;
  return s;
}

function padZeros(ss, length = 3) {
  let s = "0000" + ss;
  if (s.length > length) return s.substring(s.length - length);
  return s;
}

function extractFormattedDate(d) {
  let dateString = null;
  let date; //, typeDate;
  try {
    if (typeof d == "string") {
      //dateString = checkYYYYMMDD(d);
      //typeDate = "string";
      date = getDate(d); //handles yyyy/mm/dd and dd/mm/yyyy
      dateString = getYYYYMMDD(date);
    } else {
      //typeDate = "Excel";
      date = getExcelDate(d);
      dateString = getYYYYMMDD(date);
    }
    // console.log("FDE273 extractFormattedDate", d, typeDate, date, dateString)
    return dateString;
  } catch (e) {
    console.log("udr435 extractDate", d, e);
    return null;
  }
}

function formatDate(d) {
  if (d instanceof Date) {
    let s = d.getFullYear() + "-" + padZero(d.getMonth() + 1) + "-" + padZero(d.getDate());
    return s;
  } else return d;
}

function formatDateDMY(d) {
  if (d instanceof Date) {
    let s = padZero(d.getDate()) + "/" + padZero(d.getMonth() + 1) + "/" + d.getFullYear();
    return s;
  } else return d;
}

function getV(sheet, addr) {
  const cell = sheet[addr];
  const c = cell ? cell.v : undefined;
  // console.log("getVxxx", addr, c)
  return c;
}

function getNumV(sheet, rowNo, colNo = null) {
  if (rowNo < 1) return undefined;
  if (colNo < 1) return undefined;
  const addr = getAddr(rowNo, colNo);
  if (addr) {
    const cell = sheet[addr];
    const c = cell ? cell.v : undefined;
    //console.log("getNumVxxx", rowNo, colNo, addr, c)
    return c;
  } else {
    return undefined;
  }
}

function getColName(inName) {
  let name = inName;
  const pos = name.indexOf("("); //dump anything after a (
  if (pos > -1) name = name.substring(0, pos - 1);
  name = name.trim(); //remove leading and trailing spaces
  name = name.replace("-", " "); //- to space
  name = name.replace(/ +/g, "_"); //spaces to single underscore
  name = name.replace(/\W_/g, ""); //remove all non alphanumeric

  if (name == "Rep_Arrangements") name = "Rep_Arrangement"; //like, really?
  if (name == "Data_provided") name = "Data_Provided"; //like, really?
  if (name == "FIID") name = "FI_ID"; //like, really?
  return name;
}

function getReportPeriod_ID(dd = null) {
  try {
    if (dd == null) dd = new Date();
    const fy = dd.getFullYear();
    const m = dd.getMonth();
    const id = "000" + ((fy - 2012) * 12 + (m - 1) + 2);
    const idCode = id.substring(id.length - 3);
    //console.log("DDD523", dd, fy, m, "=> RP_"+idCode);
    return "RP_" + idCode;
  } catch (e) {
    console.log("JNG638", e);
  }
}

function getExcelColName(inName) {
  let name = inName;
  name = name.trim(); //remove leading and trailing spaces
  //why doesn't .replaceAll work???
  name = name.replace("_", " "); //- to space

  if (name == "FI ID") name = "FIID"; //like, really?
  return name;
}

// function readFileAsync(file) {
//   return new Promise((resolve, reject) => {
//     let reader = new FileReader();

//     reader.onload = () => {
//       resolve(reader.result);
//     };

//     reader.onerror = reject;

//     reader.readAsArrayBuffer(file);
//   });
// }

function readFileToBinary(fnam, ignoreError = false) {
  try {
    const contentBuffer = fs.readFileSync(fnam);
    return contentBuffer;
  } catch (err) {
    if (!ignoreError) console.log("JYF443 binaryRead", err);
    return null;
  }
}

function readFileToString(fnam, log = false) {
  try {
    if (log) console.log("DER342 readFileToString fnam", fnam);
    const contentBuffer = fs.readFileSync(fnam);
    return contentBuffer.toString();
  } catch (err) {
    console.log("JYF444 readFileToString", err);
    return null;
  }
}

async function deleteFile(fnam, src = null) {
  try {
    //await dbLib.dbAudit("delete file " + fnam, null, src);
    fs.unlinkSync(fnam);
    return true;
  } catch (e) {
    console.log("FJY638 file delete error", e);
    return false;
  }
}

function mkdir(fnam) {
  console.log("BDY334 mkdir", fnam, "current=", process.cwd());
  try {
    if (!fs.existsSync(fnam)) {
      console.log("GST332 created", fnam);
      fs.mkdirSync(fnam);
      return true;
    } else {
      console.log("FFD273 already exists", fnam);
      return true;
    }
  } catch (e) {
    console.log("GJR7765 mkdir error", e);
    return false;
  }
}

function parseFilename(fn) {
  let info = {
    filename: fn,
    name: null,
    ext: null,
    mnemonic: null,
    year: null,
    quarter: null,
    month: null,
    ReportPeriod_ID: null,
  };
  try {
    const bits = fn.split("/");
    let name = bits[bits.length - 1];
    const pos = name.lastIndexOf(".");
    if (pos > -1) {
      info.ext = name.substring(pos + 1);
      name = name.substring(0, pos);
    }
    info.name = name;

    //mnemonic must be uppercase
    const mn = name.substring(0, 3);
    if (mn == mn.toUpperCase()) info.mnemonic = mn.toUpperCase();

    //HVCS 2024 filename format "2024 01 Summary.xlsx"
    if (info.ReportPeriod_ID == null) {
      //try for year at start
      const ys = name.substring(0, 4);
      const y = parseInt(ys);
      //console.log("HDR392", name, ys, y)
      if (y != NaN && y >= 2024 && y < 2075) {
        //ok, we've found a year
        const ms = name.substring(4, 7).trim();
        const m = parseInt(ms);
        console.log("HDR392", name, ys, y, ms, m);
        if (m != NaN && m > 0 && m <= 12) {
          //found year month
          info.year = y;
          info.month = m;
          const id = "000" + ((y - 2012) * 12 + (m - 1) + 1);
          const idCode = id.substring(id.length - 3);
          info.ReportPeriod_ID = "RP_" + idCode;
        }
      }
    }

    //format xxxx2021 Q3 xxxxxx
    if (info.ReportPeriod_ID == null) {
      //try for Q date at start
      const s = name.substring(4, 12).trim();
      const qPos = s.indexOf("Q");
      if (qPos > -1) {
        const q = parseInt(s.substring(qPos + 1, qPos + 2));
        let y = NaN;
        if (q != NaN) {
          info.quarter = q;
          if (qPos > 0) {
            //year at the start
            y = parseInt(s.substring(0, 4));
            if (y != NaN) info.year = y;
          } else {
            y = parseInt(s.substring(qPos + 2, qPos + 8));
            if (y != NaN) info.year = y;
          }
          if (y != NaN) {
            const m = (q - 2) * 3; //fiscal quarters!
            // info.month = m;
            const id = "000" + ((y - 2012) * 12 + (m - 1) + 1);
            const idCode = id.substring(id.length - 3);
            info.ReportPeriod_ID = "RP_" + idCode;
          }
        }
      }
    }

    if (info.ReportPeriod_ID == null) {
      //try for date at end
      const y = parseInt(name.substring(name.length - 4));
      if (y != NaN && y > 1990) {
        info.year = y;
        //do we have a quarter?
        const qPos = name.lastIndexOf("Q");
        if (qPos > -1 && qPos > name.length - 9) {
          const q = parseInt(name.substring(qPos + 1, qPos + 2));
          if (q != NaN) {
            info.quarter = q;

            //assume fiscal quarter is at end of quarter -
            //q1=09 september of prev year
            //q2=12 dec of prev year
            //q3=03 mar of year
            //q4=06 jun of year
            //derive rp_ID
            const m = (q - 2) * 3; //fiscal quarters!
            // info.month = m;
            const id = "000" + ((y - 2012) * 12 + (m - 1) + 1);
            const idCode = id.substring(id.length - 3);
            info.ReportPeriod_ID = "RP_" + idCode;
          }
        }
        if (info.quarter == null) {
          //might have a month
          let sm = name.substring(name.length - 10, name.length - 4).trim();
          while (sm.length > 0 && " _/-".includes(sm.substring(sm.length - 1))) {
            sm = sm.substring(0, sm.length - 1);
          }
          sm = sm.substring(sm.length - 2);
          const m = parseInt(sm);
          if (m != NaN) {
            info.month = 1 * sm;
            info.quarter = Math.ceil((m - 3) / 3);
            //derive rp_ID
            const id = "000" + ((y - 2012) * 12 + (m - 1) + 1);
            const idCode = id.substring(id.length - 3);
            info.ReportPeriod_ID = "RP_" + idCode;
          }
        }
      }
    }

    // console.log("BGS610 parseFilename", fn, info);
  } catch (e) {
    console.log("VDS733 parseFilename", e);
  }
  return info;
}

function copyFile(fnam, dest) {
  try {
    // console.log("FSS382 utils copyFile [sync]", fnam, "->", dest);
    fs.copyFileSync(fnam, dest);
    return true;
  } catch (e) {
    //console.log("GSY384 file copy error", e);
    console.log("GSY384 file copy error");
    return false;
  }
}

//get previous report period id
function getPrevMonth(id, gap = -1) {
  //extract the numbers
  const digits = id.match(/\d+/g);
  const newMonth = 1 * digits + gap;
  const newId = "RP_" + ("000" + newMonth).slice(-3);
  return newId;
}

function pretty(s) {
  //remove ext
  const s2 = s.replace(/\.[^/.]+$/, "");
  const s3 = s2.replace(/_/g, " ");
  const s4 = s3.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
  return s4;
}

function noLeadingNum(s) {
  const pos = s.indexOf("_");
  if (pos < 1 || pos > 3) return s;
  else {
    const n = s.substring(0, pos);
    if (!"0123456789ABCDEF".includes(n)) return s;
    // const i = parseInt(n);
    // if (isNaN(i)) return s;
    return s.substring(pos);
  }
}
function noExt(f) {
  const name = f.name;
  const pos = name.lastIndexOf(".");
  if (pos == -1) return name;
  return name.substring(0, pos);
}

function getTreeDir(dir, sort = true, parent = null) {
  var files = fs.readdirSync(dir, { withFileTypes: true });
  if (sort)
    files.sort((a, b) => {
      a.name > b.name;
    });

  let tree = [];
  for (let f of files) {
    const noNum = pretty(noLeadingNum(f.name));
    // console.log("HGT552", f.name, noNum);
    if (f.isFile()) {
      if ([".md", ".html", ".txt"].includes(path.extname(f.name))) {
        tree.push({ id: noExt(f), name: noNum, parent: parent });
      }
    } else if (f.isDirectory()) {
      tree.push({
        id: f.name,
        name: noNum,
        children: getTreeDir(dir + "/" + f.name, sort, noExt(f)),
      });
    }
  }
  return tree;
}

function getDirText(dir) {
  let doco = {};
  try {
    var files = fs.readdirSync(dir, { withFileTypes: true });

    for (let f of files) {
      if (f.isFile()) {
        // console.log("BGR332", noExt(f));
        if ([".md", ".html", ".txt"].includes(path.extname(f.name))) {
          doco[noExt(f)] = readFileToString(dir + "/" + f.name);
        }
      } else if (f.isDirectory()) {
        let moreDoco = getDirText(dir + "/" + f.name);
        Object.assign(doco, moreDoco);
      }
    }
  } catch (e) {
    console.log("NGT555 error", e);
  }
  // console.log("DOC332", doco);
  return doco;
}
function getDirTextNumbered(dir, current = "#") {
  let doco = {};
  try {
    var files = fs.readdirSync(dir, { withFileTypes: true });

    let count = 1;
    for (let f of files) {
      let num = current + "." + count;
      if (current == "#") num = "#" + count;

      if (f.isFile()) {
        if ([".md", ".html", ".txt"].includes(path.extname(f.name))) {
          doco[num] = {
            head: noExt(f),
            txt: readFileToString(dir + "/" + f.name),
          };
        }
      } else if (f.isDirectory()) {
        doco[num] = { head: f.name, txt: "" };
        let moreDoco = getDirTextNumbered(dir + "/" + f.name, num);
        Object.assign(doco, moreDoco);
      }
      count++;
    }
  } catch (e) {
    console.log("FDR443 error", e);
  }
  return doco;
}
function getDiagramsText(dir) {
  let diagrams = {};
  try {
    var files = fs.readdirSync(dir, { withFileTypes: true });

    for (let f of files) {
      if (f.isFile()) {
        // console.log("KFT662 path", path.extname(f.name), pretty(f.name))
        if ([".mermaid", ".mmd"].includes(path.extname(f.name))) {
          diagrams[noExt(f)] = readFileToString(dir + "/" + f.name); //, true);
        }
      } else if (f.isDirectory()) {
        let moreDoco = getDiagramsText(dir + "/" + f.name);
        Object.assign(diagrams, moreDoco);
      }
    }
  } catch (e) {
    console.log("NGT555 error", e);
  }
  return diagrams;
}

function findRoles(config, rolesIn) {
  let rolesFound = ["user"];
  let Mnemonic = null;
  let SubGroups = [];
  try {
    // console.log("HGHF66 findRoles", rolesIn);
    for (let roleIn of rolesIn) {
      //console.log("GGF537 findRoles roleIn", roleIn, "config.roles", config.roles);
      for (let configRole in config.roles) {
        //console.log("GFD453 findRoles configRole", configRole, config.roles[configRole]);
        for (let perm of config.roles[configRole]) {
          let possible = "";
          let SubGroup = "";
          let found = true;
          for (let i = 0; i < perm.length && i < roleIn.length; i++) {
            const configChar = perm.charAt(i);
            const roleInChar = roleIn.charAt(i);
            if (configChar == "?") possible += roleInChar;
            else if (configChar == "#") SubGroup += roleInChar;
            else {
              if (roleInChar != configChar) found = false;
            }
          }
          if (SubGroup.length > 0) {
            if (!SubGroups.includes(SubGroup)) SubGroups.push(SubGroup);
          }
          if (found) {
            if (!rolesFound.includes(configRole)) rolesFound.push(configRole);
            if (configRole == "user") {
              Mnemonic = possible;
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("HGT555", e);
    dbLib.dbAudit("findRoles", null, "HGT555", e);
  }
  // console.log("hdu556", "in", rolesIn, "result", { Mnemonic: Mnemonic, roles: rolesFound });
  return { Mnemonic: Mnemonic, SubGroups: SubGroups, roles: rolesFound };
}

function hasRole(userInfo, roles) {
  if (userInfo.roles) {
    for (const role of roles) if (userInfo.roles.includes(role)) return true;
  }
  return false;
}

function getRole(userInfo) {
  if (userInfo.roles) {
    for (const role of userInfo.roles) {
      if (role == "admin") return "admin";
      else if (role != "user" && role != "aggregator") return role;
    }
  }

  return "user";
}

async function rmdir(dirName, src) {
  // delete directory recursively
  await dbLib.dbAudit("rmDir " + dirName, src);
  fs.rmdirSync(dirName, { recursive: true }, (err) => {
    if (err) {
      console.log("VFR442 rmdir " + dirName + " err", err);
      throw err;
    }
  });
  console.log(`${dirName} is deleted!`);
  return;
}

async function deriveUser(infoUser) {
  //need all roles
  let user = [];
  const roleInfo = findRoles(global.gConfig, infoUser.Group);
  user.roles = roleInfo.roles;
  //need FI and FI_ID
  user.Mnemonic = roleInfo.Mnemonic;
  user.Email = infoUser.Email;

  if (infoUser.GivenName) user.user_ID = infoUser.GivenName + " " + infoUser.Surname;
  if (infoUser.FirstName) user.user_ID = infoUser.FirstName + " " + infoUser.LastName;

  user.Group = infoUser.Group;
  user.SubGroups = roleInfo.SubGroups;
  user.aggregating = [];
  if (!roleInfo.roles.includes("admin") && !roleInfo.roles.includes("operator")) {
    if (TEST) console.log("FUT445 get FI_ID");
    try {
      user.FI_ID = await dbLib.dbGetFI(user.Mnemonic, true, "GDY553");
    } catch (eee) {
      console.log("XXD555", eee);
    }
    if (TEST) console.log("FUT446 got FI_ID", user.FI_ID);
    const result = await dbLib.dbNamedQuery("aggregating", [roleInfo.Mnemonic]);
    if (result.recordset) {
      for (const fi of result.recordset) {
        user.aggregating.push(fi);
      }
      if (result.recordset.length > 0) user.roles.push("aggregator");
    }
  } else {
    // user.FI = "AusPayNet";
    user.Mnemonic = "APN";
    user.FI_ID = "FI_APN";
  }
  //console.log("CDU394 user", user.roles)
  return user;
}

async function tidyRefFiles(dir, file_list) {
  console.log("NDY382 tidyRefFiles");
  //remove all ref files not in db (this includes config)
  //get list of ref files in db
  let list = [];
  for (const item of file_list) {
    list.push(item.fname);
  }
  var files = fs.readdirSync(dir);
  let deleted = 0;
  for (const file of files) {
    // console.log("HGD553", file);
    if (!list.includes(file)) {
      try {
        fs.unlinkSync(dir + "/" + file);
        deleted++;
        console.log("HGD553 delete ref file", dir + "/" + file);
        await dbLib.dbAudit("tidyRefFiles delete ref file " + dir + "/" + file);
      } catch (e) {
        console.log("HTF444 tidyRefFiles error", e);
        await dbLib.dbAudit("tidyRefFiles fail delete ref file " + dir + "/" + file, null, null, e);
      }
    }
  }
  if (deleted > 0) {
    console.log("FDE333 deleted", deleted, "ref files");
    await dbLib.dbAudit("tidyRefFiles deleted " + deleted + " ref files from " + dir);
  }
}

module.exports = {
  //checkYYYYMMDD: checkYYYYMMDD,
  containsValue: containsValue,
  copyFile: copyFile,
  deleteFile: deleteFile,
  deriveUser: deriveUser,
  //extractFormattedDate: extractFormattedDate,
  findRoles: findRoles,
  //formatDate: formatDate,
  //formatDateDMY: formatDateDMY,
  //getColName: getColName,
  //getDate: getDate,
  getDirText: getDirText,
  getDirTextNumbered: getDirTextNumbered,
  //getRole: getRole,
  //getYearMonth: getYearMonth,
  //getV: getV,
  //getYYYYMMDD: getYYYYMMDD,
  ////getExcelDate: getExcelDate,
  ////getExcelColName: getExcelColName,
  ////getExcelQuarter: getExcelQuarter,
  //getFiscalYear: getFiscalYear,
  //getDateInfo: getDateInfo,
  //getFiscalFromDate: getFiscalFromDate,
  //getMonthYear: getMonthYear,
  //getPrevMonth: getPrevMonth,
  //getReportPeriod_ID: getReportPeriod_ID,
  //getShortMonth: getShortMonth,
  //getLongMonth: getLongMonth,
  getTreeDir: getTreeDir,
  //hasRole: hasRole,
  mkdir: mkdir,
  ////padZeros: padZeros,
  ////periodToRP: periodToRP,
  ////parseFilename: parseFilename,
  readFileToBinary: readFileToBinary,
  readFileToString: readFileToString,
  responseOk: responseOk,
  rmdir: rmdir,

  OK: OK,
  ERROR: ERROR,
};
