<template>
  <b-container class="pt-3" fluid>
    <b-row v-if="tableSelected == 'cron_errors'" class="ps-2 ms-2 pb-2">
      <b-col>
        <b-form-radio-group
          :options="readOptions"
          name="readOption"
          :value="readOption"
          label="Options: "
          @change="readOptionsClick" />
      </b-col>
      <b-col>&nbsp;&nbsp;&nbsp;&nbsp;<b-btn @click="markRead('*')" class="btn btn-default">mark all read</b-btn></b-col>
    </b-row>
    <b-row class="ps-2 ms-2 me-2">
      <b-col>
        <b-table v-if="items && items.length > 0" :items="items" :fields="fields" bordered hover striped>
          <template #id="data"><b-btn class="btn btn-default" @click="markRead(data.value)">mark read</b-btn> </template>
          <template #read="data"
            ><b-icon v-if="data.value == 'y'" class="icongreen" icon="check-square-fill" /><b-icon
              v-else
              class="iconred"
              icon="x-circle" />
          </template>
          <template #createdAt="data">
            {{ data.value ? $date(data.value, "D/M/YYYY") : "-" }}
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="1">&nbsp;</b-col>
      <b-col sm="*" class="pt-5">
        <b>{{ msg }}</b>
      </b-col>
    </b-row>
    <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";
import bBtn from "../components/bBtn.vue";

export default {
  components: { bBtn },
  data() {
    return {
      table: "cron_errors",
      msg: null,
      roles: localStorage.roles ? localStorage.roles.split(",") : [],
      readOption: "unread",
      readOptions: ["unread", "read", "all (top 100)"],

      isAdmin: false,
      isAggregator: false,
      isOperator: false,
      items: [],
      fields: null,
      tableSelected: "cron_errors",
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },

  async created() {
    this.loadTable();
  },
  methods: {
    async loadTable() {
      this.isAdmin = this.roles.includes("admin");
      this.isOperator = this.roles.includes("operator");
      this.msg = null;
      this.items = [];

      const url = `${this.$dbUrl}/${this.table}/${this.readOption}`;
      // console.log("NGT444 loadTable", this.table, this.name, url);
      // this.msg = url;

      try {
        const res = await axios.get(url, this.config);
        if (res.data.status != "Ok") {
          this.msg = res.data.status + " " + res.data.err;
          return;
        }
        if (res.data && res.data.recordset && res.data.recordset.length > 0) this.items = res.data.recordset;
        else this.msg = "No items";
      } catch (e) {
        console.log("MSU392", e);
        this.msg = e;
      }

      this.$bus.emit("titleUpdated", "List " + this.table.replaceAll("_", " ") + " (" + this.readOption + ")");
    },
    async readOptionsClick(event) {
      event.preventDefault();
      this.readOption = this.$getRadioSelected("readOption");

      this.items = [];
      await this.loadTable();
    },
    async markRead(id) {
      const url = `${this.$dbUrl}/${this.table}/markRead/${id}`;
      const res = await axios.get(url, this.config);

      const cronResult = await axios.get(this.$dbUrl + "/cron_errors/unread/1", this.config);

      let c = "n";
      if (cronResult.data.status == "Ok" && cronResult.data.recordset.length > 0) c = "y";
      this.$bus.emit("cronErrors", c);

      await this.loadTable();
    },
  },
};
</script>
