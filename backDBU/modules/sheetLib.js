const AdmZip = require("adm-zip");
const { XMLParser } = require("fast-xml-parser");
const TEST = false;

const options = {
  ignoreAttributes: false,
};

const readJSON = (txt) => {
  return JSON.parse(txt);
};

const read = (data) => {
  try {
    if (TEST) console.log("BHF552");

    //unzip xlsx file
    const zip = new AdmZip(data);

    return handleZip(zip);
  } catch (e) {
    console.log("FGR429", e);
    return null;
  }
};

const readFile = (fnam) => {
  try {
    //if (TEST)
    console.log("BFY483 sheetLib.readFile", fnam);

    //unzip xlsx file
    const zip = new AdmZip(fnam);

    const wbk = handleZip(zip);
    if (TEST) console.log("NDY332 wbk", wbk.SheetNames);
    return wbk;
  } catch (e) {
    console.log("FGR427", e);
    return null;
  }
};

function handleZip(zip) {
  let Workbook = {};
  Workbook.SheetNames = [];
  Workbook.Sheets = {};

  const parser = new XMLParser(options);

  const zipEntries = zip.getEntries();
  // let sheets = [];
  // let sheetByName = {};
  // let sheetByNumber = [];
  let sharedStrings = [];
  let firstId = 0;

  zipEntries.forEach(function (entry) {
    let data = entry.getData().toString("utf8");

    // console.log("BFS111", entry.name);

    let book;
    switch (entry.name) {
      case "workbook.xml":
        book = parser.parse(data);
        // console.log(
        //   "CGU429 workbook.xml book",
        //   typeof book.workbook.sheets.sheet,
        //   "length=" + book.workbook.sheets.sheet.length,
        //   book.workbook.sheets.sheet
        // );
        if (book.workbook.sheets.sheet.length) {
          //multiple sheets
          for (let i in book.workbook.sheets.sheet) {
            let sheet = book.workbook.sheets.sheet[i];
            const name = sheet["@_name"];
            if (name) {
              const id = 1 * sheet["@_sheetId"];
              firstId = id;
              Workbook.SheetNames.push(name);
              Workbook.Sheets[name] = {};
              // console.log("BFS772 workbook?.xml", i, name, id, typeof id);
            }
          }
        } else {
          //only one sheet
          let sheet = book.workbook.sheets.sheet;
          const name = sheet["@_name"];
          const id = 1 * sheet["@_sheetId"];
          firstId = id;
          Workbook.SheetNames.push(name);
          Workbook.Sheets[name] = {};
          // console.log("VVA772 workbook.xml", name, id, typeof id);
        }
        break;

      case "sharedStrings.xml":
        book = parser.parse(data);
        console.log("NDT223", book.sst.si);
        for (let i in book.sst.si) {
          const ss = book.sst.si[i];
          console.log("HYT664", i, ss);
          if (ss.r) {
            console.log("HYT665", i, ss.r);
            let str = "";
            for (let j in ss.r) {
              if (typeof ss.r[j].t == "string") {
                str += ss.r[j].t;
              } else if (typeof ss.r[j].t["#text"] == "string") {
                str += ss.r[j].t["#text"];
              }
            }
            sharedStrings[i] = str;
          } else if (ss.t) {
            if (typeof ss.t == "object") {
              console.log("NDY321 sharedString object", i, ss.t);
              if (ss.t["#text"]) sharedStrings[i] = ss.t["#text"];
              else sharedStrings[i] = "";
            } else sharedStrings[i] = ss.t;
          } else console.log("BDJ222 unknown", ss);
        }
        break;
    }
  });
  // console.log("BHY666 Workbook.SheetNames", Workbook.SheetNames);
  let currentSheetNo = 0;

  zipEntries.forEach(function (entry) {
    let sheets;
    const data = entry.getData().toString("utf8");
    const name = entry.name;
    // console.log("NDY384 name=", name);
    let sheetName = null;

    if (
      (name.startsWith("sheet") || name.startsWith("worksheet")) &&
      name.endsWith(".xml")
    ) {
      const book = parser.parse(data);

      sheetName = Workbook.SheetNames[currentSheetNo++];
      sheets = book.worksheet.sheetData;
    }

    if (sheetName) {
      // console.log("KJU774 ", sheetName, data)

      let rows = sheets.row;
      for (let r in rows) {
        let row = rows[r];

        if (row.c.length > 1) {
          for (let c in row.c) {
            cellHandle(row.c[c], sheetName, sharedStrings, Workbook);
          }
        } else cellHandle(row.c, sheetName, sharedStrings, Workbook);
      }
    }
  });

  if (TEST) console.log("ZIP888 sharedStrings", sharedStrings);
  return Workbook;
}

function cellHandle(cell, sheetName, sharedStrings, Workbook) {
  if (!(cell.v == null)) {
    // let cellType = "n"; //number
    // if (cell["@_t"] == "s") cellType = "s"; //string
    // if (cell["@_s"] == "2") cellType = "date";
    const addr = cell["@_r"];
    if (TEST || addr == "A17") {
      console.log("BGS945", sheetName, addr, cell);
      console.log(
        "HFR333",
        sheetName,
        addr,
        "[" + sharedStrings[0 + cell.v] + "]"
      );
    }

    if (cell["@_t"] == "s") {
      Workbook.Sheets[sheetName][addr] = {
        v: sharedStrings[0 + cell.v],
      };
    } else {
      if (TEST) console.log("NDT123", sheetName, cell["@_r"], "v=" + cell.v);
      try {
        Workbook.Sheets[sheetName][addr] = {
          v: 1 * cell.v, //force to type number
        };
      } catch (e) {
        Workbook.Sheets[sheetName][addr] = {
          v: cell.v,
        };
      }
    }
    if (TEST || addr == "A17") {
      console.log("BBB372", sheetName, addr, Workbook.Sheets[sheetName][addr]);
    }
  }
}

module.exports = {
  read: read,
  readFile: readFile,
  readJSON: readJSON,
};
