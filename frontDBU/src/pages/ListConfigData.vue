<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-table v-if="tabData && tabData.length > 0" :items="tabData" bordered hover striped>
          <template #Data="data"
            ><b-link :to="items[data.value]">{{ data.value.replace(/_/g, " ") }} </b-link></template
          >
          <template #more="data">
            <button v-if="data.value" @click="getMore(data.value)" size="sm" class="btn btn-default">more</button>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col> &nbsp; </b-col>
    </b-row>
    <b-row>
      <b-col> &nbsp; </b-col>
    </b-row>
    <dialog @click="hideModal" id="popUpBox1">
      <h3>{{ fnam }}</h3>
      <p id="popUpTxt" />
    </dialog>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      //removed items appear in the default List Reference Data
      items: {
        Recent_Audit_Entries: "/listPage/Audit",
        Recent_Logins: "/listPage/Logins",
        Table_Details: "/lookuplist/tbl005_TableDetails/Table Details",
      },
      desc: {
        Login_Sources: "Login sources",
        Recent_Audit_Entries: "List of audit entries",
        Uploads: "Recently uploaded files",
        Table_Details: "TableDetails/ReportDetails translation table",
      },
      more: {
        Recent_Audit_Entries:
          "Operations audited include user file uploads, " +
          "MasterList upload/download, configuration file edits and other significant events",
        SubGroups:
          "The SubGroups table lists all valid mappings of <b>SubGroup</b> to 'Data Provided'.<br>" +
          "Each user login has an associated 3 letter SubGroup (eg CS2) which forms part of the login <i>Group</i>. <br>" +
          "The subGroup (also mnemonic and role) is extracted using config data from config.json.<br> " +
          "If <i>Group</i> contains:<ul>" +
          "<li>???PSMSOP.Member***.Primary - the <b>subGroup</b> is ???, the <b>mnemonic</b> ***, and the <b>role</b> is 'user'</li>" +
          "<li>CS1PSMSOP.MemberBBL.Primary - the <b>subGroup</b> is CS1, the <b>mnemonic</b> BBL, and the <b>role</b> is 'user'</li>" +
          "</ul>Non user logins<ul>" +
          "<li>PSMSOP.Operational Owner - the <b>role</b> is 'operator', <b>subGroup</b> defaults to APN.</li>" +
          "<li>PSMSOP.Business Owner -  the <b>role</b> is 'admin', <b>subGroup</b> defaults to APN</li>" +
          "</ul>",
        Table_Details:
          "This table translates from Group in the incoming spreadsheet " +
          "to ReportDetails_ID (eg RD_022) and TableDetails_ID (eg TD_033)",
        Uploads:
          "Holds Uploads data - this includes details on the upload, " +
          "date, user, FI, accepted (y/n), and also the actual file uploaded",
      },
      fnam: "-",
      moreInfo: null,
      tabData: [],
    };
  },
  created() {
    this.$bus.emit("titleUpdated", "Operational Data");
    for (let item in this.items) {
      this.tabData.push({
        Data: item,
        Desc: this.desc[item],
        more: this.more[item] ? item : null,
      });
    }
  },
  methods: {
    showModal() {
      document.getElementById("popUpBox1").showModal();
    },
    hideModal() {
      document.getElementById("popUpBox1").close();
    },
    getMore(id) {
      this.fnam = id.replace(/_/g, " ");
      let popUpTxt = document.getElementById("popUpTxt");
      popUpTxt.innerHTML = this.more[id];
      this.showModal();
    },
  },
};
</script>
