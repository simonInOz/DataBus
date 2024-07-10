### What does &quot;Unique Cell&quot; mean?

The system needs to identify which type of file the user has uploaded. It does this by checking the &quot;unique cell&quot; on each reference file entry until it finds a match. Then it uses that reference file to control the upload and import.

**uniqueCell** (seen in the config sheet and the database) is crucial for identifying the data. The data in the unique must indeed be unique. It might require multiple cells to do this. If a new sheet version appears, it can be necessary to add extra unique cells (eg **B4,B6**) in the older version of the ref file to distinguish the new and old forms.