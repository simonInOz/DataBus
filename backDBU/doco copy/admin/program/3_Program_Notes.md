## General Templates
* Card2 - a visual card display used on Dashboards. Each card displays as a box containing a variety of items
* Edit - this handles the editing of a database record
* EditField - this handles the editing of a single database field
* LookupList - this is a general template to display any list of data (this is rather large, mainly due to the countless template instances for differnt data displays)
* ListMy - a general purpose page to display paged data

## Control Files

### routes.js
This handles routing in the normal Vuejs manner. It has a dynamic loader for all pages, with some exceptions where extra parameters are required (eg lookupedit)

### App.vue
Standard VueJS file for the client side application. Holds some CSS used throughout (this is fairly minor, with nearly all CSS coming from BootstrapVue).

### main.js
This file holds the URLs for the back end calls, and also performs checks on every call to check the JWT is still valid. In login, it parses the JWT and puts the parsed info into locastorage.