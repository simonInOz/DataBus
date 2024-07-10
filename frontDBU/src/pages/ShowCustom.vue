<template>
  <b-container>
    <b-row>
      <b-col class="pe-2"
        ><h3>{{ table }}</h3></b-col
      >
    </b-row>
    <b-row>
      <b-col class="pe-2">
        <b-table
          v-if="items && items.length > 0"
          :items="items"
          :fields="fields"
          :class="tableClass"
          bordered
          hover
          striped
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col class="pe-2">{{ msg }}</b-col>
    </b-row>
    <b-row>
      <b-col sm="1" class="ms-3">
        <button @click="back" class="btn btn-secondary">back</button>
      </b-col></b-row
    >
    <b-row><b-col>&nbsp;</b-col></b-row>
    <b-row><b-col>&nbsp;</b-col></b-row>
  </b-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      msg: null,
      table: null,
      items: [],
      tableClass: null,
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },

  async created() {
    this.$bus.emit("titleUpdated", "Custom Data");
    await this.loadCustomTable(this.$route.query.t, this.$route.query.i);
  },
  methods: {
    async loadCustomTable(table, uploads_ID) {
      this.table = table;
      //extracted custom data
      const url = this.$dbUrl + "/customData/" + table + "/" + uploads_ID;
      this.msg = "Loading ... " + url;
      try {
        const res = await axios.get(url, this.config);
        this.msg = null;
        this.items = [];
        const data = res.data.recordset[0];
        for (let item in data) {
          this.items.push({ Column: item, Value: data[item] });
        }
      } catch (err) {
        if (err.response && err.response.status && err.response.status == 401) {
          this.msg = "401 Login not recognised " + url;
          this.$router.push("/logout");
        } else this.msg = err;
      }
    },
    back(event) {
      event.preventDefault();
      this.$router.push(this.$router.options.history.state.back);
      //this.$router.back() //vue3
      // if (this.$routerHistory.hasPrevious()) //vue2
      //   this.$router.push(this.$routerHistory.previous().path);
    },
  },
};
</script>
