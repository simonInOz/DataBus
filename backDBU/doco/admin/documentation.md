## Structure

The documentation is in **markdown format**, and consists of a tree structure of .md files.
The directory tree structure, and the file names, form the menu of the documentation.

Files may be ordered by adding **2_** in front of the filename. These numbers order the files in the menu, do not appear on screen. It supports 0-9. Otherwise files are ordered by name.

Markdown format: https://www.markdownguide.org/basic-syntax/

## Diagrams

The markdown files may contain diagrams using **Mermaid format**. 
A Mermaid section is started by three backticks (under tilde) mermaid
and ended by three more backticks

Mermaid format: https://mermaid-js.github.io/mermaid/#/./n00b-syntaxReference

Example:

    ```mermaid
    flowchart LR
        k[fa:fa-user Member ] --->|files & JWT| b[fa:fa-server PSMS server]
        d[fa:fa-user Member ] ---> |files & JWT|b
        e[fa:fa-user Aggregator ] --->|files & JWT|b
        ee[fa:fa-user-circle AusPayNet<br>Operator] --->|files & JWT|b
        ff[fa:fa-user-circle AusPayNet<br>Admin] --->|files & JWT|b

        subgraph Azure Cloud
        b<-->db[fa:fa-database Database]
        end
    ```

### Warning

Please ensure you do not use exactly the same filename in two places (eg 03_Overview.md) as the earlier one will get overwritten by the later one.

### Updating
You may download a complete zipped tree of the documentation, and subsequently upload it with changes, overwriting the previous documentation. (This will be overwritten by a new s/w release by the original version, but you can overwrite it again with your zip file).