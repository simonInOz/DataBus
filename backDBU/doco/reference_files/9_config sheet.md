### Config Sheet

On the &quot;List Reference Files&quot; page, you can download the config sheet for any reference file – this contains the current details from the database for the associated reference file. If you add this sheet to the reference file, you can subsequently drop one or may such files in a bulk load and the data will be automatically entered.

You can also download a reference sheet with the config sheet added, but this removes the reference sheet formatting, so it is better to just get the config sheet.

Also, you can download a zip of all the files as they were uploaded (with no updates to the config sheets). This is from the **Upload Reference Files** page.

Example Config sheet:

- originalFname:	CNP_Acquirer_Trend
- Data_Provided:	CNP_Acquirer_Trend
- appliesFrom:	1/01/2019
- appliesUntil:	1/01/2028
- sheetName:	* (* = first sheet, else case sensitive sheet name)
- uniqueCell:	A1 (multiple cells are possible, eg A2,A11,A38)
- MultipleFIs:	No (Set to Yes for files with multiple FIs, eg NPP Stats)
- *tableName:	CNP_Acquirer_Trend_Stats (must end _Stats for statistics files)*
- *FISource:	filename*
- *PeriodSource:	filename*

*Italicised* entries are optional - they are used for statistics files

When the reference file is loaded, the unique cell/cells is saved into uniqueCellValue

