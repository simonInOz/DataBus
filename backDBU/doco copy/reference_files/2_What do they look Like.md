### What does a reference File look Like?

They look just like a Excel data file, but with added markers.

To make a reference file, start with the file you wish to import, and replace various cells, especially the data cells, with markers. All unmarked cells must match 1:1 on import (or the imported file will be rejected).

For the two types of import files:

- fixed format – the most common type, and there are simply empty cells for the user to fill in. The corresponding reference file is identical to this, with the data cells (volume or value) marked with **$xx**. If the cell is optional (ie not checked for variance), it should be marked with **?xx**. The name for the corresponding field when the data is uploaded to the database is derived from the surrounding labels.
- Custom format – these are of variable length. Each different type has a custom import process. Generally, the reference file cells do not need to be marked in any way as this is specified in the import process

There are a few other special markers:

- **&amp;ignore** – ignore this cell. This is especially useful for the cell that redirects to the error checking, often cell D1
- **&amp;end** – stop processing – all subsequent cells are ignored. This is useful when there is extra data that needs to be ignored
- **^FI\_ID|lookupCompany()** – the value in the imported data in this cell is looked up in the list of companies, and FI\_ID is derived. (Often B4)
- **^ReportPeriod\_ID|lookupReportingPeriod()** - the value in the imported data in this cell is converted to a ReportPeriodID. (Often B6)
- **$xxx|sum(a12:a14)** - the value in the imported data in this cell is expected to equal the sum of cells a12:a14 [NB – this works vertically only]
- **|save(colName)** - for statistics uploads, the value in the cell will be saved to a new statistics table (*TableName* in the config sheet) in column *colName*
- **|save(extraTableName.colName)** - for statistics uploads, the value in the cell will be saved to a new statistics table (*extraTableName*) in column *colName*
- **^qtr!lookupQuarter()** - for statistics uploads, this resolves the quarter, eg Q4
- **^year!lookupYear()** - for statistics uploads, this resolves the year, eg 2019

### Statistics Uploads
For statistic uploads, where the reference file contains multiple entries with the same **[extraTableName.]colName**, a new row will be added to the appropriate table as the data is imported.

### Config Sheet
Each reference file requires a Sheet named **Config** which contains the details for the file.
It has the following rows:
- **originalFname** - *filename* [not used]
- **Data_Provided** - eg *RBA Cheque Stats*
- **appliesFrom** - an actual Excel date, eg *19/02/2019*
- **appliesUntil** - an actual Excel date, eg *19/02/2025*
- **sheetName** - * for first sheet, otherwise sheet with the uniqueCell(s)
- **uniqueCell** - one or several Excel cells address eg *B3* or *A2,A11,A38*
- **TableName** - generally *default*, but for statistics uploads, the name for the destination table, eg *RBAChequeStats*

**TableName** row is only required where it is not *default*.

**uniqueCell** is crucial for identifying the data. The data in the unique must indeed be unique. It might require multiple cells to do this. If a new sheet version appears, it can be necessary to add extra unique cells in the older version of the ref file to distinguish the new and old forms.

