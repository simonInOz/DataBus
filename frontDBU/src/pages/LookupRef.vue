<template>
  <b-container class="pt-3" fluid>
    <b-row class="ps-2 ms-2 me-1">
      <b-col sm="7"><h4>Reference Files</h4></b-col>
      <b-col sm="1" class="gainsboro">
        <b-form-checkbox @change="loadTable()" value="Y" id="current">current</b-form-checkbox>
      </b-col>
      <b-col sm="4" class="gainsboro">
        <b-form-radio-group @change="loadTable" :options="options" value="active" name="selectRadio"
      /></b-col>
      <!-- <b-col sm="1"/> -->
    </b-row>
    <b-row class="ps-2 ms-2">
      <b-col sm="12">
        <b-table v-if="items && items.length > 0" :items="items" :fields="fields" bordered hover striped>
          <template #active="data"
            ><b-icon v-if="data.value == 'Yes'" class="icongreen" icon="check-square-fill" />
            <b-icon class="iconred" icon="x-circle" v-else />
          </template>
          <template #uniqueCell="data">
            <span :title="data.item.uniqueCellValue">{{ data.value }}</span>
          </template>
          <template #MultipleFIs="data"
            ><b-icon
              v-if="data.value == 'Yes'"
              title="Combines many FIs in a single file"
              class="icongreen"
              icon="check-square-fill" />
            <b-icon title="Submits individual files for mutiple FIs" class="iconred" icon="x-circle" v-else />
          </template>
          <template #appliesFrom="data">
            {{ $date(data.value, "MMM YYYY") }}-{{ $date(data.item.appliesUntil, "MMM YYYY") }}
          </template>
          <template #created="data">
            <span :title="data.item.user_id">{{ data.value ? $date(data.value, "D/M/YYYY") : "-" }}</span>
          </template>
          <!-- this builds the dropdown for editing for the various files -->

          <template #id="data">
            <b-dropdown v-if="isAdmin && tableSelected == 'referenceFiles'" size="sm" variant="primary" class="dropsquare">
              <b-dropdown-item
                ><a href="#" class="dropdown-item ddiZero" @click="onEdit($event, data.value)">edit entry</a></b-dropdown-item
              >
              <b-dropdown-item
                ><a
                  href="#"
                  class="dropdown-item ddiZero"
                  @click="downloadUploadRef($event, data.item.id, data.item.originalFname, false)"
                  >download file</a
                ></b-dropdown-item
              >
              <b-dropdown-item
                ><a
                  href="#"
                  class="dropdown-item ddiZero"
                  @click="downloadRefFile($event, data.value, data.item.originalFname, 'config')"
                  >download&nbsp;config&nbsp;sheet</a
                ></b-dropdown-item
              >
              <b-dropdown-divider />
              <b-dropdown-item
                ><a href="#" @click="nothing" class="dropdown-item ddiZero">ref file id: {{ data.value }}</a></b-dropdown-item
              >
            </b-dropdown>
          </template>
          <template #tableName="data">{{ noDef(data.value) }}</template>
          <template #FISource="data">{{ noDef(data.value) }}</template>
          <template #PeriodSource="data">{{ noDef(data.value) }}</template>
        </b-table>
      </b-col>
    </b-row>
    <b-row v-if="canAdd" class="ps-2 ms-2 me-2"
      ><b-col sm="*"><button @click="addEntry" class="btn btn-default">Add Entry</button></b-col></b-row
    >
    <b-row
      ><b-col sm="*">{{ msg }}</b-col></b-row
    >
    <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line no-unused-vars
//this file was copied from lookupList and much code stripped out. There's doubtless a bunch of redundant code
//this was because it needs selection at the top and a different query. 2022/7/1
import axios from "axios";

export default {
  data() {
    return {
      options: ["active", "inactive", "all"],
      selected: "active",
      current: true,
      msg: null,
      roles: localStorage.roles ? localStorage.roles.split(",") : [],
      isAdmin: false,
      isOp: false,
      lookups: [
        { text: "Select Lookup", value: null },
        { text: "Financial Institutions", value: "tbl001_fiDetails" },
        { text: "Reference Files", value: "referenceFiles" },
        { text: "Monthly and Yearly Variations", value: "variations" },
        // { text: "Reporting Periods", value: "tbl002_reportingPeriod" },
        { text: "Table Details", value: "tbl005_tableDetails" },
      ],
      singularName: null,
      items: [],
      canAdd: true,
      fieldsLookup: {
        referenceFiles: [
          { label: "Edit", key: "id" },
          { key: "created", sortable: true },
          { key: "Data_Provided", sortable: true },
          "uniqueCell",
          {
            key: "originalFname",
            label: "File",
            sortable: true,
            tdClass: "squeezeMedium",
          },
          { key: "appliesFrom", label: "Applies", tdClass: "mediumishWide" },
          "active",
          { key: "MultipleFIs", sortable: true },
          { key: "tableName", sortable: true },
          { label: "FI Source", key: "FISource", sortable: true },
          { label: "Period Source", key: "PeriodSource", sortable: true },
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
    setTimeout(this.loadTable, 50); //allow radio group to load
  },
  methods: {
    async onTableSelect() {
      this.items = [];
      this.fields = null;
      if (!this.tableSelected.includes("elected")) {
        //get nice name from lookups
        this.niceName = this.tableSelected;
        for (let lookup of this.lookups) {
          if (lookup.value == this.tableSelected) {
            this.niceName = lookup.text;
            this.$bus.emit("titleUpdated", "List " + this.niceName);
          }
        }
        this.fields = this.fieldsLookup[this.tableSelected];

        let url = this.$dbUrl + "/uploadsRef/" + this.selected + (this.current ? " current" : "");
        this.url = url;
        // console.log("BDY382", url)
        try {
          const res = await axios.get(url, this.config);

          //except admin, remove id col to remove edit button
          if (!this.isAdmin)
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
    addEntry(event) {
      event.preventDefault();
      try {
        if (this.tableSelected == "referenceFiles") {
          this.msg = "Adding not permitted here - upload a file!";
          return;
        }
        this.msg = "Add " + this.tableSelected;

        const dest = `/lookupedit/create/${this.tableSelected}/first/${this.singularName}/${this.myFI_ID}`;
        // console.log("HGR427 ", dest);
        this.$router.push(dest);
      } catch (e) {
        this.msg = "LookupList " + e;
      }
    },
    async downloadUpload(event, refFileId, fnam) {
      event.preventDefault();
      try {
        this.msg = "upload id:" + refFileId;
        // console.log("LJU774", refFileId);

        const url = `${this.$dbUrl}/downloadUpload/${refFileId}`;
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

    async downloadRefFile(event, id, originalFilename, file) {
      event.preventDefault();
      let fnam = originalFilename;
      const url = `${this.$downloadRefFileUrl}/${id}/${file}`;
      axios({
        url: url,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement("a");

        fileLink.href = fileURL;
        fileLink.setAttribute("download", fnam);
        document.body.appendChild(fileLink);

        fileLink.click();
      });
    },
    async loadTable() {
      this.myTable = "referenceFiles";
      this.myName = "Reference Files";

      this.myFI_ID = null;
      this.Uploads_ID = null;

      this.canAdd = this.$route.query.canAdd != "N";

      this.isAdmin = this.roles.includes("admin");
      this.isOp = this.roles.includes("operator");

      this.current = this.$getInputValue("current");
      this.selected = this.$getInputValue("selectRadio");

      const notAdd = ["referenceFiles"];

      if (this.myTable) {
        this.tableSelected = this.myTable;
        if (notAdd.includes(this.myTable) || !this.isAdmin) this.canAdd = false;
        await this.onTableSelect();
      }
      //bit over the top, what?
      this.singularName = this.myName;
      if (this.singularName.endsWith("s")) this.singularName = this.singularName.substring(0, this.singularName.length - 1);
    },
    async downloadUploadRef(event, refFileId, fnam) {
      event.preventDefault();
      try {
        this.msg = "";

        const url = this.$dbUrl + "/downloadUploadRef/" + refFileId;
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
        console.log("HYJ654", e);
        this.msg = "downloadUploadRef error " + e;
      }
    },
    nothing(event) {
      event.preventDefault();
    },
    noDef(s) {
      if (s && s != "default") return s;
      return "-";
    },
  },
};
</script>
