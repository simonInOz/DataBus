<template>
  <div class="p-3" id="grad">
    <h2>About DataBus</h2>
    <b-table v-if="items && items.length > 0" :items="items" hover striped />
    <p>Roles: {{ roles }}</p>
    <p>User Name: {{ name }}</p>
    <p>Vue: {{ vueVersion }}</p>
    <hr />
    <h3>Errors</h3>
    <b-table v-if="errors && errors.length > 0" :items="errors" hover striped />
    <hr />

    <h3>Packages</h3>
    <b-table v-if="packages && packages.length > 0" striped hover :items="packages" />

    <p>{{ msg }}</p>
    <a :href="$cradle + '?L=' + name + '&H=AusPayNet DataBus'">more</a>
    <p>&nbsp;</p>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";
//import Vue from "vue";

export default {
  data() {
    return {
      items: [],
      packages: [],
      errors: [],
      userAgent: null,
      expiry: null,
      expiryTime: null,
      now: null,
      nowTime: null,
      expired: null,
      roles: null,
      msg: null,
      name: localStorage.user_ID,
      vueVersion: "??",
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  async created() {
    try {
      this.$bus.emit("titleUpdated", "About DataBus");

      let url = this.$fileUrl + "/about";
      try {
        const res = await axios.get(url, this.config);
        this.items = [res.data];
      } catch (e) {
        this.msg = e;
        return;
      }
      this.userAgent = navigator.userAgent;
      this.roles = localStorage.roles;
      this.vueVersion = this.$version;
      this.msg = "Read info";

      url = this.$fileUrl + "/packages";
      try {
        this.packages = [];
        const res2 = await axios.get(url, this.config);
        this.packages = res2.data;
      } catch (e) {
        this.msg = e;
        return;
      }
      this.msg = "Read packages";

      url = this.$dbUrl + "/poolErrors";
      try {
        const res3 = await axios.get(url, this.config);
        this.errors = res3.data;
      } catch (e) {
        this.msg = e;
        return;
      }
      this.msg = null;
    } catch (e) {
      this.msg = e;
    }
  },
};
</script>
