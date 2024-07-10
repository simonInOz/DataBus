const jwt = require("jsonwebtoken");
const utils = require("../modules/utils");
const dbLib = require("./dbLibTransactSql");
const TEST_IGNORE_JWT = false && global.gConfig.config_id != "prod";

const verifyToken = async (req, res, next) => {
  // console.log("KIJ888 verifyToken");
  if (TEST_IGNORE_JWT) {
    console.warn("UYT999 ***** IGNORING JWT");
    return next(); // TEST TEST TEST
  }

  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    console.log("KKK333 auth verifyToken - no token");
    await dbLib.dbAuditLogin("Missing token", null, "FDY634", "Missing token");
    console.log("BGT403 token problems");
    return res.status(403).send("A token is required for authentication");
  }
  let info, user;
  try {
    info = jwt.verify(token, global.gConfig.TOKEN_KEY); //throws exception if invalid
    
    //info=jwt.decode(token)
    
    user = await utils.deriveUser(info); //real login
    user.ip = req.headers.clientip; //only sent at login

    //console.log("GDS325 login", user, req.headers)

    if (user.roles.includes("admin")) user.roles.push("operator");
    if (user.roles.includes("operator")) user.roles.push("user");
    req.userInfo = user;
    if (req.route.path.includes("login") || user.ip /* || user.email=="Alexander.Michalak@greater.com.au" */) {
      await dbLib.dbAuditLogin("login", user, null, req.route.path, JSON.stringify(jwt.decode(token)), token);
    }
    if (req.route.path.includes("logout")) await dbLib.dbAuditLogin("logout", user);
    next();
  } catch (err) {
    console.error("KKK222 token bad format or NOT verified", err);
    if (token) console.log("KKK111", token);
    if (info) console.log("KKK222", info);
    if (user) console.log("KKK333", user);
    //console.log("KKK324", err);

    try {
      await dbLib.dbAuditLogin("login error", user, "DUT528", "Invalid token", JSON.stringify(jwt.decode(token), token));
    } catch (err2) {
      console.log("PIU666 audit err", err2);
    }
    console.log("MFG922 send invalid token 401");
    res.status(401).send("KHT555 Invalid token");
  }
};

module.exports = verifyToken;
