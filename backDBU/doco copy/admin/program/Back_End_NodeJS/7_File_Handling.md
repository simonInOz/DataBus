# How is an incoming spreadsheet file handled?
1. The incoming file (or file, but each is handled individually) is uploaded to the server.

1. It gets saved to the upload directory under a unique name. 

1. Why save it as a file? So it may be read by the spreadsheet parsing program xlsx. This is an open source parsing program that handles most spreadsheet files, including Excel (new and old formats), Lotus, etc.

1. An update table entry is immediately created for the file.

1. The file is parsed and processed by the Datasheet, CellLable and Ref classes. The filelib and file programs check the process. Any errors are saved to the upload_errors table.

1. After the parsing and checking, the updates table entry is updated to reflect the process. The uploaded files is deleted.

1. The results are then returned to the user as an update to the displayed list of updates. Users may click through to any errors.