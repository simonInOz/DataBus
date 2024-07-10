The system may be entirely configured using the MasterList. This is a rather large Excel workbook with mutiple sheets.
Each sheet corresponds to one or many tables in the database.
The import process replaces all the reference data. It will not affect any uploaded data or files, nor affect the reference files.
For bulk changes, it may be easier to export the masterlist, perform the editing in Excel, and reimport.

## MasterList Sheets

### FI Details
The most imporant - and largest - sheet is **FI_Details** (aka **MRA Table**).

This sheet covers the data for all the Financial institutions. The FI details, Frameworks, and Forms for each FI. It covers memberships, which forms are permitted, frequency, and many other items. This sheet sets up the database tables FI_Details, FI_Frameworks and FI_Forms.

### Minor Sheets/tables
Each of these sheets sets up a single table with a corresponding name.
- BPAY PI Code - BPAY entries use a special code 
- HVCS BIC - HVCS use a special code
- Austraclear ESA Holder - Austraclear uses a special code
- EFTPOS Financial InstCode - EFTPOS use a special code
- tbl001 indue calc - reference only
- tbl005 tabledetails - this table controls how items are marked in the extracted_data 
- tbl008 weight - reference only
- tbl010 streamtype -  reference only
- tbl011 inward and outward - reference only
- AggregatorCalc - used for correcting merged data
- CalcDetails - used for correcting merged data
- SubGroups: this controls what the user may access, according to the subgroup in their logon 
eg CS1, Standard RBA Cheque Form
- Error_Codes - lists all the displayable error codes, with descriptions and suggestions

The download process may be restricted to only certain tables, eg **CalcDetails AggregatorCalc**. Only for tables other than the FI_xxx tables.

The upload process will also handle limited sets of sheets, for example a spreadsheet with only one sheet named **CalcDetails** will only clear and set the values for that specific table without affecting anything else.

It is possible to import further simple tables by adding extra sheets. They will be imported into the database as (new if required) tables (following the sheet name) for reference. They will not be re-exported on MasterList Download.
