# Overall Client Structure
The front end is broken into page components, with the top level pages (.vue files):
* TopBar - top menu object, displayed (at the top of the page). It handles menus, and also tracks the logon timeout (controlled by the JSON Web Token JWT as issued by Domino)
* Footer - fixed footer display
The central area is loaded according to the operation. 

## User (Member) pages:
* Uploads - displays FileUpload and UploadedItems
  * FileUpload - handles the upload of one or many user files
  * UploadedItems - displays a list of the users recently uploaded files
* Aggregation - for users that can submit files for other users (called "aggregators"). The page displays the files due for their aggragatees
* Documentaion - displays a tree of documentation for the user

The user pages are also available to the Operator and System Administrator

## Operator pages (AusPayNet)
The operator gets an Operator dropdown menu with extra functions. Operator may submit files for users.
* Members Monthly/Quarterly/Yearly Due - displays a list of the files due for Members for the current and previous periods
* Members Monthy/Quartely/Yearly Uploaded - displays a list of the files uploaded by Members for the current and previous periods
* Aggregated Monthly/Yearly Due - displays a list of the aggregated files due
* Aggregated Monthly/Yearly Uploaded - displays a list of the uploaded 
* Combined Monthly/Yearly Due - displays a list of the combined files due
* Combined Monthly/Yearly Uploaded - displays a list of the uploaded combined files
* List FI Details - shows details for all the FIs. Links to show Uploads, Frameworks, Forms, PI Details, HVCS BICs, ESA with editing
* Due Dates - display the calculated dates for reminder, due, past due
* Error Codes
* Aggregators and Combiners - shows all the Aggregators and Combiners, and what they aggregate or combine
* Recent Logins
* Recent Audit Entries
* Banner - show current banner and allow editing
* Email API Test - simple test function
* Uploads by Month - displays a graph of activity


## Admin pages
The system administrator has substantial control over the system and has access to all features of the system. This includes listing (and editing) of all files/tables on the system.
* Upload Reference File(s) - this uploads a reference file or files with config sheet that specifies all the parameters for that file
* List FI Details - shows details for all the FIs. Links to show Uploads, Frameworks, Forms, PI Details, HVCS BICs, ESA with editing
* Configuration Data - this allows display and editing of all signifcant config files (which are created from the MasterList), including:
   * Austraclear ESA Holder	
   * BPay PI Code	
   * EFTPOS Financial Inst Code	
   * HVCS BIC	
   * Recent Audit Entries	
   * Recent Logins	
   * Reference Data Provided- this shows which reference files are used for each "Data Provided"
   * Reference Files	
   * SubGroups
   * Table Details
   * Uploads
* Reference Tables - these are held here for reference only, they are not used by the system. They are loaded from the MasterList:
   * Action
   * Error Codes
   * Streams
   * tbl000 psms voting entitlement
   * tbl001 indue calc
   * tbl008 weight
   * tbl010 streamtype
   * tbl011 inward and outward
* Snapshot Table - allows a database table to be cloned into a new table
* MasterList
   * *Upload* - this will completely replace all config tables in the system. It does not touch extracted_data, uploads, upload_error, audit, logins, but all other tables are reset to the data from this (very large) workbook. The upload is lengthy, and should not be undertaken lightly
   * *Download* creates a multiple sheet workbook file containing all the data to configure the system. (For major edits, it may be easier to download and edit in Excel, before uploading the edited). Upload creates the corresponding file
* Logins, Audit Entries
* Create Period Log - copies all entries in working tables into a xxx_log table marked with a period timestamp
* More
   * Documentation Files - allows download and upload of a zipped documentation files for ease of updating. NB These are overwritten on system updates
   * Import Historical Files - to import differently formatted historical files
   * List Config - displays back end config file for the current environment, It shows which Files go to which table (eg Standard Austraclear Form -> RD_009::TD_025)
   * Create History Uploads - this updates the uploads table for historical data. It takes a long time and should only be used after historical data has been imported
   * Create Date Info - builds the Date table which is not used by the system

