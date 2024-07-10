### Are there more reference file commands?

There are several variations.

A command contains one or a series of parts, split by a vertical line |

The first part:

- $xx – extract the data, and use the surrounding labels to determine the label, table, report, and number/volume for the  **extracted\_data** table. The data will be checked for variance (data point). This is a common form
- ?xxx – as above, but the data is _not_ checked for variance. This is probably _the_ most common form
- $ – extract the data from the corresponding incoming cell and copy it to [value in thousands] in the **extracted\_data** table
- ? – as for $ except the cell is optional, thus is not checked for variance
- \# – as for $, the data is copied to [volume]
- \^[column name] – used for lookups

Subsequent parts (in any order):

- TD\_? eg TD\_001 – this will specify that TableDetails\_ID should be TD\_001
- RD\_? eg RD\_001 – this will specify that ReportDetails\_ID should be RD\_001
- value – forces the type to be value (in thousands)
- number – forces the type to be number
- action() – means an action will be performed. These include:
  - LookupCompany() – the cell value will be looked up in the FI\_Details table and the corresponding FI\_ID value used. This is generally used to determine the FI\_ID for the company for the spreadsheet submitted, so the reference cell looks like **^FI\_ID|lookupCompany()**
  - LookupReportingPeriod() – determines a ReportingPeriod\_ID from the date in the data cell. The reference cell will look like **^ReportPeriod\_ID|lookupReportingPeriod()**
  - sum(a2:a13) – this action will sum the given cells in the data sheet, and check the value equals the value in the data cell. Otherwise, the cell is treated as normal. So a reference cell might appear **$xxx|sum(a2:a6)**
  - sum(a2:a13)|sum(a3:a5) – this action will sum the given cells in the data sheet, and check the value equals the value in the data cell for each of the sums. Otherwise, the cell is treated as normal. So a reference cell might appear **$xxx|sum(a2:a6)|sum(a3:a5)**
