The PSMS system is comprised of the following components:

```mermaid
flowchart LR
      k[fa:fa-user Domino] ---> b(fa:fa-server PSMS SPA on browser)
      b ---> e(fa:fa-server PSMS back end server)
      e ---> b
      e ---> f(fa:fa-server Azure Database)
      f ---> e
```

* Domino server - hosts the "tile" which constructs the JWT for authorisation
* SPA on Browser - Single Page Application (SPA) loaded from Azure using VueJS and BootstrapVue
* Back end server - running on Azure using NodeJs
* Database - running on Azure database (see Database documentation)
