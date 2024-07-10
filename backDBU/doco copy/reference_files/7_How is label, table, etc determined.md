### How does the system determine the label, table, etc for the extracted data table?

This is a simple set of heuristics. In the standard format, the program checks the data sheet to find the info for the current cell. It searches up to find the column heading and sub header, and across to get the row heading, then up to find the super heading. From all this, it generates the required data, and looks up the required report and table.

Sub groups, like &quot;of which: customer-initiated bulk files&quot; are important for the heuristic process. They generally appear indented on the original Excel data sheets, but unfortunately, the import process cannot see this indentation. So the heuristic assumes anything that starts with lower case is a sub group. Therefore if there is a subgroup (indented), change it _in the reference file_ to have _the leading character lower case_ for the heuristic to work.

**Warning**. This heuristic process is sensitive to format changes in the incoming spreadsheets. If they change substantially, these heuristics will fail.
