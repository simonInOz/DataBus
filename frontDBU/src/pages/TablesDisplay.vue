<template>
  <b-container class="mx-5" fluid>
    <b-row class="pt-1">
      <b-col sm="6">
        <h2>Table Definitions</h2>
      </b-col>
    </b-row>

    <b-row class="pt-1">
      <b-col sm="2">Table:</b-col>
      <b-col sm="2">
        <bSelect id="tableName" size="lg" :value="table" :options="tables" />
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="2">Column</b-col>
      <b-col sm="2">
        <b-input id="colName" :value="colName" />
      </b-col>
    </b-row>
    <b-row class="pt-2">
      <b-col sm="2">&nbsp;</b-col>
      <b-col sm="1">
        <b-btn id="go" class="btn btn-default" @click="show">Show</b-btn>
      </b-col>
    </b-row>

    <b-row class="pt-3">
      <b-col>
        <b-table
          v-if="items && items.length > 0"
          :items="items"
          :sortFields="['table', 'column', 'data_type']"
          bordered
          hover
          striped>
          <template #is_nullable="data">
            <b-icon v-if="data.value" class="icongreen" icon="check-square-fill" />
            <b-icon v-else class="iconred" icon="x-circle" />
          </template>
          <template #precision="data">
            <span v-if="data.value > '0'">{{ data.value }}</span>
            <span v-else>&nbsp;</span>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-row
      ><b-col class="pb-5">{{ msg }}</b-col></b-row
    >

    <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
  </b-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      msg: "",
      tables: [],
      items: [],
      table: "*",
      colName: "*",
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  async created() {
    this.$bus.emit("titleUpdated", "Table Definitions");
    const url = this.$dbUrl + "/listTables";
    const res = await axios.get(url, this.config);
    this.tables = [];
    this.tables.push("*");
    if (res.data.status == "Ok") {
      for (let row of res.data.recordset) {
        this.tables.push(row.TABLE_NAME);
      }
    }
  },
  methods: {
    async show() {
      let tableName = this.$getInputValue("tableName");
      let colName = this.$getInputValue("colName");
      if (colName.length == 0) colName = "*";

      let txt = tableName;
      if (colName != "*") txt += " " + colName;
      this.$bus.emit("titleUpdated", "Table Definitions (" + txt + ")");
      // this.msg = txt;

      const url = this.$dbUrl + "/listTableDefinitions/" + tableName + "/" + colName;
      // this.msg = url;

      this.items = [];
      const res = await axios.get(url, this.config);
      if (res.data.status == "Ok") {
        this.items = res.data.recordset;
      }
    },
  },
};
</script>
