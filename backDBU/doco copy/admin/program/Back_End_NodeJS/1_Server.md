# Overall Back End Server Structure
The back end is written in NodeJs.

There are several areas, each accessed via a subdirectory of the URL. These are routes.

* authRouter.js - /auth/xx - handles authorisation
* file.js - /file/xx -handles file requests
* index.js - / - just a stub
* db.js - /db/xx -handles database requests

## authRouter.js - handles authorisation
This handles login. In fact the actual login occured on Domino, and this checks the forwarded JWT token.
Each exchange with the back end has an attached JWT, and it is checked with every call.
NB There is a "fake login" function called /signin. This is for testing only, and is not available in production.

## file.js - handles file requests
Mainly uploads and downloads, this covers:
* documentation - this treates a tree of the documentation files and passes the entire thing back to the client for display. Documentation files are in Markdown format, with included Mermaid diagrams and JSON formatting using markdown-it-vue
* uploadDocZip - uploads a new or updated zip file of the tree of documentation files (.md [markdown and mermaid])
* downloadDocZip - downloads a zip file of the tree of documentation files
* uploadMultiple - this handled the upload of one or many spreadsheet files as uploaded by users. **This is the most crucial function of the entire system.** It handles each file in turn (using filelib), and returns results to the user
* uploadRefs - upload multiple reference files (must include "config" sheet"). Handled file by file through fileLib
* uploadRef - upload single reference file
* downloadRefFile - downloads a copy of the reference file. Either the entire file with config, or just the config sheet. Best to get just the config sheet, as the formatting is destroyed
* uploadMasterList - this handles the uploading of the large MasterList. It steps though the sheets, extracts all the data, and rebuilds the database tables using the masterList library
* createMasterList - builds a local copy of the masterlist from all the databse tables using the masterlist library
* downloadMasterList - downloads the local masterlist copy and deletes it
* uploadIdSheet - not used in production, creates a new database table from a spreadsheet file
* downloadUpload - downloads the requested uploaded spreadsheet file
* emailApi - downloads a JSON formatted set of data for emailing
``` json
[
  {
    "parameters": {
      "Month": "Jan",
      "Year": 2022,
      "Framework": "APCS",
      "api_called": "2022-02-21T03:23:56.316Z",
      "RP_ID": "RP_121",
      "due": "all",
      "reminder_date": "15/02/2022",
      "due_date": "22/02/2022",
      "past_due_date": "28/02/2022",
      "Status": "reminder"
    }
  },
  {
    "FI Name": "Bendigo and Adelaide Bank Limited",
    "Primary Mnemonic": "BBL",
    "Info": [
      {
        "Framework": "APCS",
        "Merge To": "",
        "sources": [
          {
            "Data Provided": "Standard RBA Cheque Form",
            "Status": "reminder",
            "Email Notification": "Yes",
            "Frequency": "Monthly",
            "Due": "y"
          }
        ]
      }
    ]
  },
  {
    "FI Name": "AMP Bank Limited",
    "Primary Mnemonic": "AMP",
    "Info": [
      {
        "Framework": "APCS",
        "Merge To": "",
        "sources": [
          {
            "Data Provided": "Standard RBA Cheque Form",
            "Status": "reminder",
            "Email Notification": "Yes",
            "Frequency": "Monthly",
            "Due": "y"
          }
        ]
      }
    ]
  }
]
```

## index.js - just a stub

## db.js - handles database requests

It accesses the database directly without using an object relational mapping. The database access is handled in the module dbLibTransactionSql. 
Many of the SQL requests are saved there and named, but some are not. Some SQL sequences are generated directly in code elsewhere.

## file.js - Handles file type requests

This handle file requests such as /listConfig /uploadMultiple and etc. 
It handles file uploads and downloads for FI, reference and documentation files, including zips.