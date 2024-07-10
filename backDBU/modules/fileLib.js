const dbLib = require("../modules/dbLibTransactSql");
const utils = require("../modules/utils");
const AdmZip = require("adm-zip");
const MAJOR_ERR = "MAJOR";
const TEST = false && global.gConfig.config_id != "prod";
const TESTDATE = true && global.gConfig.config_id != "prod";

const handleDocZipFile = async (userInfo, originalFnam, fnam, overwrite = "n") => {
  try {
    console.log("BFD442 handleDocZipFile", originalFnam, fnam, overwrite);
    await dbLib.dbAudit("upload documentation file " + originalFnam, userInfo);

    const docDir = global.gConfig.documentation_dir;

    const zipFnam = global.gConfig.uploads_dir + "/" + fnam;
    // console.log("BVD443", zipFnam);
    const zip = new AdmZip(zipFnam);

    if (overwrite == "y") {
      await utils.rmdir(docDir, "FHY774");
      utils.mkdir(docDir);
    }

    zip.extractAllTo(docDir, overwrite == "y");

    await utils.deleteFile(global.gConfig.uploads_dir + "/" + fnam, "HDT382");

    return {
      status: utils.OK,
    };
  } catch (e) {
    console.log("BXF394 handleDocZipFile ERROR", e);
    await dbLib.dbAudit("upload ref file " + fnam + " ERROR", userInfo, "JGR427", e);
    await utils.deleteFile(global.gConfig.uploads_dir + "/" + fnam, "FCD529");
    return { status: MAJOR_ERR, errorCode: "BXF394", err: e };
  }
};

const baseMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

module.exports = {
  handleDocZipFile: handleDocZipFile,
  baseMonths: baseMonths,
};
