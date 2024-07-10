<template>
  <b-container class="mx-5" fluid>
    <b-row class="pt-1 pb-3">
      <b-col sm="12">
        <h2>{{ title }}</h2>
      </b-col>
      <b-col sm="0" />
    </b-row>

    <b-row>
      <b-col sm="2"> Period :</b-col>
      <b-col>
        <b-form-select
          id="period"
          size="lg"
          :options="periods"
          @change="onChange"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="2">Table : </b-col>
      <b-col>
        <b-form-select
          id="table"
          size="lg"
          :options="logTables"
          @change="onChange"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="2" />
      <b-col sm="2">
        <button
          @click="display"
          :disabled="period == null || table == null"
          class="btn btn-default"
        >
          Display
        </button>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12">
        <b-table
          v-if="items && items.length > 0"
          :items="items"
          bordered
          hover
          striped
        />
      </b-col>
    </b-row>
    <b-row v-if="items.length > 0"
      ><b-col class="pb-5"
        ><button @click="prev" :disabled="start <= 0" class="btn btn-default">
          prev</button
        >{{ range }}</b-col
      >
      <b-col class="pb-5">
        <button
          @click="next"
          :disabled="recCount < maxLines"
          class="btn btn-default"
        >
          next
        </button>
      </b-col>
    </b-row>
    <b-row v-else-if="loaded" class="pt-3"
      ><b-col sm="2" /><b-col sm="1">No entries</b-col></b-row
    >
    <b-row
      ><b-col class="pb-5">{{ msg }}</b-col></b-row
    >
    <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";

export default {
  data() {
    return {
      title: "List Log Data",
      FI_ID: "*",
      startDate: new Date("2022-02-01"),
      endDate: new Date("2022-02-28"),
      period: "",
      periods: [],
      logTables: [],
      table: "FI_Details_log",
      items: [],
      start: 0,
      maxLines: 10,
      range: "",
      recCount: 0,
      displaying: false,
      loading: false,
      loaded:false,
      message: "",
      msg: "",
      prevMsg: "",

      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  async created() {
    this.$bus.emit("titleUpdated", "List Log Data");

    let fullYear = new Date().getFullYear();
    let year = fullYear - 2004; //I think we are safe with this for a while
    const thisYear = fullYear - 2001;
    // eslint-disable-next-line no-unused-vars
    let thisPeriod = null;
    this.periods = [];
    for (let y = year; y < year + 10; y++) {
      const s = "JUL" + y + " - " + "JUN" + (y + 1);
      if (y == thisYear) thisPeriod = s;
      this.periods.push(s);
    }
    this.period = thisPeriod;

    let url = this.$dbUrl + "/listLogTables/";
    const res = await axios.get(url, this.config);
    this.logTables = [];
    for (let row of res.data.recordset) this.logTables.push(row.TABLE_NAME);
  },
  methods: {
    formatDate(d) {
      if (typeof d == "string") return d;

      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [year, month, day].join("-");
    },
    async display() {
      this.title = this.table + "  " + this.period;
      this.start = 0;
      await this.show();
    },
    async show() {
      this.loaded=true;
      const url =
        this.$dbUrl +
        "/listLogTable/" +
        this.table +
        "/" +
        this.period +
        "/" +
        this.start +
        "/" +
        this.maxLines;
        this.items=[]
      const res = await axios.get(url, this.config);
      this.items = res.data.recordset;
      this.recCount = res.data.recordset.length;
      this.range =
        "  Entries " + (this.start + 1) + " - " + (this.start + this.recCount);
    },
    async next() {
      this.start += this.maxLines;
      await this.show();
    },
    async prev() {
      this.start -= this.maxLines;
      if (this.start < 0) this.start = 0;
      await this.show();
    },
    onChange() {
      // console.log("LIJ777", this.period, this.$getInputValue("period"))
      this.period = this.$getInputValue("period");
      // console.log("msy442", this.table, this.$getInputValue("table") )
      this.table = this.$getInputValue("table");
      // console.log("msy443", this.table, this.$getInputValue("table") )
    },

  },
};
</script>
