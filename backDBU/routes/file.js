var express = require("express");
var router = express.Router();
var multer = require("multer");
var dbLib = require("../modules/dbLibTransactSql");
var fileLib = require("../modules/fileLib");
var auth = require("../modules/auth");
var authorisation = require("../modules/authorisation");
const utils = require("../modules/utils");
const dateUtils = require("../modules/dateUtils");
const AdmZip = require("adm-zip");

const INCORRECT_FILETYPE = "INCORRECT_FILETYPE";
const LIMIT_FILE_SIZE = "LIMIT_FILE_SIZE";
const MAX_FILE_SIZE = 4000000;

const fileFilter = (req, file, cb) => {
  console.log(file.mimetype);
  const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  if (!allowedTypes.includes(file.mimetype)) {
    console.log("Bad mime type");
    const error = new Error("File type not accepted");
    error.code = INCORRECT_FILETYPE;
    return cb(error, false);
  }
  cb(null, true);
};

const zipFileFilter = (req, file, cb) => {
  console.log(file.mimetype);
  const allowedTypes = ["application/zip"];
  if (!allowedTypes.includes(file.mimetype)) {
    console.log("Bad mime type");
    const error = new Error("File type not accepted");
    error.code = INCORRECT_FILETYPE;
    return cb(error, false);
  }
  cb(null, true);
};

const uploadFile = multer({
  dest: global.gConfig.uploads_dir, //"./uploads",
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadZipFile = multer({
  dest: global.gConfig.uploads_dir, //"./uploads",
  zipFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

router.get("/about", function (req, res, next) {
  console.log("BGT555 About")
  const packageJson = require("../package.json");

  const status = {
    package: packageJson.name,
    version: packageJson.version,
    dbuser: global.gConfig.dbuser,
    database: global.gConfig.dbdatabase,
    environment: global.gConfig.environment,
    node_version: process.version,
  };

  if (res.userInfo) {
    if (authorisation.check(req.userInfo, { role: "operator" })) {
      status.database = global.gConfig.dbdatabase;
      status.environment = global.gConfig.config_id;
    }
    status.FI_ID = req.userInfo.FI_ID;
    status.Email = req.userInfo.Email;
    status.Mnemonic = req.userInfo.Mnemonic;
    status.Group = req.userInfo.Group;
    status.SubGroups = req.userInfo.SubGroups;
    status.ip = req.userInfo.ip;
    status.serverIp = req.userInfo.serverIp;
    // console.log("HYT663 userInfo", req.userInfo);
  }

  res.send(status);
});

router.get("/packages", async function (req, res) {
  const fs = require("fs");
  console.log("PPP847 packages")

  const dirs = fs.readdirSync("node_modules");
  const packages = [];

  dirs.forEach(function (dir) {
    try {
      const file = "../node_modules/" + dir + "/package.json";
      const json = require(file);
      const name = json.name;
      const version = json.version;
      packages.push({ name: name, version: version, filename: file });
    } catch (e) {
      console.log("NDY283", e);
    }
  });
  //console.log("PKG666", packages);

  res.send(packages);
});

router.get("/banner", async function (req, res) {
  try {
    const result = await dbLib.dbQuery("SELECT TOP(1) * FROM Banner");
    if (result.status == "Ok") {
      //check to see if we are runing DEV with the prod database - this displays a warning on the website
      result.db = global.gConfig.dbdatabase.includes("prod") ? "prod" : "default";
      return res.send(result);
    }
  } catch (e) {
    if (global.gConfig.environment != "dev") return res.send({ result: "Error" });
  }
  if (global.gConfig.environment == "prod") {
    const recordset = [
      {
        bannerType: "default",
        durationSecs: "30",
        message: "Site closed for maintenance",
      },
    ];
    res.send({ recordset: recordset });
  }
});

router.get("/listConfig", async function (req, res) {
  try {
    let s = "";
    for (let dp in global.gConfig.uploadConfig) {
      if (dp != "comment") {
        s += dp + "\n";
        let info = global.gConfig.uploadConfig[dp].Details;
        for (let rptd in info) {
          s += "  " + info[rptd].ReportDetails_ID + "::" + info[rptd].TableDetails_ID + "\n";
        }
      }
    }
    console.log("HFT382", s);
    res.send({ status: "Ok", data: s });
  } catch (e) {
    console.log("MHY839", e);
    res.send({ result: "Error" });
  }
});

router.get("/documentation", auth, async function (req, res, next) {
  console.log("BFR222 doco");
  try {
    if (!authorisation.check(req.userInfo, { role: "user" }, res)) return;

    //read all files from /documentation
    //make arrays indexed by filename for both text and diagrams
    let dir = global.gConfig.documentation_dir;

    if (dateUtils.hasRole(req.userInfo, ["user"])) dir = global.gConfig.documentation_dir + "/user";
    if (dateUtils.hasRole(req.userInfo, ["operator"])) dir = global.gConfig.documentation_dir + "/operator";
    if (dateUtils.hasRole(req.userInfo, ["admin"])) dir = global.gConfig.documentation_dir;

    const doco = utils.getDirText(dir);
    const tree = utils.getTreeDir(dir);
    //const diagrams = utils.getDiagramsText(dir);

    res.send({ status: "Ok", doco: doco, tree: tree }); //, diagrams: diagrams });
  } catch (e) {
    console.log("HGR553", e);
  }
});

router.get("/documentationPrintable/:usertype", auth, async function (req, res, next) {
  console.log("GTF527 doco");
  try {
    if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;

    //read all files from /documentation
    let dir = global.gConfig.documentation_dir;
    if ("user" == req.params.usertype) dir = global.gConfig.documentation_dir + "/user";
    if ("operator" == req.params.usertype) dir = global.gConfig.documentation_dir + "/operator";

    const doco = utils.getDirTextNumbered(dir);

    res.send({ status: "Ok", doco: doco });
  } catch (e) {
    console.log("ssh583", e);
  }
});

router.post("/uploadDocZip", auth, uploadZipFile.array("files"), async (req, res) => {
  // console.log("CDH384 uploadDocZip")
  try {
    if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
    const result = await fileLib.handleDocZipFile(
      req.userInfo,
      req.files[0].originalname,
      req.files[0].filename,
      req.body.overwrite
    );
    res.send(result);
  } catch (err) {
    //errors here
    console.log("BSU482", err);
  }
});

router.get("/downloadDocZip/", auth, async (req, res) => {
  if (!authorisation.check(req.userInfo, { role: "admin" }, res)) return;
  try {
    await dbLib.dbAudit("download documentation files", req.userInfo);

    const zip = new AdmZip();
    const outputFile = global.gConfig.export_dir + "/doczip.zip";

    zip.addLocalFolder(global.gConfig.documentation_dir);
    zip.writeZip(outputFile);

    // console.log("VHR228 download zip ${outputFile}");
    res.download(outputFile);
  } catch (e) {
    console.log("NDR372 zip error", e);
    res.status(500).send(e);
  }
});

router.use((err, req, res, next) => {
  if (err.code == INCORRECT_FILETYPE) {
    console.log("GDR432 422 - Only spreadsheets are allowed");
    res.status(422).send({ error: "Only spreadsheets are allowed" });
    return;
  }
  if (err.code == LIMIT_FILE_SIZE) {
    console.log("BFD548 422 - Max file size is " + MAX_FILE_SIZE);
    res.status(422).send({ error: "Max file size is " + MAX_FILE_SIZE });
    return;
  }
});

module.exports = router;
