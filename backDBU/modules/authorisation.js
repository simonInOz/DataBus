const TEST_IGNORE_JWT = false && global.gConfig.config_id != "prod";

const check = (userInfo, required, res = null) => {
  if (TEST_IGNORE_JWT) {
    console.warn("TGR999 ***** IGNORING JWT");
    return true; // TEST TEST TEST
  }

  if (userInfo && userInfo.roles) {
    if (userInfo.roles.includes("admin")) return true;
    if (required.role) {
      if (userInfo.roles.includes(required.role)) return true;
    } else if (required.roles) {
      for (const role of required.roles) {
        if (userInfo.roles.includes(role)) return true;
      }
    }
  }

  if (res != null) {
    console.log(
      "DYR729 check token fail",
      "required",
      required,
      "actual",
      userInfo.roles
    );
    res
      .status(401)
      .send("Requires " + required.role + " has " + userInfo.roles);
  }
  return false;
};

module.exports = {
  check: check,
};
