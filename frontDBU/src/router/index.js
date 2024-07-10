import { createRouter, createWebHistory } from "vue-router";

import LookupEdit from "@/pages/LookupEdit.vue";
import ListPage from "@/pages/ListPage.vue";
import LookupList from "@/pages/LookupList.vue";
// import ListOpUploads from "@/pages/ListOpUploads.vue";
import Edit from "@/pages/Edit.vue";
import About from "@/pages/About.vue";
import UploadsByMonth from  "@/pages/UploadsByMonth.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
});

const LOGGING = false;
const skipAuto = [
  "lookupedit",
  "edit",
  "listpage",
  "lookuplist",
  "about",
  "uploadsbymonth",
];

//this does not compile in vue 3 (works in dev)
//Might be a Vite problem, no idea 2023/6/3

//load all the components and add routes for them

let modules = import.meta.glob("@/pages/*.vue", {
  import: "default",
  eager: true,
});

for (const path in modules) {
  const pageName = path.split("/").pop().split(".")[0].toLowerCase();
  if (!skipAuto.includes(pageName)) {
    const mod = modules[path];
    router.addRoute({
      path: "/" + pageName,
      component: mod,
      name: pageName,
    });
    if (LOGGING) console.log("NGR555 add route for", path, pageName);
  } else if (LOGGING) console.log("BGR444 skip", pageName);
}

router.addRoute({
  path: "/lookupedit/:op/:table/:id/:niceName/:FI_ID?/:showBack?", //FI_ID is optional
  name: "lookupedit",
  component: LookupEdit,
});

router.addRoute({
  path: "/listpage/:table/:RP?/:maxRP?/:FI_ID?/:FI_Name?/:period?/:filterOption?/:displayOption?",
  name: "listpage",
  component: ListPage,
});

router.addRoute({
  path: "/uploadsbymonth/:param?",
  name: "uploadbymonth",
  component: UploadsByMonth,
});

router.addRoute({
  path: "/lookuplist/:table/:name",
  name: "lookuplist",
  component: LookupList,
});

router.addRoute({
  path: "/edit/:id/:name",
  name: "edit",
  component: Edit,
});

router.addRoute({
  path: "/about",
  name: "about",
  component: About,
});

// routes.push({
//   path: "/editfiforms/:id/:name",
//   name: "editfiforms",
//   component: EditFIForms,
// });
router.addRoute({
  path: "/check",
  name: "check",
});

//for any routes not recognised - assume it a login attempt and
//forward to CHECK - this propagates the query string which otherwise is not seen
//CHECK (in router.beforeEach in main.js) looks for a JWT token
//if bad or no token, off we go to logout
// myRoutes.push({
//   path: "*",
//   //redirect: "logout",
//   redirect: "check",
// });

if (!router.hasRoute("uploads") && !router.hasRoute("/uploads"))
  console.log("HTD332 missing /uploads");
if (LOGGING) console.log("GGT284 routes", router.getRoutes());

export default router;
