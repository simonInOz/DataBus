import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import mitt from "mitt"; //new for vue3

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"; //bootstrap 5
import "bootstrap-icons/font/bootstrap-icons.css";

import VueApexCharts from "vue3-apexcharts";

import jwt_decode from "jwt-decode";
import axios from "axios";

const LOGGING = false;

let environment = "prod";

if (location.toString().includes("psms-dev-main.")) environment = "dev";
if (location.toString().includes("psms-dev-main-uat.")) environment = "uat";
if (location.toString().includes("localhost")) environment = "dev"; //simon local dev machine only

const app = createApp(App);

//import all components
let components = import.meta.glob("./components/*.vue", {
  import: "default",
  eager: true,
});

for (const path in components) {
  const name = path.split("/").pop().split(".")[0];
  const component = components[path];
  app.component(name, component);
}

app.use(VueApexCharts);

//mitt is a global messaging system
app.config.globalProperties.$bus = mitt(); //new for vue3

//global functions
function padZero(s) {
  if (s < 10) return "0" + s;
  else return s;
}
const dFmtDate = (dString, format = "D/M/YYYY") => {
  try {
    let d = new Date(dString);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const y = d.getFullYear();

    const H = d.getHours();
    let h = H;
    let ampm = "am";
    if (H > 12) {
      h = H - 12;
      ampm = "pm";
    }

    const m = d.getMinutes();
    const sec = d.getSeconds();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let bits = [];
    let prev = "";
    for (let i = 0; i < format.length; i++) {
      const c = format.charAt(i);
      if (" /-:a".includes(c)) {
        if (prev.length > 0) {
          bits.push(prev);
          bits.push(c);
          prev = "";
        }
      } else prev += c;
    }
    if (prev.length > 0) bits.push(prev);

    let s = "";
    for (let bit of bits) {
      switch (bit) {
        case "D":
          s += day;
          break;
        case "DD":
          s += padZero(day);
          break;
        case "M":
          s += month;
          break;
        case "MM":
          s += padZero(month);
          break;
        case "MMM":
          s += months[month - 1];
          break;
        case "YY":
          s += ("" + y).substring(2);
          break;
        case "YYYY":
          s += y;
          break;
        case "H":
          s += H;
          break;
        case "HH":
          s += padZero(H);
          break;
        case "h":
          s += h;
          break;
        case "hh":
          s += padZero(h);
          break;
        case "mm":
          s += padZero(m);
          break;
        case "ss":
          s += padZero(sec);
          break;
        case "a":
          s += ampm;
          break;
        default:
          s += bit;
      }
    }
    return s;
  } catch (e) {
    console.log("NDTR332 date error", e);
    return "bad format " + format + " or Date " + dString;
  }
};
app.config.globalProperties.$date = dFmtDate;

const getRadioSelected = (name) => {
  let group = document.getElementsByName(name);
  for (let btn of group) {
    if (btn.checked) return btn.value;
  }
  return null;
};
app.config.globalProperties.$getRadioSelected = getRadioSelected;

const isCheckboxSelected = (id) => {
  let chk = document.getElementById(id);
  if (chk) return chk.checked;
  else return null;
};
app.config.globalProperties.$isCheckboxSelected = isCheckboxSelected;

const getInputValue = (id) => {
  let input = document.getElementById(id);
  if (input) {
    const tag = input.tagName.toLowerCase();
    if (tag == "select") return input.value;
    if (tag != "input") return getRadioSelected(id);

    const typ = input.type;
    switch (typ) {
      case "text":
      case "date":
      case "email":
      case "number":
      case "password":
        return input.value;
      case "checkbox":
        return input.checked;
      default:
        return null;
    }
  } else {
    //might be radio
    return getRadioSelected(id);
  }
};
app.config.globalProperties.$getInputValue = getInputValue;

const getInputValues = () => {
  try {
    let x = [];
    Array.from(document.querySelectorAll("*")).forEach((el) => {
      if (el.id) {
        const val = getInputValue(el.id);
        if (val != null) x[el.id] = val;
      }
    });
    return x;
  } catch (e) {
    console.log("GAI888", e);
    return null;
  }
};
app.config.globalProperties.$getInputValues = getInputValues;

const setInputValue = (id, val) => {
  let input = document.getElementById(id);
  if (input) {
    const tag = input.tagName.toLowerCase();
    if (tag == "select") {
      input.value = val;
      return;
    }
    if (tag != "input") return getRadioSelected(id);

    const typ = input.type;
    switch (typ) {
      case "text":
      case "date":
      case "email":
      case "number":
      case "password":
        input.value = val;
        break;
      case "checkbox":
        input.checked = val === true || val == "Y" || val == "true";
        break;
      default:
        break;
    }
  } else {
    //might be radio
    //??
  }
};
app.config.globalProperties.$setInputValue = setInputValue;

function plural(xx) {
  if (xx == 1) return "";
  else return "s";
}
app.config.globalProperties.$plural = plural;

app.config.globalProperties.$version = "VUE3";

function resetLocalStorage() {
  //localStorage.clear();

  localStorage.isAuthenticated = false;
  localStorage.user_ID = "";
  localStorage.members = "";
  localStorage.roles = "";
  localStorage.company = "";
  localStorage.fileTypes = "";

  localStorage.jwtToken = "";

  localStorage.bannerShown = "No";
  localStorage.banner = "";
  localStorage.lastBannerCheck = 0;
  localStorage.db = "default";
}

function getRoles(group) {
  let user = false,
    operator = false,
    admin = false;
  for (let grp of group) {
    if (grp.includes("Member")) user = true;
    if (grp.includes("Operational")) operator = true;
    if (grp.includes("Business")) admin = true;

    if (grp.includes("PSMSOP.MemberAPCA.Primary")) admin = true;
  }

  if (admin) return ["user", "operator", "admin"];
  if (operator) return ["user", "operator"];
  if (user) return ["user"];

  return [];
}
function getSubGroups(group) {
  let subGroups = [];
  for (let grp of group) {
    if (grp.includes("Member")) {
      const subGroup = grp.substring(0, 3);
      if (subGroup != "und" && !subGroups.includes(subGroup)) subGroups.push(subGroup);
    }
  }
  return subGroups;
}

function getMnemonic(group) {
  try {
    for (let grp of group) {
      if (grp.includes("Business Owner")) return "APN";
      if (grp.includes("Operational Owner")) return "APN";
      const pos = grp.indexOf("Member");
      if (pos > -1) {
        const endPos = grp.indexOf(".", pos);
        if (endPos > -1) return grp.substring(pos + 6, endPos);
      }
    }
  } catch (e) {
    console.log("JHT6328", e);
  }
  return null;
}

router.beforeEach(async (to, from, next) => {
  if (LOGGING) console.log("MHT664 router before each", "from", from, "to", to);
  //alert("MHT664 router before each from "+ from.name+ " to "+ to.name);
  // localStorage.prevURL = from.fullPath;
  // localStorage.currentURL = to.fullPath;

  const toNameUpper = to.name;

  let toName = toNameUpper;
  if (toNameUpper) toName = toName.toLowerCase();

  if (toName == "logout") {
    resetLocalStorage();
    next();
    return;
  }
  if (LOGGING) console.log("LKU777 login", toName, toNameUpper);

  if (toName == null || toName == "" || toName == "login" || toName == "check") {
    if (LOGGING) console.log("LKU776 login", to, toName, toNameUpper);

    resetLocalStorage();

    //handle login with get parameter jwt token or t
    let jwtToken;
    if (to.query.token) jwtToken = to.query.token;
    if (to.query.t) jwtToken = to.query.t;

    let jwtBody;
    if (jwtToken) {
      //NB Decode extract the info from the JWT body, it does not verify it
      // the back end has the secret key, and can verify our requests!
      try {
        jwtBody = jwt_decode(jwtToken);
        if (LOGGING) console.log("JWT889 jwtBody", jwtBody);

        //check the JWT expiry
        if (jwtBody.exp) {
          if (Date.now() >= jwtBody.exp * 1000) {
            console.log("JWT537 JWT expired");
            resetLocalStorage();
            next({ name: "logout", query: { reason: "JWT537 JWT expired" } });
            return;
          }
          if (LOGGING) console.log("GGF443 check expiryTime");
          const expiry = new Date(jwtBody.exp * 1000);
          localStorage.expiryTime = expiry.getTime();
          // console.log("AHT294 expiryTime", localStorage.expiryTime);
        } else {
          console.log("BST332 JWT no expiry");
          next({
            name: "logout",
            query: { reason: "BST332 JWT token has no expiry" },
          });
          return;
        }

        localStorage.isAuthenticated = true;
        if (LOGGING) console.log("JGR553 JWT checked (might not be signed)");
      } catch (e) {
        console.log("FRE111 JWT token problem", e);
        next({ name: "logout", query: { reason: "FRE111 JWT token problem" } });
        return;
      }

      if (LOGGING) console.log("NDY382 start set up localStorage");
      localStorage.email = jwtBody.Email;
      localStorage.user_ID = jwtBody.GivenName + " " + jwtBody.Surname;
      localStorage.Group = jwtBody.Group;
      localStorage.SubGroups = getSubGroups(jwtBody.Group);
      localStorage.roles = getRoles(jwtBody.Group);
      localStorage.mnemonic = getMnemonic(jwtBody.Group);
      localStorage.jwtToken = jwtToken;
      if (LOGGING) console.log("NDY394 set up localStorage complete");

      //check with the back end
      const url = baseUrl + "/auth/login";

      let clientip = "unknown";
      try {
        const ipUrl = "https://api.ipify.org?format=json";
        axios.get(ipUrl).then((json) => {
          if (LOGGING) console.log("BSY284 json", json);
          localStorage.clientip = json.data.ip;
        });
      } catch (e) {
        console.log("HFR443 ipify error", e);
      }

      const config = {
        headers: {
          "x-access-token": localStorage.jwtToken,
          clientip: clientip,
        }, //ip.address() },
      }; //note lowercase forced by http, apparently
      if (LOGGING) console.log("KDR382 ", url);
      try {
        let result = await axios.get(url, config);
        console.log("BBG664", result);

        localStorage.environment = result.data.environment;
        localStorage.appName = result.data.appName;
        localStorage.version = result.data.version;
        localStorage.database = result.data.database;
        // localStorage.clientip = clientip;
        localStorage.rightSize = 6;
        localStorage.refRightSize = 6;
        if (LOGGING) console.log("LST111", localStorage);

        if (LOGGING) console.log("GFT555 mnemonic", localStorage.mnemonic, "roles", localStorage.roles);
      } catch (eee) {
        console.log("KDH510", eee);
        next({ name: "logout", query: {reason:"FCD554 Bad Token"} });
        return;
      }

      if (LOGGING) console.log("JDU392 login complete");

      try {
        next({ name: "home" });
        //$bus.emit("userUpdated", "login");
        return;
      } catch (e) {
        console.log("MNB993", e);
      }
      return;
    } else {
      // Vue.$log.info("ndh583 login failed");
      console.log("nhd583 login failed");
      resetLocalStorage();
      next({ name: "logout", query: { reason: "ndh583 login failed" } });
      return;
    }
  } else {
    //if (pageUnrestricted(toName)) {
    //Vue.$log.info("nfh294 page " + toName + " unrestricted");
    // console.log("KFU884 default", toName)
    next();
    return;
  }
});

app.use(router);

let baseUrl = "";
if (location.toString().includes("localhost")) baseUrl = "http://localhost:3100";

const vp = app.config.globalProperties;

vp.$AppHeading = environment;
vp.$environment = environment;

vp.$baseUrl = baseUrl;
vp.$authUrl = baseUrl + "/auth";

vp.$dbUrl = baseUrl + "/db";
vp.$fileUrl = baseUrl + "/file";

vp.$emailUrl = baseUrl + "/file/emailApi";
vp.$documentationUrl = baseUrl + "/file/documentation";
vp.$documentationPrintableUrl = baseUrl + "/file/documentationPrintable";
vp.$uploadsUrl = baseUrl + "/file/uploadMultiple";
vp.$uploadHistoricalFilesUrl = baseUrl + "/file/uploadHistoricalFiles";
vp.$uploadRefsUrl = baseUrl + "/file/uploadRefs";
vp.$uploadSpecialUrl = baseUrl + "/file/uploadSpecial";
// vp.$uploadIdUrl = baseUrl + "/file/uploadidsheet";
vp.$uploadMasterListUrl = baseUrl + "/file/uploadMasterList";
vp.$uploadUploadsUrl = baseUrl + "/file/uploadUploads";
vp.$createMasterListUrl = baseUrl + "/file/createMasterList";
vp.$downloadMasterListUrl = baseUrl + "/file/downloadMasterList";
vp.$downloadRefFileUrl = baseUrl + "/file/downloadRefFile";
vp.$downloadUrl = baseUrl + "/file/download";
vp.$cradle = baseUrl + "/static/cradle2.html";

vp.$signinUrl = baseUrl + "/auth/signin"; //TBD TEST

vp.$baseMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

app.mount("#app");
