<template>
  <div class="ms-3 mt-3">
    <!--<h2>User Dashboard</h2>-->

    <b-container fluid>
      <b-row>
        <b-col v-if="showUserInfo" class="pt-0 pb-3 pe-4">
          <Card
            title="User"
            Height="100%"
            Width="100%"
            :bodyArray="[
              { desc: 'User ID', value: user_ID },
              { desc: 'Email', value: user_email },
              { desc: 'Roles', value: roles },
              { desc: 'Expiry', value: expiry },
            ]" />
        </b-col>
        <b-col v-if="showRecentUploads" class="pt-0 pb-3 pe-4">
          <Card
            :title="recentUploadsTitle"
            Height="100%"
            Width="100%"
            :bodyArray="recentUploads"
            :header="recentUploadsHeader"
            link="/listPage/uploads"
            :zzlinkText="recentUploadsLinkText"
            cardActionButtonText="Download" />
        </b-col>
        <b-col v-if="showTables" class="pt-0 pb-3 pe-4">
          <Card
            :title="tablesTitle"
            Height="100%"
            Width="100%"
            :bodyArray="tables"
            :header="tablesHeader"
            cardActionButtonText="Download" />
        </b-col>
        <b-col v-if="showStatistics" class="pt-0 pb-3 pe-4">
          <Card
            title="Statistics"
            Height="100%"
            Width="100%"
            :bodyArray="statistics"
            xlink="/uploadsbymonth/User"
            xlink-text="chart ..." />
        </b-col>
        <b-col v-if="showCronJobs" class="pt-0 pb-3 pe-4">
          <Card
            title="Cron Jobs"
            Height="100%"
            Width="100%"
            :bodyArray="cronJobs"
            xlink="/uploadsbymonth/User"
            :footer="cronJobsText" />
        </b-col>
      </b-row>
      <b-row
        ><b-col class="pb-4"
          ><b>{{ msg }}</b></b-col
        ></b-row
      >
      <b-row><b-col class="pb-4">&nbsp;</b-col></b-row>
    </b-container>
  </div>
</template>

<script>
import Card from "../components/Cards/MyCard3.vue";
import axios from "axios";
export default {
  name: "Home",
  components: { Card },
  data() {
    return {
      showUserInfo: false,
      showRecentUploads: false,
      showTables: false,
      showStatistics: false,
      showCronJobs: true,

      showStatisticsMonths: 7,
      showStatisticsMonthsOffset: 0,
      statsLinkText: "stats:uploadsbymonth/user",

      uploadsTitle: "Uploads",
      uploadsHeader: null,
      uploadsLinkText: "more:uploads",

      recentUploadsTitle: "Recent Uploads",
      recentUploadsHeader: null,
      recentUploadsLinkText: "more:uploads",

      tablesTitle: "Tables",
      tablesHeader: null,
      tablesLinkText: null,

      cronJobsLinkText:null,

      user_ID: localStorage.user_ID,
      user_email: localStorage.email,
      roles: localStorage.roles,
      members: localStorage.members,
      expiry: localStorage.expiry,
      statistics: [],
      recentUploads: [],
      tables: [],
      cronJobs: [],
      msg: "",
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  beforeCreate() {
    if (localStorage.isAuthenticated == "false") {
      this.$router.push("/logout");
    }
  },
  async created() {
    let head = "Dashboard";
    this.msg = "";

    this.$bus.off("cardAction");
    this.$bus.on("cardAction", (data) => {
      // console.log("BNS719", "id", data.item.action, "table", data.item.name);
      if (data && data.item && data.item.lastRun) {
        //export CSV
        this.makeCSVTable(data.item.action, data.item.name, ["id", "idUploads", "Filename"], 9999);
      } else alert("No data for " + data.item.name);
    });

    this.recentUploadsTitle = "Recent Uploads";
    this.$bus.emit("titleUpdated", head);

    this.showRecentUploads = this.roles.includes("user");
    this.showTables = this.roles.includes("user");
    this.showCronJobs = this.roles.includes("admin");

    let url, formCount, done;
    try {
      //recent uploads
      if (this.showRecentUploads) {
        this.recentUploadsHeader = null;
        url = this.$dbUrl + "/userUploads/all/0/8";

        formCount = 0;
        axios.get(url, this.config).then((r2) => {
          if (r2.data.status != "Ok") {
            this.msg += " AQQ221 " + r2.data.status + " " + r2.data.err;
            console.log("AQQ221", r2);
            return;
          }

          this.recentUploadsLinkText = "more...";
          for (let item of r2.data.recordset) {
            if (formCount > 7) {
              break;
            }
            this.recentUploads.push({
              date: this.$date(item.createdAt, "D/M/YYYY h:mma"),
              table: item.tableName,
              runBy: item.runBy,
            });
            formCount++;
          }
        });
      }

      //tables
      if (this.showTables) {
        this.tables = [];
        //starting at 0 (newest), 6 rows,
        this.tablesHeader = null;
        url = this.$dbUrl + "/DataSources";

        axios.get(url, this.config).then((r2) => {
          if (r2.data.status != "Ok") {
            this.msg += " AQQ221 " + r2.data.status + " " + r2.data.err;
            console.log("AQQ221", r2);
            return;
          }

          for (let item of r2.data.recordset) {
            if (item.active == "Yes") {
              this.tables.push({
                action: item.id,
                name: item.name,
                lastRun: item.LastRun ? this.$date(item.LastRun, "D/M/YYYY h:mma") : "-",
                createdBy: item.CreatedBy,
              });
            }
          }
        });
      }

      //cronJobs
      if (this.showCronJobs) {
        this.displayCronJobs()
      }

      if (this.showStatistics) {
        this.displayStatistics();
      }

      // show cron error menu if any unread
      if (this.roles.includes("admin") || this.roles.includes("operator")) {
        const cronResult = await axios.get(this.$dbUrl + "/cron_errors/unread/1", this.config);

        let c = "n";
        if (cronResult.data.status == "Ok" && cronResult.data.recordset.length > 0) c = "y";
        this.$bus.emit("cronErrors", c);
      }
    } catch (e) {
      console.log("FRYT664 error", e);
    }
  },
  methods: {
    action(param) {
      this.zzmsg = "hello from " + param;
    },
    displayCronJobs(){
      this.cronJobs = [];
        //starting at 0 (newest), 6 rows,
        const url = this.$dbUrl + "/cronJobs";

        axios.get(url, this.config).then((r2) => {
          if (r2.data.status != "Ok") {
            this.msg += " AQQ221 " + r2.data.status + " " + r2.data.err;
            console.log("AQQ221", r2);
            return;
          }
          // console.log("LKJ882", r2)
          for (let item of r2.data.recordset) {
            if (item.Active == "Yes") {
              this.cronJobs.push({
                name: item.name,
                cronFrequency: item.cronFrequency,
                cronOperation: item.cronOperation,
                params: item.params,
                lastRun: item.LastRun ? this.$date(item.LastRun, "D/M/YYYY h:mma") : "-",
                createdBy: item.CreatedBy,
              });
            }
            if(this.cronJobs.length==0) this.cronJobsText="No active jobs"
            else this.cronJobsText=null
          }
        });
    },
    displayStatistics() {
      // console.log("NHY666 displayStatistics");
      this.statistics = [];
      //const months = 7; //7 months, then finyear, then RPs
      const url = this.$dbUrl + "/uploadStatistics/" + this.showStatisticsMonths + "/" + this.showStatisticsMonthsOffset;

      axios.get(url, this.config).then((r4) => {
        if (r4.data.status != "Ok") {
          console.log("MFY432", r4);
          this.msg += " MFY432 stats " + r4.data.status + " " + r4.data.errCode;
          return;
        }

        let stats = r4.data.recordset;
        const RPs = stats[this.showStatisticsMonths + 1]; //Report periods for months and finyear
        //make the links
        for (let month in stats) {
          if (month == this.showStatisticsMonths + 1) break; //last array entry is RPs
          stats[month].Date += " to:/listpage/uploads/" + RPs[month];

          //force 0 to appear
          stats[month].Files = "" + stats[month].Files;
          stats[month].Ok = "" + stats[month].Ok;

          if (month == this.showStatisticsMonths) stats[month].Date += "/" + RPs[this.showStatisticsMonths - 1]; //finyear .. it's a range!
        }
        //add older and newer
        stats.push({ Date: "older ... msg:olderStatistics" });
        if (this.showStatisticsMonthsOffset > 0) stats.push({ Date: "newer ... msg:newerStatistics" });

        this.statistics = stats;
        // console.log("NHY666 displayStatistics complete");
      });
    },
    async makeCSVTable(id, table, skipCols = [], maxRows = 10) {
      try {
        const url = `${this.$dbUrl}/download/${table}`;
        const res = await axios.get(url, this.config);
        let headers = "";
        let csv = "";
        let rowNo = 0;
        let shortFname = table;
        for (let r in res.data.recordset) {
          let item = res.data.recordset[r];
          let row = "";
          for (let col in item) {
            if (skipCols.includes(col)) continue;
            if (rowNo == 0) {
              if (headers.length > 0) headers += ",";
              headers += col;
            }
            if (row.length > 0) row += ",";
            const s = item[col];
            if (s && typeof s == "string" && s.includes(",")) row += `"${s}"`;
            else row += s;
          }
          rowNo++;
          // csv += row + "," + shortFname + "\n";
          csv += row + "\n";
          if (rowNo > maxRows) break;
        }
        csv = headers + "\n" + csv;
        const blob = new Blob([csv], { type: "application/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        let configFnam = shortFname + "_export.csv";
        link.download = configFnam;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (e) {
        console.log("NGT538", e);
      }
    },
  },
  mounted() {
    this.$bus.emit("userUpdated", "-");
    this.$bus.off("olderStatistics");
    this.$bus.on("olderStatistics", (data) => {
      // console.log("MFU293 older", data);
      this.showStatisticsMonthsOffset += 6;
      this.displayStatistics();
    });
    this.$bus.off("newerStatistics");
    this.$bus.on("newerStatistics", (data) => {
      // console.log("MFU293 newer", data);
      this.showStatisticsMonthsOffset -= 6;
      if (this.showStatisticsMonthsOffset < 0) this.showStatisticsMonthsOffset = 0;
      this.displayStatistics();
    });
  },
  unmounted() {
    this.$bus.off("newerStatistics");
    this.$bus.off("olderStatistics");
  },
};
</script>
<style>
.table-small {
  max-width: 100px;
}
</style>
