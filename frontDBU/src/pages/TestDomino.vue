<template>
  <b-container fluid>
    <b-row>
      <b-col sm="1" />
      <b-col sm="3">
        <h2>Test Domino</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="1"></b-col>
      <b-col sm="3"><b-select id="idLoginSources" :options="Sources.idLoginSources"></b-select></b-col>
    </b-row>

    <b-row>
      <b-col sm="1"></b-col> <b-col sm="3"><b-btn class="btn btn-default" @click="testLogin">Test Login</b-btn></b-col>
    </b-row>

    <b-row><b-col>&nbsp;</b-col></b-row>
    <b-row>
      <b-col sm="1"></b-col>
      <b-col sm="3"><b-select id="idDataSources" :options="Sources.idDataSources"></b-select></b-col>
    </b-row>

    <b-row>
      <b-col sm="1"></b-col> <b-col sm="3"><b-btn class="btn btn-default" @click="testGet">Test Get Data</b-btn></b-col>
    </b-row>
    <b-row><b-col>&nbsp;</b-col></b-row>
    <b-row>
      <b-col sm="1"></b-col>
      <b-col sm="3"><b-select id="tableName" :options="Sources.TableNames"></b-select></b-col>
    </b-row>

    <b-row>
      <b-col sm="1"></b-col> <b-col sm="3"><b-btn class="btn btn-default" @click="testGetByName">Test Get Data (by table name)</b-btn></b-col>
    </b-row>

    <b-row>
      <b-col sm="1"></b-col>
      <b-col sm="3">
        <p>{{ msg }}</p>
      </b-col>
    </b-row>
    <b-row><b-col></b-col></b-row>
  </b-container>
</template>

<script>
import axios from "axios";
import bSelect from "../components/bSelect.vue";
import BBtn from "../components/bBtn.vue";

export default {
  components: { bSelect, BBtn },
  data() {
    return {
      msg: null,
      origin: null,
      count: 0,
      Sources: [],
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  async created() {
    let sel = "idLoginSources";
    let tableName = sel.substring(2);
    this.Sources[sel] = [];
    let resH = await axios.get(this.$dbUrl + "/" + tableName, this.config);
    for (let dp of resH.data.recordset) {
      this.Sources[sel].push({ text: dp.name, value: dp.id });
    }

    sel = "idDataSources";
    tableName = sel.substring(2);
    this.Sources[sel] = [];
    resH = await axios.get(this.$dbUrl + "/" + tableName, this.config);
    for (let dp of resH.data.recordset) {
      this.Sources[sel].push({ text: dp.name, value: dp.id });
    }

    sel = "TableNames";
    this.Sources[sel] = [];
    resH = await axios.get(this.$dbUrl + "/DataSources", this.config);
    for (let dp of resH.data.recordset) {
      this.Sources[sel].push({ text: dp.name, value: dp.name });
    }
  },
  methods: {
    async testLogin() {
      this.msg = "Logging in ...";
      let res = null;
      try {
        let url = this.$dbUrl + "/testLoginDomino/" + this.$getInputValue("idLoginSources");
        res = await axios.get(url, this.config);
        // console.log("QGN334 Login Post response", res);
        this.msg = res.statusText;
      } catch (err) {
        console.log("NDY384 err response", err);
        //if (err.response.status == 401)
        this.msg = "Error " + err;
        //else this.msg = err;
      }
    },
    async testGet() {
      this.msg = "Getting data ...";
      let res = null;
      try {
        let url = this.$dbUrl + "/testGetDomino/" + this.$getInputValue("idDataSources");
        res = await axios.get(url, this.config);
        console.log("asd334 getDomino response", res);
        this.msg = res.statusText+". Downloaded: "+res.data.rowsAffected+" rows";
      } catch (err) {
        console.log("NDY384 err response", err);
        //if (err.response.status == 401)
        this.msg = "Error " + err;
        //else this.msg = err;
      }
    },
    async testGetByName() {
      this.msg = "Getting data ...";
      let res = null;
      try {
        let url = this.$dbUrl + "/testGetDominoByName/" + this.$getInputValue("tableName");
        res = await axios.get(url, this.config);
        console.log("asd334 getDomino response", res);
        this.msg = res.statusText+". Downloaded: "+res.data.rowsAffected+" rows";
      } catch (err) {
        console.log("NDY384 err response", err);
        //if (err.response.status == 401)
        this.msg = "Error " + err;
        //else this.msg = err;
      }
    },
  },
};
</script>
