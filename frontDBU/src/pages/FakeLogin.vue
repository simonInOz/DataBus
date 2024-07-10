<template>
  <b-container fluid>
    <b-row>
      <b-col sm="1" />
      <b-col sm="*">
        <h2>Simulated Login</h2>
        <UserAuthForm buttonText="login" hasName="true" :submit-form="loginUser" />
        <p>{{ msg }}</p>
      </b-col></b-row
    ></b-container
  >
</template>

<script>
////import Vue from "vue";
import UserAuthForm from "../pages/UserAuthForm.vue";
import axios from "axios";

export default {
  components: {
    UserAuthForm,
  },
  data() {
    return {
      msg: null,
      origin: null,
      count: 0,
    };
  },
  created() {
    this.origin = this.$signinUrl;
    //kill the TopBar session expiry
    localStorage.expiryTime = 0;
  },
  methods: {
    async loginUser(logininfo) {
      let url = this.$signinUrl;
      if (location.toString().includes("localhost")) logininfo.password = "GreenUnicorn1990";

      this.msg = "Logging in ...";
      try {
        const res = await axios.post(url, {
          user_ID: logininfo.user_ID.toLowerCase(),
          email: logininfo.email,
          FI_ID: logininfo.FI_ID,
          SubGroup: logininfo.SubGroup,
          SubGroup1: logininfo.SubGroup1,
          FI: logininfo.FI,
          password: logininfo.password,
        });
        // console.log("LGN334 Login Post response", res);

        try {
          await this.$router.push({ name: "login", query: { token: res.data.jwt } });
        } catch (ee) {
          console.log("HSY394", ee);
          if (ee.message.includes("401")) this.msg = "FCD443 Bad token";
          else this.msg = ee;
        }
        // console.log("LKJ776 pushed jwt to login");
      } catch (err) {
        console.log("NDY384 err response", err);
        //if (err.response.status == 401)
        this.msg = "Login not recognised " + logininfo.user_ID + " [" + logininfo.password + "]";
        //else this.msg = err;
      }
    },
  },
};
</script>
