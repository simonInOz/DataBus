* config.json - contains a lot of configuration information
  * database name, db password and JWT secret token (may be overriden by a command variable in Azure)
  * directories, eg uploads_dir -> "./uploads"
  * roles - these are regular expressions
  * special config info for the custom parsers like "Annual BPAY file" 
  * odd params such as "due_day_of_month", "past_due_day_of_month"
* package.json - standard file
  * version must be updated on changes (also true for VueJs front end to force the browser to recache)
  * It lists all the dependencies (Azure reads this and automatically imports them)
* documentation files (like this) - these are all stored in a tree under /doc