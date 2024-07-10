<template>
  <div class="p-3">
    <table>
      <tr>
        <td><h2 :title="msg" class="spinny">Logged out</h2></td>
      </tr>
      <tr>
        <td>
          {{ msg }}
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      msg: "Session expired. Please login again",
    };
  },
  created() {
    localStorage.environment = null;
    localStorage.isAuthenticated = false;
    localStorage.user_ID = "";
    localStorage.roles = [];
    localStorage.jwtToken = null;

    this.msg = "";

    const reason = this.$route.query.reason;
    if (reason) {
      if (reason.includes("timeout")) this.msg = "Your Session has expired.";
      else if (reason.includes("token problem")) this.msg = "Token problem - check with admin";
      else if (reason.includes("login failed")) this.msg = "";

      else this.msg = reason;
    }

    //force top bar update
    this.$bus.emit("userUpdated", "logout");
    this.$bus.emit("titleUpdated", "Logged Out");
  },
  methods: {
    closeTab() {
      if (confirm("Close PSMS?")) window.close();
    },
    showMenu(id) {
      this.clearMenus();
      let menu = document.getElementById(id);
      menu.style.top = this.mouseY + "px";
      menu.style.left = this.mouseX + "px";
      menu.style.display = "block";
    },
    clearMenus() {
      for (let menu of document.getElementsByName("menuZ")) {
        menu.style.display = "none";
      }
    },
  },
};
</script>
