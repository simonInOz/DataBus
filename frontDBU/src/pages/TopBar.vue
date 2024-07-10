<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <nav :class="'navbar custom-nav p-0 bg-' + variant">
    <div class="container-fluid p-0 me-3">
      <table class="tableTight">
        <tr class="tdLow">
          <td class="tdLow" rowspan="2">
            <img src="@/assets/logo.png" height="50" class="ms-2 me-3 jumpy" />
          </td>
          <td rowspan="2" class="centre pe-1"><h2>DataBus&nbsp;&nbsp;&nbsp;</h2></td>

          <td rowspan="1" class="tdLow squeezeSlight centre pe-1">
            {{ title }}&nbsp;<span class="red">{{ specialTitle }} </span>
            <span v-if="env" class="tiny jumpy">
              {{ user_ID }} <i>{{ mnemonic }} ({{ env == "prod" ? "" : env + "&nbsp;" }}v{{ version }})</i>
            </span>
          </td>
        </tr>
      </table>

      <div id="navbarSupportedContent" class="navbar p-0">
        <router-link v-if="roles.includes('operator') && showCronMenu" to="/ListCronErrors" class="redFlash dashmenu"
          >Cron Errors</router-link
        >
        <router-link v-if="user_ID != ''" to="/home" class="dashmenu">Dashboard</router-link>

        <router-link v-if="roles.includes('aggregator')" to="/aggregation" class="dashmenu">Aggregation</router-link>

        <div :id="'menu' + role" v-if="menuDisplay > 0" class="dropdown" v-for="role in roles" :key="role">
          <span v-if="dropDownMenuItems[role] && dropDownMenuItems[role].length > 0">
            <button
              class="btn dropdown-toggle link dashdropdown"
              type="button"
              :id="'dropdown' + role"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              {{ camel(role) }}
            </button>
            <ul class="dropdown-menu" :aria-labelledby="'dropdown' + role">
              <li v-for="entry in dropDownMenuItems[role]" class="dropdown-item dlink" :key="entry">
                <span class="dropdown-header dhead" v-if="entry.menuHead">{{ entry.name }} </span>
                <span v-else>
                  <router-link v-if="entry.sub" class="dropdown-item dlink" :to="entry.to"
                    >&nbsp;&nbsp;{{ entry.name }}</router-link
                  >
                  <router-link v-else class="dropdown-item dlink" :to="entry.to">{{ entry.name }}</router-link>
                </span>
              </li>
            </ul>
          </span>
        </div>
        <router-link v-if="roles.includes('user')" to="/documentation" class="nav-item link dashmenu">Documentation </router-link>

        <router-link
          v-if="(env == 'dev' || env == 'uat') && !user_ID"
          width="75px"
          to="/fakelogin"
          class="nav-item float-end link dashmenu">
          <i>Simulated Login</i>
        </router-link>

        <router-link
          v-if="user_ID != null && user_ID.length > 0"
          width="75px"
          to="/logout"
          class="nav-item float-end link dashmenu">
          <i>Log Out</i>
        </router-link>
      </div>
    </div>
  </nav>
  <dialog id="banner" @click="hideBanner">
    <Markdown class="md-body" :source="msg" />
  </dialog>
</template>
<script>
import axios from "axios";
import Markdown from "vue3-markdown-it";
export default {
  name: "TopBar",
  //components: { MarkdownItVue },
  components: { Markdown },
  props: [],
  data() {
    return {
      variant: "light",
      title: null,
      specialTitle: null,
      topMenuClass: "topHead menuV",
      appInfo: "",
      version: localStorage.version,
      user_ID: localStorage.user_ID,
      mnemonic: localStorage.mnemonic,
      company: localStorage.company,
      members: localStorage.members ? localStorage.members.split(",") : [],
      roles: [],
      myRoles: localStorage.roles,
      menuDisplay: 0,
      Group: null,
      SubGroups: "",
      mainRole: "",
      env: "???",
      currentHref: "???",
      timeoutID: null,
      msg: "",
      showMoreAdmin: false,
      showCronMenu: false,
      lastBannerCheck: 0,
      cls: [], //css classes for certain menu items

      dropDownMenuItems: {
        admin: [
          { to: "/lookuplist/LoginSources/LoginSources", name: "Login Sources" },
          { to: "/lookuplist/DataSources/DataSources", name: "Data Sources" },
          { to: "/lookuplist/cronJobs/Cron%20Jobs%20Details", name: "Cron configuration" },
          { to: "/TestDomino", name: "Test Domino" },
          { to: "/listconfigdata", name: "Operational Data" },
          { to: "/listpage/Logins", name: "Logins" },
          { to: "/listpage/Audit", name: "Audit" },
          { to: "/downloaddoczip", name: "Documentation Files" },
          { to: "/listCronErrors", name: "Cron Errors" },
          { to: "/listLogData", name: "List Log Data" },
          { to: "/tablesdisplay", name: "Table Definitions" },
          { to: "/about", name: "About" },
        ],
      },
    };
  },
  async mounted() {
    this.$bus.off("userUpdated");
    if (!this.$bus.on('userUpdated")'))
      this.$bus.on("userUpdated", (data) => {
        this.mainRole = "";
        this.user_ID = localStorage.user_ID;
        this.Group = localStorage.Group;
        this.SubGroups = localStorage.SubGroups;
        this.env = localStorage.environment;
        this.mnemonic = localStorage.mnemonic;
        this.company = localStorage.company;
        this.roles = localStorage.roles && localStorage.roles.length > 0 ? localStorage.roles.split(",") : [];
        this.mainRole = localStorage.roles.includes("admin")
          ? "admin"
          : localStorage.roles.includes("operator")
          ? "Operator"
          : localStorage.roles.includes("user")
          ? "member"
          : "";
        this.menuDisplay += 1;
      });

    // this.on("titleUpdated", (title) => {
    //watch(()=>bus.value.get('titleUpdated'), (data) => {

    this.$bus.off("titleUpdated");
    this.$bus.on("titleUpdated", (data) => {
      this.currentHref = window.location.href;
      if (this.env == "dev" && window.location.href.includes("localhost")) this.variant = "warning";
      else this.variant = "light";

      const title = data;
      if (title && title != "Dashboard" && title != "File Upload" && title != "Documentation") {
        this.title = title;
      } else this.title = "";
      // alert("titleUpdated " + this.title)
      if (this.title.length > 25) this.topMenuClass = "topHeadSmall menuV";
      else this.topMenuClass = "topHead menuV";

      this.env = this.$environment;
      this.version = localStorage.version;

      //this.checkBanner(); // async call

      //timeout on session expiry
      setInterval(() => {
        // console.log("FCD221",this.title,localStorage.expiryTime,new Date().getTime());
        if (localStorage.expiryTime > 0 && localStorage.expiryTime < new Date().getTime()) {
          localStorage.expiryTime = 0;
          this.$router.push("/logout?reason=Session timeout");
        }
      }, 10000); //check every 10 sec
    });
    this.$bus.off("cronErrors");
    this.$bus.on("cronErrors", (data) => {
      this.showCronMenu = data == "y";
    });
  },
  methods: {
    camel: (name) => name.substring(0, 1).toUpperCase() + name.substring(1),
    async checkBanner() {
      //no more than once per minute
      const nowMillis = new Date().getTime();
      if (nowMillis - localStorage.lastBannerCheck > 60000) {
        const url = this.$fileUrl + "/banner/";
        try {
          let response = await axios.get(url);

          const msg = response.data.recordset[0].message;
          const bannerType = response.data.recordset[0].bannerType;
          const bannerDurationSecs = response.data.recordset[0].durationSecs;

          // console.log("KJH663", response.data.db, this.$environment, this.specialTitle)

          if (response.data.db == "prod" && this.$environment != "prod") {
            this.specialTitle = "PROD DB " + this.$environment;
          } else if (response.data.db != "prod" && this.$environment != "prod") {
            this.specialTitle = this.$environment;
          } else this.specialTitle = null;

          if (
            bannerType == "every page" ||
            localStorage.bannerShown == "No" ||
            localStorage.banner != msg // new banner!
          )
            this.showBanner(msg, bannerType, bannerDurationSecs);
          localStorage.lastBannerCheck = new Date().getTime();
        } catch (e) {
          console.log("BDU726", e);
          this.hideBanner();
        }
      }
    },
    showMoreAdminMenus() {
      this.showMoreAdmin = !this.showMoreAdmin;
    },

    showBanner(txt, bannerType, secs = 5) {
      // console.log("FDS552 showBanner", txt, bannerType, secs);
      if (this.timeoutID) clearTimeout(this.timeoutID);
      if (txt && txt.length > 0) {
        let banner = document.getElementById("banner");
        this.msg = txt;
        banner.show();
        this.timeoutID = setTimeout(() => {
          this.hideBanner();
        }, secs * 1000);
      } else {
        this.hideBanner();
      }
      localStorage.bannerShown = "Yes";
      localStorage.banner = txt;
    },
    hideBanner() {
      if (this.timeoutID) clearTimeout(this.timeoutID);
      this.timeoutID = null;

      let banner = document.getElementById("banner");
      banner.close();
    },
  },
};
</script>
<style scoped>
.custom-nav {
  -webkit-box-shadow: 0px 3px 6px 2px #cccccc;
  -moz-box-shadow: 0px 3px 6px 2px #cccccc;
  /* box-shadow h-offset(px) v-offset(px) blur(px) spread(px) color */
  box-shadow: 0px 3px 3px 2px #cccccc;
  align-items: normal !important;
}
.menuV {
  vertical-align: sub;
}
.topHead {
  text-shadow: 1px 1px #cccccc;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
}
.topHeadSmall {
  text-shadow: 1px 1px #cccccc;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
.dropmore {
  width: 100%;
  text-align: left;
}
.dropmore:hover {
  color: white;
  background-color: #99cccc !important;
}
.dashdropdown {
  min-height: 50px;
  font-size: 18px;
  font-weight: normal;
  color: gray;
  background-color: #f8f9fa;
  border-radius: 0px !important;
  border: none !important;
}
.dashdropdown:hover {
  vertical-align: top !important;
  min-height: 50px;
  font-size: 18px;
  font-weight: normal;
  color: white !important;
  background-color: #99cccc !important;
}
.router-link-active {
  color: white !important;
  background-color: #9cc;
}
#banner {
  overflow: auto;
  background: white;
  box-shadow: 0 0 10px #ffc107;
  border-radius: 10px;
  animation: fadeInAnimation ease 1.75s;
  padding: 10px;
  z-index: 9999;
}
.flexmenu {
  height: 50px;
  background-color: blue;
}
.dhead {
  font-weight: bold;
  font-size: 12pt;
  padding: 0;
}
.dlink {
  height: 23px;
  padding-top: 0px;
  padding-bottom: 3px;
  padding-left: 5px;
}
.tableTight,
tr,
td {
  padding: 0;
  margin: 0;
  height: 100%;
  height: 30px;
}
.alignBottom {
  vertical-align: bottom;
}
.alignTop {
  vertical-align: top;
}
.redFlash {
  color: white;
  animation-name: flashy;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
}
@keyframes flashy {
  from {
    background-color: red;
    color: white;
  }
  to {
    background-color: #ffc107;
    color: gray;
    /* transform: rotate(360deg);*/
    /* transform: rotateY(360deg) rotateX(360deg) rotateZ(360deg); */
  }
}
</style>
