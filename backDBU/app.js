var createError = require("http-errors");
var express = require("express");
var path = require("path");
//var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var fs = require("fs");
const process = require("process");

const config = require("./config/config.json");

const defaultConfig = config.dev;
let environment = "dev";
environment = process.env.environment || "dev";

console.log("VDE432 env", environment);
const environmentConfig = config[environment];
const finalConfig = { ...defaultConfig, ...environmentConfig };
global.gConfig = finalConfig;
global.gConfig.environment = environment;

//get the database pwd and the JWT secret key from environment variables
const envTokenKey = process.env.TOKEN_KEY;
const envDbpassword = process.env.DBPASSWORD;
if (envTokenKey) global.gConfig.TOKEN_KEY = envTokenKey;
if (envDbpassword) global.gConfig.dbpassword = envDbpassword;

var indexRouter = require("./routes/index");
var dbRouter = require("./routes/db");
var fileRouter = require("./routes/file");
var authRouter = require("./routes/authRouter");

//make empty directories
const dirs = ["uploads", "ref_files", "export_files"];
for (const dir of dirs) {
  try {
    fs.mkdirSync(dir);
    console.log("BGR234 created directory", dir);
  } catch (e) {
    //console.log("GTYU273 mkdir", dir, e);
  }
}

//node-cron is a scheduler for NodeJS
//CronJobs module checks the cronjobs table, runs due jobs, marks them as run
const chronJobs = require("./modules/CronJobs");
const cron = require("node-cron");

const cronSchedMinute="* * * * *"
const cronSchedHour="0 * * * *"
const cronSchedDay="* 21 * * *" //run at 9pm every day

cron.schedule(cronSchedHour, () => {
  // console.log("running a task every hour", new Date());
  chronJobs.check()
});

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(cookieParser());

//I believe this line loads VUE
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

// eslint-disable-next-line no-undef
app.use("/static", express.static(path.join(__dirname, "static")));

app.set("etag", false); //this should stop 304 responses sjp 25/2/2022

//identify yourself!
app.get("/about", (req, res) => {
  const packageJson = require("./package.json");

  let s = "<h2>PSMS</h2><ul>";
  s += "<li>Database: " + global.gConfig.dbdatabase + "</li>";
  s += "<li>Environment: " + environment + "</li>";
  s += "<li>Version: " + packageJson.version + "</li>";
  s += "<li>Node Version: " + process.version + "</li>";
  s += "</ul>";

  s += "<h3>Dependencies</h3><ul>";
  for (let d in packageJson.dependencies) {
    s += "<li>" + d + ": " + packageJson.dependencies[d] + "</li>";
  }
  s += "</ul>";

  res.send(s);
});

app.use("/", indexRouter);
app.use("/db", dbRouter);
app.use("/file", fileRouter);
app.use("/auth", authRouter);

global.pool = null; //connection pool

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" || req.app.get("env") === "dev" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("<h2>Error</h2><p>" + err + "</p>");
});

module.exports = app;
