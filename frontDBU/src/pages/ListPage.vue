<template>
  <b-container fluid>
    <b-row class="ps-2 ms-2 me-2">
      <b-col sm="8">
        <p>
          <b>{{ msg }}</b>
        </p>
      </b-col>
    </b-row>
    <b-row class="ps-2 ms-2 me-2">
      <b-col sm="12" v-if="items.length > 0">
        <b-table
          v-if="items && items.length > 0"
          :items="items"
          :fields="fields"
          :sort-fields="sortFields"
          :sort-labels="sortLabels"
          class="tableWide"
          bordered
          hover
          striped>
          <template #id="data">
            <b-dropdown size="sm" variant="primary" class="dropsquare">
              <b-dropdown-item><b>Actions</b></b-dropdown-item>
              <b-dropdown-item>
                <a
                  href="#"
                  class="dropdown-item ddiZero"
                  @click="downloadUpload($event, data.item.id, data.item.tableName, false)"
                  >download {{ data.item.tableName }}
                </a>
              </b-dropdown-item>
            </b-dropdown>
          </template>

          <template #createdAt="data">
            {{ data.value ? $date(data.value, "D/M/YYYY h:mm:ssa") : "-" }}
          </template>
          <template #overwritten="data">
            {{ data.value ? $date(data.value, "D/M/YYYY h:mm:ssa") : "-" }}
          </template>
          <template #deleted="data">
            {{ data.value ? $date(data.value, "D/M/YYYY h:mm:ssa") : "-" }}
          </template>
        </b-table>
      </b-col>
      <b-col v-else
        ><p v-if="tableLoaded">No entries</p>
        <p v-else>Loading ...</p></b-col
      >
    </b-row>
    <b-row v-if="maxLines < 999 && tableLoaded && showButtons">
      <b-col sm="1" class="ms-3">
        <button v-if="!backBtnDisabled" @click="back" class="btn btn-secondary">back</button>
      </b-col>
      <b-col sm="1" v-if="!allShown">
        <button @click="onNewer" :disabled="newerBtnDisabled" class="btn btn-default">newer</button>
      </b-col>
      <b-col sm="1" v-if="!allShown">
        <button @click="onOlder" :disabled="olderBtnDisabled" class="btn btn-default">older</button>
      </b-col>
      <b-col sm="3"> &nbsp;&nbsp;Recent entries first ({{ start + 1 }} to {{ start + count }}) </b-col>
    </b-row>
    <b-row>
      <b-col> &nbsp; </b-col>
    </b-row>
    <b-row>
      <b-col> &nbsp; </b-col>
    </b-row>

    <dialog @click="hideModal" id="popUpBox1">
      <table width="100%">
        <tr class="smoke">
          <td>
            <h2>{{ modalTitle }}</h2>
          </td>
        </tr>
        <tr v-if="modalMinorTitle">
          <td colspan="2">{{ modalMinorTitle }}</td>
        </tr>
        <tr>
          <td colspan="2">{{ modalSubtitle }}</td>
        </tr>
      </table>
      <b-table v-if="modalItems && modalItems.length > 0" :items="modalItems" :fields="modalFields" hover striped>
        <template #created="data">
          {{ data.value ? $date(data.value, "D/M/YYYY h:mma") : "-" }}
        </template>
        <template #addr="addr">
          {{ addr.value == "null" || addr.value == "None" ? "-" : addr.value }}
        </template>
        <template #msg="data">
          <div :title="derive(data)">{{ data.value }}</div>
        </template>
        <template #error_level="data">
          <div :title="derive(data)">{{ data.value }}</div>
        </template>
        <template #createdAt="data">
          {{ data.value ? $date(data.value, "D/M/YYYY h:mma") : "-" }}
        </template>
      </b-table>
    </dialog>
  </b-container>
</template>

<script>
import axios from "axios";

export default {
  props: [
    "t",
    "i",
    "pTable",
    "pPeriod",
    "pFI_ID",
    "pOption",
    "pUser",
    "pDisplayOption",
    "pReportPeriod_ID",
    "pPaging",
    "pTitle",
    "showCount",
  ],
  data() {
    return {
      roles: localStorage.roles,
      isAdmin: false,
      isOperator: false,
      table: null,
      idCol: null,
      msg: null,
      zmsg: null,
      displayOption: "all",
      filterOption: "all",
      user: "*",
      hasOptions: true,
      options: [],
      sortFields: ["Date", "operation", "userName", "errMsg", "errCode"],
      sortLabels: ["Period"],
      start: 0,
      maxLines: 10,
      count: 0,
      allShown: false,
      newerBtnDisabled: true,
      olderBtnDisabled: true,
      backBtnDisabled: false,
      showButtons: true,
      items: [],
      fields: null,
      orderBy: null,
      showPrevPage: false,
      url: null,
      modalFields: null,

      ifFilter: true,
      filter: null,
      mnemonics: [
        { value: -1, text: "all" },
        { value: 321, text: "qqq" },
      ],
      paging: null,
      filterField: null,
      filterCol: null,
      filterInfos: {
        //columns that may be filtered by
        uploads: { col: "Data_Provided, FI_ID, user_Mnemonic, user_ID" },
        Audit: { col: "Operation, userName, email, errCode" },
        Logins: { col: "userName, operation" },
      },
      loading: true,
      //upload errors
      modalTitle: "",
      modalMinorTitle: null,
      modalSubtitle: null,
      modalItems: null,
      //modalFields: [{ key: "error_level", label: "Error" }, {key:"msg", label:"Message"}],
      uploadErrorFields: [{ key: "error_level", label: "Error" }, { key: "msg", label: "Message" }, "Suggestions"],
      currentPage: {},
      prevPage: {},
      sql: null,

      overwrittenByFileFields: ["id", "FI_ID", "user_FI_ID", "Data_Provided", "createdAt"],
      adminLookup: {
        uploads: {
          idCol: "id",
          maxLines: 10,
          title: "Uploads",
          orderBy: "id DESC",
          fields: [
            { label: "Action", key: "id" },
            { label: "Table", key: "tableName", tdClass: "centre", sortable: true },
            { label: "Run By", key: "runBy", sortable: true },
            { label: "Loaded", key: "createdAt", sortable: true },
            { label: "Over Written", key: "overwritten", tdClass: "centre" },
            { label: "Over Written By", key: "overwrittenBy", tdClass: "centre" },
            { label: "Deleted", key: "deleted", tdClass: "centre" },
          ],
        },
      },

      lookup: {
        uploads: {
          idCol: "id",
          maxLines: 10,
          title: "Uploads",
          orderBy: "id DESC",
          fields: [
            { label: "Action", key: "id", tdClass: "centre" },
            "user_ID",
            // { label: "Ref Name", key: "refName" },
            { label: "Filename", key: "originalFilename" },
            { label: "Period", key: "ReportPeriod_ID" },
            //"Framework",
            //{ key: "Form", sortable: true },
            { key: "Data_Provided", sortable: true },
            { label: "Uploaded", key: "createdAt" },
            { key: "approved", tdClass: "centre" },
            { key: "overwritten", tdClass: "centre" },
            { key: "deleted", tdClass: "centre" },
          ],
        },
        Logins: {
          idCol: "none",
          maxLines: 30,
          title: "Recent Logins",
          orderBy: "id DESC",
          fields: [
            "Date",
            "operation",
            "userName",
            "ip",
            "groups",
            "errCode",
            "errMsg",
            { key: "userAgent", tdClass: "squeezeWider" },
          ],
        },
        Audit: {
          idCol: "none",
          maxLines: 30,
          title: "Recent Audit entries",
          orderBy: "id DESC",
          fields: [
            "Date",
            { key: "operation", tdClass: "squeezeWide" },
            { key: "userName", sortable: true },
            "groups",
            { key: "errCode", sortable: true },
            { key: "errMsg", tdClass: "squeezeWide" },
          ],
        },
      },
      tableLoaded: false,
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
      blobConfig: {
        responseType: "arraybuffer",
        headers: {
          "x-access-token": localStorage.jwtToken,
          "content-type": "blob",
        },
      },
    };
  },
  watch: { $route: "init" }, //this forces reload if route changes. If multiple calls made with different tables

  async created() {
    //display the right options!
    this.options = this.memberOptions;

    await this.loadTable();
  },
  methods: {
    formatNumber(num) {
      return num.toLocaleString();
    },
    getYearMonth(rp_ID) {
      const n = rp_ID.substring(3, 6);
      const m = (n - 1) % 12; //java month 0=jan
      const y = Math.floor((n - 1) / 12) + 2012;
      return { year: y, unixMonth: m, month: m + 1 };
    },
    async init() {
      this.filter = null;
      this.filterField = null;
      await this.loadTable();
    },
    async reloadTable(table = null) {
      await this.loadTable(table);
    },
    async loadTable(table = null) {
      this.items = [];
      this.tableLoaded = false;
      this.loading = true;

      this.displayOption = "all";
      if (this.$route.params.displayOption) this.displayOption = this.$route.params.displayOption;
      if (this.pDisplayOption) this.displayOption = this.pDisplayOption;
      if (this.displayOption.includes("all")) this.showButtons = false;
      if (this.displayOption.includes("noBack")) this.backBtnDisabled = true;
      if (this.displayOption.includes("noFilter")) this.filterDisabled = true;

      if (this.$route.params.period) this.period = this.$route.params.period;
      if (this.pPeriod) this.period = this.pPeriod;

      if (this.pPaging) this.paging = this.pPaging;

      if (this.pOption) this.option = this.pOption;
      if (this.pUser) this.user = this.pUser;

      if (this.$route.params.filterOption) this.filterOption = this.$route.params.filterOption;
      if (this.pOption) this.filterOption = this.pOption;

      if (table) this.table = table;
      else this.table = this.$route.params.table;
      if (this.pTable) this.table = this.pTable;

      this.isAdmin = this.roles.includes("admin");
      this.isOperator = this.roles.includes("operator");

      let filterFi = null;
      if (this.ifFilterFI && this.filterFI) filterFi = this.filterFI;

      let info = null;
      if (this.isAdmin || this.isOperator) info = this.adminLookup[this.table];
      if (info == null) info = this.lookup[this.table];

      //filterable?
      let filterInfo = this.filterInfos[this.table];

      if (filterInfo) {
        this.ifFilter = true;
        this.filterCol = filterInfo.col;
      } else this.ifFilter = false;

      if (info) {
        this.idCol = info.idCol;
        this.maxLines = info.maxLines;
        this.title = info.title;
        this.fields = info.fields;
        this.orderBy = info.orderBy;
      } else {
        this.idCol = "none";
        this.maxLines = 30;
        this.title = this.table;
        this.fields = null;
        this.orderBy = "id";
      }

      if (this.pTitle != "n") {
        let title = this.title;
        if (this.isOperator) title += " [All] ";
        if (this.FI_Name) title += " " + this.FI_Name;
        if (this.filterField) title += " (" + this.filterField + ")";
        this.$bus.emit("titleUpdated", title);
      }

      if (this.start <= 0) {
        this.start = 0;
        this.newerBtnDisabled = true;
      } else this.newerBtnDisabled = false;

      let url = this.$dbUrl + "/page/" + this.table + "/";
      this.zmsg = url;

      if (this.table == "uploads") {
        if (this.roles.includes("operator")) {
          url += "none";
        } else {
          url += this.selected;
        }
      } else url += this.idCol;

      if (this.filterOption) url = this.addUrl(url, "fo", this.filterOption);
      if (this.paging) url = this.addUrl(url, "paging", this.paging);

      if (this.ifFilter && this.filterField) {
        url = this.addUrl(url, "s", this.filterField);
        url = this.addUrl(url, "c", this.filterCol);
      }

      //only uploads and aggregated
      if (filterFi) url = this.addUrl("f", filterFi);

      this.url = url;
      this.zmsg = url;
      console.log("NHY666 url", url);

      try {
        this.items = [];
        const res = await axios.get(url, this.config);
        // console.log("NHT666", res);
        if (res.data.status == "Ok") {
          this.items = res.data.recordset;
          this.sql = res.data.sql;

          if (this.items.length <= this.maxLines) {
            //disable NEXT
            this.olderBtnDisabled = true;
          } else {
            //enable NEXT
            this.olderBtnDisabled = false;
            //remove last entry
            this.items.pop();
          }

          //have we displayed everything?
          this.allShown = this.olderBtnDisabled && this.newerBtnDisabled;

          //how tacky is this? It's returning bit as boolean and confusing table handling
          if (this.table == "uploads") {
            for (let item of this.items) {
              if (item.approved) item.approved = "1";
              else item.approved = "0";

              // if (item.deleted == null) item.deleted = "NULL";
              // if (item.overwritten == null) item.overwritten = "NULL";
            }
          }

          this.count = this.items.length;
          this.tableLoaded = true;

          if (this.showCount == "y") this.msg = this.count + " entries";
          else this.msg = null;
        } else {
          //error
          this.msg = res.data.status + " " + res.data.err;
          this.tableLoaded = true;
        }
      } catch (err) {
        this.tableLoaded = false;
        if (err.response.status == 401) {
          this.msg = "401 Login not recognised " + url;
          this.$router.push("/logout");
        } else this.msg = err;
      }
      if (this.displayOption == "all") this.showButtons = true;
      this.loading = false;
    },
    addUrl(url, param, val) {
      if (url.indexOf("?") > -1) return url + "&" + param + "=" + val;
      else return url + "?" + param + "=" + val;
    },
    async showData(event, uploads_ID, refFileId) {
      event.preventDefault();
      this.uploads_ID = uploads_ID;
      const url = this.$dbUrl + "/referenceFiles/" + refFileId;
      try {
        let response = await axios.get(url, this.config);
        if (response.data.recordset.length > 0) {
          const tableName = response.data.recordset[0].tableName;
          if (tableName == "default") {
            await this.loadTable("extracted_data");
          } else {
            await this.loadCustomTable(tableName);
          }
        }
      } catch (err) {
        this.msg = err;
      }
    },
    async downloadUpload(event, uploadId, fnam) {
      event.preventDefault();
      try {
        this.msg = "";

        const url = this.$dbUrl + "/downloadUpload/" + uploadId;
        const res = await axios.get(url, this.blobConfig);

        const blob = new Blob([res.data], { type: "application/vnd.ms-excel" });

        var fileURL = window.URL.createObjectURL(blob);
        var fileLink = document.createElement("a");

        fileLink.href = fileURL;
        fileLink.setAttribute("download", fnam);
        fileLink.setAttribute("processData", false);
        document.body.appendChild(fileLink);

        fileLink.click();
      } catch (e) {
        console.log("JYH654", e);
        this.msg = "downloadUpload error " + e;
      }
    },
    async onOlder() {
      this.start += this.maxLines;
      await this.loadTable();
    },
    async onNewer() {
      this.start -= this.maxLines;
      await this.loadTable();
    },
    async onFilter() {
      let filter = document.getElementById("filter").value; //vue3
      this.filterField = filter;
      this.start = 0;
      await this.loadTable();
    },
    async showUploadErrors(event, id) {
      event.preventDefault();
      const url = this.$dbUrl + "/uploadErrors/" + id + "/5";
      try {
        this.modalItems = [];
        let response = await axios.get(url, this.config);
        // console.log("MMN638", response)
        if (response.data.length > 0) {
          this.modalFields = this.uploadErrorFields;
          this.modalItems = response.data;
          this.modalTitle = "Upload Errors";
          this.modalMinorTitle = null;
          this.modalSubtitle = response.data[0].originalFilename;
          //this.$refs["errors-modal"].show();
          this.showModal();
        }
      } catch (e) {
        console.log("FRYT665 error", e);
        // this.errors.push(e);
      }
    },
    async showRefFileDetails(event, id, fn) {
      event.preventDefault();

      const url = this.$dbUrl + "/referenceFiles/" + id;
      try {
        this.modalItems = [];
        let response = await axios.get(url, this.config);
        if (response.data.recordset.length > 0) {
          this.modalFields = this.refFileFields;
          this.modalItems = response.data.recordset;
          this.modalTitle = "Reference File Details";
          this.modalSubtitle = "Uploaded: " + fn;
          this.modalMinorTitle = response.data.recordset[0].originalFname;
          this.showModal();
        } else {
          this.modalFields = null;
          this.modalItems = null;
          this.modalTitle = "Reference File Details";
          this.modalSubtitle = "Uploaded: " + fn;
          this.modalMinorTitle = "Reference file details not available";
          this.showModal();
        }
      } catch (e) {
        console.log("6 error", e);
        // this.errors.push(e);
      }
    },
    async showFIs(event, id, fn) {
      event.preventDefault();
      const url = this.$dbUrl + "/uploadFIs/" + id;
      try {
        this.modalItems = [];
        let response = await axios.get(url, this.config);
        if (response.data.recordset.length > 0) {
          this.modalFields = this.uploadFIsFields;
          this.modalItems = response.data.recordset;
          this.modalTitle = "Upload FI Details";
          this.modalSubtitle = "Uploaded: " + fn;
          this.modalMinorTitle = response.data.recordset[0].originalFname;
          this.showModal();
        } else {
          this.modalFields = null;
          this.modalItems = null;
          this.modalTitle = "Upload FI Details";
          this.modalSubtitle = "Uploaded: " + fn;
          this.modalMinorTitle = "Details not available";
          this.showModal();
        }
      } catch (e) {
        console.log("FRYT667 error", e);
        // this.errors.push(e);
      }
    },
    async deleteData(event, uploads_ID, user_ID, originalFilename, refFileId) {
      event.preventDefault();
      if (confirm("Confirm delete upload data file [" + originalFilename + "] from " + user_ID + " "))
        await this.deleteDataNow(uploads_ID, refFileId);
    },
    async deleteDataNow(uploads_ID, refFileId) {
      try {
        const url = `${this.$dbUrl}/removeExtractedData/${uploads_ID}/${refFileId}`;
        this.msg = "Deleting ...";
        await axios.get(url, this.config);
        this.msg = null;
        //force page reload
        await this.loadTable();
      } catch (e) {
        this.msg = "LookupList deleteData " + e;
      }
    },
    async showOverwrittenBy(event, id) {
      event.preventDefault();
      if (id) {
        const url = this.$dbUrl + "/uploadsShort/" + id;
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
    hideModal() {
      document.getElementById("popUpBox1").close();
    },
    derive(data) {
      const msg = data.item.msg;
      const level = data.item.error_level;

      if (msg.includes("variance")) return "Please provide reason for variance in the comment field and upload again";
      if (msg.includes("already")) return "Please check Overwrite existing data box and upload again";
      if (level.includes("SYSTEM")) return "Please contact AusPayNet Operations";
      return "";
    },
    async back(event) {
      event.preventDefault();
      if (this.showingExtractedData) await this.loadTable();
      else {
        if (this.$router.options.history.state.current == this.$router.options.history.state.back) this.$router.push("/home");
        else this.$router.replace(this.$router.options.history.state.back);
      }
    },
    spread(s) {
      if (s == null) return "XXX";
      const nbsp = "\u00A0";
      return nbsp + s.replaceAll(" ", nbsp);
    },
    nothing(event) {
      event.preventDefault();
    },
  },
};
</script>
