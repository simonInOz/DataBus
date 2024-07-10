<template>
  <b-container class="pt-3" fluid>
    <b-row class="ps-2 ms-2 me-2">
      <b-col>
        <b-table
          v-if="items && items.length > 0"
          :items="items"
          :fields="fields"
          :sort-fields="sortFields"
          :sort-labels="sortLabels"
          bordered
          hover
          striped>
          <template #Active="data">
            <b-icon v-if="data.value == 'Yes'" class="icongreen" icon="check-square-fill" />
            <b-icon v-else class="iconred" icon="x-circle" />
          </template>
          <template #active="data">
            <b-icon v-if="data.value == 'Yes'" class="icongreen" icon="check-square-fill" />
            <b-icon v-else class="iconred" icon="x-circle" />
          </template>
          <template #pwd> ********* </template>
          <template #password> ********* </template>
          <template #CreatedAt="data">
            {{ data.value ? $date(data.value, "D/M/YYYY HH:mm:ss") : "-" }}
          </template>

          <template #created="data">
            {{ data.value ? $date(data.value, "D/M/YYYY HH:mm:ss") : "-" }}
          </template>
          <template #lastRun="data">
            {{ data.value ? $date(data.value, "D/M/YYYY HH:mm:ss") : "-" }}
          </template>
          <template #id="data">
            <button @click="onEdit($event, data.item.id)" size="sm" class="btn btn-default">edit</button>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row class="ps-2 ms-2 me-2">
      <b-col sm="1">
        <button @click="back" class="btn btn-secondary">back</button>
      </b-col>
      <b-col sm="2">
        <button v-if="tableLoaded && canAdd" @click="addEntry" class="btn btn-default">add entry</button>
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
//NB this code contains stuff for ref files, but it isn't used.
// This whole file was duplicated to lookupref (and lots stripped out) 2022/7/1
import axios from "axios";

export default {
  props: ["name", "table", "id", "editing", "orderBy"],
  data() {
    return {
      msg: null,
      roles: localStorage.roles ? localStorage.roles.split(",") : [],
      isAdmin: false,
      isAggregator: false,
      isOperator: false,
      loading: true,
      sortFields: ["code", "server", "name"],
      sortLabels: [],
      lookups: [
        { text: "Select Lookup", value: null },
        { text: "Monthly and Yearly Variations", value: "variations" },
        // { text: "Reporting Periods", value: "tbl002_reportingPeriod" },
      ],
      singularName: null,
      items: [],
      canAdd: true,
      fieldsLookup: {
        uploads: [
          { label: "Edit", key: "id" },
          { key: "createdAt" },
          { key: "ReportPeriod_ID", label: "Period" },
          { key: "Data_Provided", sortable: true },
          { key: "originalFilename", label: "Filename", sortable: true },
          { key: "approved", label: "Ok", tdClass: "centre" },
          {
            key: "overwritten",
            label: "Over written",
            tdClass: "centre",
          },
          { key: "deleted", label: "Deleted", tdClass: "centre" },
        ],
        Error_Codes: [
          { label: "Edit", key: "id" },
          { key: "Code", sortable: true },
          { key: "Area", sortable: true },
          "Description",
          "Suggestions",
        ],
      },
      fields: null,
      tableSelected: null,
      niceName: null,
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
  watch: { $route: "loadTable" }, //this forces reload if route changes. If multiple calls made with different tables

  async created() {
    this.loadTable();
  },
  methods: {
    getYM(rp_ID) {
      if (rp_ID == null || rp_ID == "-" || rp_ID.length == 0) return "-";
      else return this.getYearMonth(rp_ID).year + "/" + this.$baseMonths[this.getYearMonth(rp_ID).month];
    },
    getMY(rp_ID) {
      if (rp_ID == null || rp_ID.length == 0) return "-";
      //else return rp_ID +" "+this.getYearMonth(rp_ID).month + "/" + this.getYearMonth(rp_ID).year;
      else return this.$baseMonths[this.getYearMonth(rp_ID).month] + "/" + this.getYearMonth(rp_ID).year;
    },
    getYearMonth(rp_ID) {
      const n = rp_ID.substring(3, 6);
      const m = (n - 1) % 12; //java month 0=jan
      const y = Math.floor((n - 1) / 12) + 2012;
      return { year: y, month: m };
    },
    hasValue(s) {
      if (s != null && s != "default" && s != "-") return true;
    },
    back(event) {
      event.preventDefault();
      if (this.$router.options.history.state.current == this.$router.options.history.state.back) this.$router.push("/home");
      else this.$router.replace(this.$router.options.history.state.back);
    },
    async onTableSelect() {
      this.items = [];
      this.fields = null;
      if (!this.tableSelected.includes("elected")) {
        this.niceName = this.tableSelected;
        this.fields = this.fieldsLookup[this.tableSelected];
        let table = this.tableSelected;

        let url = `${this.$dbUrl}/${table}`;
        if (this.id) {
          url = `${this.$dbUrl}/${table}/${this.id}`;
        }

        this.url = url;
        try {
          const res = await axios.get(url, this.config);
          if (res.data.status != "Ok") {
            this.msg = res.data.status + " " + res.data.err;
            return;
          }

          //except admin, remove id col to remove edit button
          //also for generated Date table (even for admin)
          if (!this.isAdmin && !this.isOperator)
            for (let item of res.data.recordset) {
              delete item.id;
            }

          this.items = res.data.recordset;
          this.tableLoaded = true;
        } catch (err) {
          this.tableLoaded = false;
          if (err.response.status == 401) {
            this.msg = "Login not recognised " + url;
            this.$router.push("/logout");
          } else this.msg = err;
        }
      } else this.tableLoaded = false;
    },

    onEdit(event, id) {
      event.preventDefault();
      this.$router.push(`/lookupedit/edit/${this.tableSelected}/${id}/${this.singularName}`);
    },
    onStats(event, id) {
      event.preventDefault();
      this.$router.push(`/uploadsbymonth/${id}`);
    },
    onEditTable(event, id, name, table, addToName) {
      event.preventDefault();
      const url = `/lookuplist/${table}/${name} - ${addToName}?FI_ID=${id}`;
      console.log("DER521 onEditTable", url);
      this.$router.push(url);
    },
    onViewExtractedTable(event, id) {
      event.preventDefault();
      this.$router.push("/lookuplist/extracted_data/Extracted Data?Uploads_ID=" + id);
    },

    addEntry(event) {
      event.preventDefault();
      try {
        this.msg = "Add " + this.tableSelected;

        const dest = `/lookupedit/create/${this.tableSelected}/first/${this.singularName}/${this.myFI_ID}`;
        // console.log("HGR427 ", dest);
        this.$router.replace(dest);
      } catch (e) {
        this.msg = "LookupList " + e;
      }
    },

    onShowUploads(event, FI_ID, FI_Name) {
      event.preventDefault();
      //const path = "/listopuploads/" + FI_ID + "/" + FI_ID;
      //path: "/listpage/showBack/:table/:RP?/:maxRP?",
      const path = "/listpage/uploads/*/*/" + FI_ID + "/" + FI_Name;

      // console.log("KUJ638", path)

      this.$router.push(path);
    },

    async loadTable() {
      //we might have query params
      this.loading = true;
      this.myTable = this.table;
      //if (!this.myTable) this.myTable = this.$route.query.table;
      if (!this.myTable) this.myTable = this.$route.params.table;

      this.canDownload = false;

      this.myName = this.name;
      if (!this.myName) this.myName = this.$route.params.name;

      this.isAdmin = this.roles.includes("admin");
      this.isOperator = this.roles.includes("operator");
      this.loading = false;

      this.$bus.emit("titleUpdated", "List " + this.myName.replaceAll("_", " "));

      const notAdd = [
        /* "FI_Forms", */
        /* "FI_Frameworks", */
        "referenceFiles",
        "extracted_data",
        "due_dates",
        "Date",
        "refDataProvided",
        "FIsNoFrameworks",
      ];

      if (this.myTable) {
        this.tableSelected = this.myTable;
        if (notAdd.includes(this.myTable) || !this.isAdmin) this.canAdd = false;
        await this.onTableSelect();
      }
      //bit over the top, what?
      this.singularName = this.myName;
      if (this.singularName.endsWith("s")) this.singularName = this.singularName.substring(0, this.singularName.length - 1);
    },
    fn(name, d) {
      if (d && d != null && d != "-") return name + ": " + this.RP_date(d) + "\n";
      return "";
    },
  },
};
</script>
