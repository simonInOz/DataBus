* fileLib - handles multiple file functions
  * Most important is handling the data extracted from the incoming spreadsheet, it checks for legality and variance
  * starts the data extraction action by creating the Datasheet object
  * removes data from extracted data and uploads tables
  * save reference files, optioanally with config data

* masterList - all the functions for importing and exporting the masterlist. Creates tables as needed (so is used during install), imports data, builds export spreadsheet with all the data. <br>
Currently exports:
  * BPAY_PI_Code
  * HVCS_BIC
  * Austraclear_ESA_Holder
  * EFTPOS_Financial_InstCode
  * tbl000_psms_voting_entitlement
  * tbl001_indue_calc
  * tbl005_tabledetails
  * tbl008_weight
  * tbl010_streamtype
  * tbl011_inward_and_outward
  * SubGroups
  * Error_Codes


* utils - file functions, calculate ReportPeriod_ID from date, date functions, Excel column calculations
* authorisation - checks user info
* dbCreate - creates the database tables (where necessary) at initialisation (moved to masterlist upload) using createDB_001.sql. It will do updates using updatedb_xx.sql
