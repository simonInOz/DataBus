Statistics files are spreadsheet files that are imported directly to a custom table. No checking is performed.

They require a reference file with some special features. The normal recognition process applies - using the **unique cell**

The Config sheet specifies the destination database table (which must end with **_stats**), eg **Regulator_Info_stats**

This is specified as 

* tableName: **Regulator_Info_stats**

Optionally, if the FI name and/or the Quarter may be derived, this is specified in the Config sheet:

* FISource:	**filename** - *FI source derived from the filename.  Mnemonic is the first three letters of the filename. Eg AMP_info.xlsx -> AMP*
* FISource:	**APN** - *"APN" will be used as the mnemonic*
* FISource:	**user** - *the mnemonic for the user's FI is used*
* FISource:	**userOrFilename** - *the mnemonic for the user's FI is used, for operator or admin, the filename is used as above*
* PeriodSource:	**filename** - *Quarter derived from the filename. Eg AMP_info_Q1 2023.xsls -> Q1 2023. Spaces ignored, _ (underscore) is the seperator. Quarter may appear anywhere in the filename*
* PeriodSource:	**prevQuarter** - *Quarter derived from the date of submission - ie the previous quarter*

### Cell commands
Any cell that is to be saved to the table specified in the Config sheet should be:
* **|save(columName)** .. saves as varchar(255) to the given columnName in the table specified in Config sheet
* **|save(columnName:type)** .. saves as given type
* **|save(tableName.columnName)** .. saves to the specified table (created as required)
* **|save(tableName.columnName:type)**

Note the leading | (shift backslash AKA pipe for unix enthusiasts)

If the same name is encountered again, the data goes in a new database table row.

Where you have identical rows, put **|repeatWhileData** in the first column of the row following the **!save** commands. Data rows will be loaded to the same database columns as long as there is data in the spreadsheet file (making multiple rows in the database table). This must be the last command in the reference file.

The table specified will be created automatically, and may be viewed via admin/info tables. Only tables with names ending **_stats** may be accessed.

The resulting **xxxxx_stats** table columns:
* FI_ID
* FI_Mnemonic
* sourceFile
* Quarter
* ReportPeriod_ID
* uploads_ID
* created (date time)
* addr - from the sheet
* **plus** all the columns specified in the reference file |save commands

**NB** If data is overwritten or deleted, the table specified in the Config sheet will be overwritten/deleted, but not any further custom tables as specified in **|save(specialTable.colName)**


