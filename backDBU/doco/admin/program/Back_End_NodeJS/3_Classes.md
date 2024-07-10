* **Action** - parsing of cells in reference files
* **CellLabel** - performs heuristics on the data cell to determine cell label, code, type
* **Datasheet** - this is the most important class. 
    * It handles reading the incoming spreadsheet, checking all the cells, handling the data points, optional data points, lookups, special function, ignore cells, dataes, etc. It has a standard process for "normal" spreadsheet, and custom handling for NPP, Austraclear, EFTPOS Annual, BPAY Annual, and HVCS. The first process is to recognise the sheet, which is done using "unique" cells
    * The incoming data cells must match the "unique" cells. This identifies the "data provided", eg "Standard RBA Bulk Electronic Clearing System Form". Then the spreadsheet is scanned, cell by cell, handling the data, the lookups, the data, and picking up any errors (which go to uploads_errors)
    * All this data goes to a single object, and that is checked for variance against perceeding data in the database (if any). If all is good, the data is saved - details in table uploads,  data in table extracted_data. Results return to the user
    * It also handles statistics files, which get saved to non-standard database tables (dynamically created if necessary)
* **Due** - handles due dates. Calculates the due dates, and can lookup which data is due
* **ErrorHandler** - used for (I know this is a surprise) error handling
* **Lookups** - data caching used in variance checks
* **Ref** - parses the reference file cell
* **TableBuilder** - handles the saving of data to, and the creation of, new or custom tables. This is used for the general purpose support of statistics files