<template>
  <b-container fluid class="pt-3">
    <b-row v-if="showOptions">
      <b-col sm="6">
        <b-form-radio-group name="options" @change="optionChange" :options="options" :value="option" />
      </b-col>
      <b-col sm="6">
        <select v-if="showFIs" v-model="FI_ID" title="FI" class="size30" @change="FI_changed">
          <option v-for="optionL in listFIs" :value="optionL.value" :key="optionL">
            {{ optionL.text }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="6">
        <apexchart @click="chartClick" :options="chartOptions" :series="series" type="bar" width="100%" />
      </b-col>
      <b-col sm="3">
        <apexchart v-if="showPie" @click="pieClick" :options="chartOptionsPie" :series="seriesPie" type="pie" width="100%" />
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="1"></b-col><b-col sm="1">
      <span class="link" @click="changeOffset(6)">older ...</span></b-col>
      <b-col><span v-if="offsetMonths > 0" class="link" @click="changeOffset(-6)">newer ...</span></b-col>
    </b-row>
    <b-row sm="1" v-if="msg && msg.length > 0" class="pt-3">
      <b-col>
        <h4>{{ msg }}</h4>
      </b-col>
    </b-row>
    <b-row v-if="dateID">
      <b-col sm="12">
        <ListPage
          :pFI_ID="FI_ID"
          :pOption="category"
          :pReportPeriod_ID="dateID"
          :pUser="pUser"
          pTable="uploads"
          pDisplayOption="noBack noFilter"
          zpPaging="y"
          zpTitle="n" />
      </b-col>
    </b-row>
    <b-row><b-col>&nbsp;</b-col></b-row>
    <b-row><b-col>&nbsp;</b-col></b-row>
  </b-container>
</template>
<script>
import axios from "axios";
import ListPage from "../pages/ListPage.vue";

function getYearMonth(rp_ID) {
  const n = rp_ID.substring(3, 6);
  const m = (n - 1) % 12; //java month 0=jan
  const y = Math.floor((n - 1) / 12) + 2012;
  return { year: y, unixMonth: m, month: m + 1 };
}

function getReportPeriod_ID() {
  const dd = new Date();
  const fy = dd.getFullYear();
  const m = dd.getMonth();
  const id = "000" + ((fy - 2012) * 12 + (m - 1) + 2);
  const idCode = id.substring(id.length - 3);
  //console.log("DDD523", dd, fy, m, "=> RP_"+idCode);
  return "RP_" + idCode;
}

export default {
  components: {
    ListPage,
  },
  data() {
    return {
      roles: localStorage.roles,
      param: null,
      isAdmin: false,
      isOperator: false,
      offsetMonths: 0,
      items: [],
      msg: null,
      listFIs: [],
      FI_ID: "*",
      url: null,
      option: null,
      pUser: "*",
      options: [],
      adminOptions: [
        "User",
        "All",
        "Members",
        "APN",
        "Aggregated",
        "Combined",
        // "FI",
      ],
      userOptions: ["User", "FI"],
      showChart: true,
      showOptions: false,
      showPie: false,
      chartTitle: "Uploads by Month",
      originalChartOptions: {
        chart: {
          id: "uploadChart",
          dropShadow: { enabled: true },
        },
        xaxis: {
          categories: [],
        },
        dataLabels: { enabled: false },
        stroke: {
          width: [5, 7, 5],
          curve: "straight",
          dashArray: [0, 0, 0, 0, 0, 5],
        },
        legend: { position: "left" },
        tooltip: {
          enabled: true,
          fixed: { enabled: "true", position: "topRight" },
        },
      },
      originalChartOptionsPie: {
        chart: {
          id: "uploadChartPie",
          dropShadow: { enabled: true },
        },
        xaxis: {
          categories: ["uploaded", "rejected", "deleted", "overwritten", "deleted", "commented"],
        },
        dataLabels: { enabled: true },
        legend: { position: "left" },
      },
      chartOptions: {},
      chartOptionsPie: {
        labels: ["uploaded", "rejected", "deleted", "overwritten"],
      },
      series: [
        {
          name: "files imported",
          data: [],
        },
      ],
      seriesPie: [],
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
      di: -1,
      dateID: null,
      category: null,
    };
  },
  async created() {
    //param can be "user" or an FI_ID
    this.param = this.$route.params.param;
    if (this.param) {
      if (this.param == "User") {
        this.option = "User";
        this.FI_ID = "*";
      } else {
        this.option = "FI";
        this.FI_ID = this.param;
      }
    }

    this.listFIs = [];
    this.FI_lookup = [];

    this.isAdmin = this.roles.includes("admin");
    this.isOperator = this.roles.includes("operator");
    //what options do we show?
    if (this.isOperator) {
      this.options = this.adminOptions;
      if (!this.FI_ID) this.FI_ID = "*";
      if (!this.option) this.option = "All";
      (this.options[0] = { text: localStorage.user_ID, value: "User" }), await this.loadFIs();
      this.showFIs = true;
    } else {
      //this.options = this.userOptions;
      //["User", "FI"]
      this.options = [
        { text: localStorage.user_ID, value: "User" },
        { text: localStorage.mnemonic, value: "FI" },
      ];
      this.option = "User";
      this.showFIs = false;
    }
    this.showOptions = true;

    await this.generateChart();
  },
  methods: {
    async generateChart() {
      this.msg = null;

      //should hide table
      this.dateID = null;
      this.category = null;
      this.pUser = "*";

      let title = "Uploads by Month";
      if (this.option == "User") {
        title += " (" + localStorage.user_ID + ")";
        this.pUser = localStorage.user_ID;
      } else if (this.option == "FI") {
        if (this.isOperator) title += " (" + this.FI_ID + ")";
        else title += " (FI)";
      } else title += " (" + this.option + ")";

      this.FI_items = [];
      this.showPie = false;

      this.$bus.emit("titleUpdated", title);

      if (this.showChart) {
        this.chartTitle = title;
        try {
          //make data
          let uploaded = [];
          let rejected = [];
          let deleted = [];
          let overwritten = [];
          let commented = [];
          let cats = [];
          let success = [];

          let url = this.$dbUrl + "/uploadStats/" + this.option;
          if (this.option == "User") url += "/" + localStorage.user_ID;
          else url += "/" + this.FI_ID;
          url += "/" + this.offsetMonths;

          this.url = url;

          let current_reportPeriod_ID = getReportPeriod_ID();
          //this.chartTitle = current_reportPeriod_ID;

          let response = await axios.get(url, this.config);
          if (response.data.recordset.length > 0) {
            let items = response.data.recordset;
            let start = items.length - 13;
            if (start < 0) start = 0;

            for (let i = start; i < items.length; i++) {
              const item = items[i];
              if (item.ReportPeriod_ID > current_reportPeriod_ID) break;

              const ym = getYearMonth(item.ReportPeriod_ID);
              //label at bottom
              cats.push(ym.month + "/" + ym.year); //+" "+item.ReportPeriod_ID);
              //actual data
              uploaded.push(item.uploaded);
              rejected.push(item.rejected);
              deleted.push(item.deleted);
              overwritten.push(item.overwritten);
              commented.push(item.commented);
              success.push(Math.ceil(100 - (100 * item.rejected) / (item.uploaded + item.rejected)));
            }
          }

          this.chartOptions = {
            ...this.originalChartOptions,
            xaxis: { categories: cats },
            yaxis: [
              { seriesName: "uploaded", show: true, opposite: false },
              { seriesName: "uploaded", show: false, opposite: false },
              { seriesName: "uploaded", show: false, opposite: false },
              { seriesName: "uploaded", show: false, opposite: false },
              { seriesName: "uploaded", show: false, opposite: false },
              { show: true, title: "Success Rate", opposite: true },
            ],
          };

          this.series = [
            { name: "uploaded", type: "column", data: uploaded },
            { name: "rejected", type: "column", data: rejected },
            { name: "deleted", type: "column", data: deleted },
            { name: "overwritten", type: "column", data: overwritten },
            { name: "commented", type: "column", data: commented },
            { name: "Success %", type: "line", data: success },
          ];
        } catch (e) {
          console.log("BHE392", e);
        }
      }
    },
    async changeOffset(change) {
      this.offsetMonths += change;
      if (this.offsetMonths < 0) this.offsetMonths = 0;
      //redisplay chart
      await this.generateChart();
    },
    async optionChange() {
      this.option = this.$getRadioSelected("options");
      if (this.isOperator) this.FI_ID = "*";
      else this.FI_ID = "user_FI_ID";

      await this.generateChart();
    },
    //only for operator/admin
    async FI_changed() {
      this.option = "FI";
      await this.generateChart();
    },
    async pieClick(event, chartContext, config) {
      const si = event.target.parentElement.getAttribute("data:realIndex");
      const monthDate = this.chartOptions.xaxis.categories[this.di];

      await this.makeList(si, monthDate);
    },
    async makeList(si, monthDate) {
      this.dateID = null;
      this.category = null;

      //only display list for FI
      if (this.isOperator) {
        //  if ((this.option == "FI" || this.option == "User") && this.isOperator) {
        //allow time for ListPage to update
        setTimeout(() => {
          this.displayList(si, monthDate);
        }, 100);
      }
    },
    async displayList(si, monthDate) {
      // console.log("MKL212", this.FI_ID, si, data_date);

      const bits = monthDate.split("/");
      // console.log("PIE628", bits);
      const y = 1 * bits[1];
      const m = 1 * bits[0];
      const id = "000" + ((y - 2012) * 12 + (m - 1) + 1);
      this.dateID = "RP_" + id.substring(id.length - 3);
      this.category = this.series[si].name;
      // console.log("BGT555", this.FI_ID, this.dateID, this.category);

      this.msg = "Uploads for " + this.FI_lookup[this.FI_ID] + " " + monthDate + " (" + this.category + ")";
    },
    async chartClick(event, chartContext, config) {
      try {
        this.showPie = false;

        const si = config.seriesIndex;
        const di = config.dataPointIndex;
        this.di = di;

        let u = this.series[0].data[di];
        let r = this.series[1].data[di];
        let d = this.series[2].data[di];
        let o = this.series[3].data[di];
        //console.log("CDF332", si, this.series[si].name, di, u, r, d, o);
        // console.log(
        //   "CDF332",
        //   this.FI_ID,
        //   si,
        //   //this.series[si].name,
        //   this.chartOptions.xaxis.categories[di]
        // );
        await this.makeList(si, this.chartOptions.xaxis.categories[di]);

        this.chartOptionsPie.title = {
          text: "Uploads " + this.chartOptions.xaxis.categories[di],
        };

        this.seriesPie = [u, r, d, o];

        this.showPie = true;
      } catch (e) {
        console.log("CGR333", e);
      }
    },
    async showOverwrittenBy(event, id) {
      event.preventDefault();
      if (id) {
        const url = this.$dbUrl + "/uploads/" + id;
        try {
          this.modalItems = [];
          let response = await axios.get(url, this.config);
          if (response.data.recordset.length > 0) {
            // console.log("FCH332", response.data.recordset[0]);
            this.modalFields = this.overwrittenByFileFields;
            this.modalItems = response.data.recordset;
            this.modalTitle = "Overwritten By";
            this.modalSubtitle = response.data.recordset[0].user_ID;
            this.modalMinorTitle = response.data.recordset[0].originalFilename;
            this.showModal();
          }
        } catch (e) {
          console.log("BHE392", e);
          // this.errors.push(e);
        }
      }
    },
    showModal() {
      document.getElementById("popUpBox1").showModal();
    },
    nullDate(d) {
      if (d) return this.$date(d, "D/M/YYYY h:mma");
      else return "";
    },
    getFIname(id) {
      for (let info of this.listFIs) if (info.value == id) return info.text;
      return "unknown";
    },
    getMY(rp_ID) {
      if (rp_ID == null || rp_ID.length == 0 || rp_ID.includes("-")) return "-";
      else return this.$baseMonths[getYearMonth(rp_ID).month] + "/" + (getYearMonth(rp_ID).year + "sss").substring(2, 4);
    },
    async loadFIs() {
      let result = await axios.get(this.$dbUrl + "/listFIs", this.config);
      this.listFIs.push({ text: "All FIs", value: "*" });
      for (let row of result.data.recordset) {
        this.listFIs.push({
          text: row.FI_Name,
          value: row.FI_ID,
        });
        this.FI_lookup[row.FI_ID] = row.FI_Name;
      }
      this.FI_lookup["*"] = "All";
    },
  },
};
</script>
