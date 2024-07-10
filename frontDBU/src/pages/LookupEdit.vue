<template>
  <b-form id="editForm" @submit="save">
    <b-container class="ms-5" fluid>
      <b-row>
        <b-col sm="6" class="px-0">
          <h2>{{ action }} {{ $route.params.niceName }}</h2>
        </b-col>
      </b-row>
      <b-row v-for="(val, name) in items" class="mb-2" :key="name">
        <b-col v-if="name != 'id' && name != 'uploaded_file'" sm="2" class="px-0">
          <label>{{ pretty(name) }}</label>
        </b-col>
        <EditField
          v-if="name != 'uploaded_file'"
          :name="name"
          :val="
            action == 'Create'
              ? name == 'Active'
                ? 'Yes'
                : name == 'FI_ID' && val != 'undefined' && val != 'varchar 255'
                ? val
                : defaults[name]
              : val
          "
          :disabled="
            ((name == 'FI_ID' && val != 'undefined' && val != 'varchar 255') || readOnly.includes(name)) &&
            !notReadonly.includes(table.toLowerCase() + '.' + name.toLowerCase())
          "
          :required="required.includes(name) ? 'true' : 'false'"
          :op="op"
          :override="overrides.includes(table + ':' + name) ? 'true' : 'false'"
          :options="name.startsWith('id') && name.length > 2 ? Sources[name] : fixedSelects[name]"
          :onkeyup="onchangeVal"
          :table="table"
          :type="
            booleans.includes(name)
              ? 'chk'
              : selects.includes(name) || fixedSelects[name]
              ? 'select'
              : name.toLowerCase().includes('date') || name.toLowerCase().includes('applies')
              ? 'date'
              : name.toLowerCase().includes('message')
              ? 'textarea'
              : 'text'
          " /><b-col>{{ comments[table + ":" + name] }}</b-col>
      </b-row>
      <b-row>
        <b-col sm="2" class="pl-0"
          ><button v-if="backButton" @click="cancel" class="btn btn-secondary" type="submit">back</button></b-col
        >
        <b-col sm="2"><button class="btn btn-default" :disabled="saveDisabled" type="submit">Save</button></b-col>
        <b-col sm="1" />
        <b-col sm="2" class="text-end"
          ><button v-if="op == 'edit' && table != 'fiDetails' && table != 'banner'" @click="deleteEntry" class="btn btn-danger">
            Delete
          </button></b-col
        >
        <b-col>&nbsp;</b-col>
      </b-row>
      <b-row
        ><b-col class="pb-5">{{ msg }}</b-col></b-row
      >
      <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
    </b-container></b-form
  >
</template>
<script>
import axios from "axios";
import EditField from "../pages/EditField.vue";
const TEST = false;

export default {
  name: "LookupEdit",
  components: { EditField },
  data() {
    return {
      items: [],
      table: null,
      action: "Edit",
      msg: null,
      backButton: true,
      saveDisabled: false,
      optional_FI_ID: null,
      comments: {
        "FI_Forms:Variance": "Variance permitted period to period (0.2=20%)",
        //"FI_Forms:Data_Provided": "Can be overriden by field below (for new files)",
      },

      readOnly: ["created", "Created", "CreatedAt", "CreatedBy", "lastUpdated", "LastRun"], //renders field disabled
      notReadonly: ["bpay_pi_code.fi_id", "austraclear_esa_holder.fi_id", "eftpos_financial_instcode.fi_id", "hvcs_bic.fi_id"],

      booleans: ["Active", "Monthly", "Quarterly", "Yearly"],
      selects: ["idLoginSources", "idDataSources"],
      overrides: [], //not currently used 2023/7/4
      fixedSelects: {
        active: ["Yes", "No"],
        Status: ["Active", "Inactive", "Merging", "Merged"],
        Frequency: ["Monthly", "Quarterly", "Yearly"],
        cronFrequency: ["EOD", "EOM", "Quarterly", "Yearly", "Once", "Hourly", "TEST"],
        cronOperation: ["DominoDownload", "TestError"],
        bannerType: ["logon", "every page"],
        durationSecs: ["5", "10", "60", "1000"],
      },
      defaults: {
        Status: "Active",
        Frequency: "Monthly",
        cronFrequency: "Monthly",
        CreatedAt: "now()",
        CreatedBy: "user()",
      },
      required: ["name", "cronOperation"],

      Sources: {},

      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },

  async created() {
    if (this.$route.params.showBack) this.backButton = this.$route.params.showBack != "n";

    this.items = [];
    this.table = this.$route.params.table;
    this.$bus.emit("titleUpdated", this.action + " " + this.$route.params.niceName);

    //NB for create id is usually "first", so we get the first entry of the table
    const url = this.$dbUrl + "/" + this.$route.params.table + "/" + this.$route.params.id;

    this.op = this.$route.params.op;
    if (this.op == "create") {
      this.action = "Create";
    } else {
      this.action = "Edit";
    }

    try {
      if (TEST) console.log("BGR394", url);
      const res = await axios.get(url, this.config);
      if (TEST) console.log("BGS211", res);

      let myItems = null;
      if (this.op == "create") {
        myItems = res.data.recordset[0];
      } else myItems = res.data.recordset[0];

      this.items = myItems;

      await this.loadSources();

      this.checkSaveDisabled();
    } catch (err) {
      if (err.response.status == 401) {
        this.msg = "Login not recognised";
        this.$router.push("/logout");
      } else this.msg = err;
    }
  },
  methods: {
    checkSaveDisabled() {
      //for all fields
      for (const item in this.items) {
        if (this.required.includes(item)) {
          var a = document.getElementById(item);
          if (a.type == "text") {
            if (a.value == null || a.value.length == 0) {
              this.saveDisabled = true;
              return;
            }
          }
        }
      }
      // if required and empty return true
      this.saveDisabled = false;
    },
    pretty(name) {
      let n = name
      if(n.startsWith("id") && n.length>3) n=n.substr(2)
      const c1 = n.substr(0, 1).toUpperCase();
      const c2 = c1 + n.substr(1);
      return c2.replaceAll("_", " ");
    },
    async save(event) {
      event.preventDefault();
      await this.saveData(this.action);
    },
    async deleteEntry(event) {
      event.preventDefault();
      if (confirm("Confirm delete")) await this.saveData("delete");
    },
    async saveData(opIn) {
      const op = opIn.toLowerCase();

      const doing = {
        create: "Creating",
        edit: "Saving",
        delete: "Deleting",
      };
      const done = {
        create: "Created",
        edit: "Saved",
        delete: "Deleted",
      };

      try {
        const formData = [];
        this.msg = doing[op];

        let inputs = document.body.getElementsByTagName("input");
        let textAreas = document.body.getElementsByTagName("textarea");
        let selects = document.body.getElementsByTagName("select");

        if (op != "create")
          if (this.$route.params.id == "first" || this.$route.params.id == "top")
            //watch for id param "first"
            formData.push({ name: "id", value: this.items.id });
          else formData.push({ name: "id", value: this.$route.params.id });

        let overrides = [];
        for (const input of inputs) {
          switch (input.type) {
            case "checkbox":
              formData.push({
                name: input.id,
                value: input.checked ? "Yes" : "No",
              });
              break;
            case "text":
              if (op != "create" || input.value.length > 0) {
                let name = input.id;
                if (name.endsWith("_override")) {
                  if (input.value.length > 0) {
                    const pos = name.lastIndexOf("_");
                    name = name.substring(0, pos);
                    overrides.push(name);
                    formData.push({ name: name, value: input.value });
                  }
                } else {
                  formData.push({ name: name, value: input.value });
                }
              }
              break;
            case "date": //vue3 bootstrap 5
              if (input.value && !input.value.startsWith("1900"))
                //1900 -> date not entered
                formData.push({ name: input.name, value: input.value });
              else formData.push({ name: input.name, value: null }); //null values do not update SQL
              break;
            case "hidden": //date (bootstrapvue only)
              // alert("CFE332 date id=" +input.id+" name="+input.name+" type="+input.type+ " value=" + input.value);
              if (input.value && !input.value.startsWith("1900"))
                //1900 -> date not entered
                formData.push({ name: input.name, value: input.value });
              else formData.push({ name: input.name, value: null }); //null values do not update SQL
              break;
            default:
              console.log("BGT555 error unknown type", input.type);
          }
        }
        for (const input of textAreas) {
          switch (input.type) {
            case "textarea":
              formData.push({ name: input.id, value: input.value });
              break;
            default:
              console.log("BGT555 error unknown type", input.type);
          }
        }
        // console.log("NGR382", formData);
        for (const input of selects) {
          //it could have been added by an _override text field
          if (!overrides.includes(input.id)) {
            if (input.selectedIndex > -1)
              formData.push({
                name: input.id,
                value: input.options[input.selectedIndex].value,
              });
            else
              formData.push({
                name: input.id,
                value: null,
              });
          }
        }
        let url = this.$dbUrl + "/save/" + op + "/" + this.table; //this.$route.params.table;
        //console.log("mdr333 table", this.table, url);

        try {
          const result = await axios.post(url, formData, this.config);
          if (result.data.status == "Ok") {
            this.msg = done[op];
            setTimeout(() => {
              try {
                this.msg = null;
                //this.$router.push(localStorage.prevURL);
                //this.$router.push(this.$routerHistory.previous().path);
                this.$router.replace(this.$router.options.history.state.back);
              } catch (e) {
                console.log("GDE888 error ", e);
              }
            }, 1000);
          } else {
            this.msg = "Operation failed. " + result.data.errorCode;
            try {
              this.msg += " " + result.data.err.originalError.info.message;
            } catch (ee) {
              //
            }
          }
        } catch (err) {
          if (err.response.status == 401) {
            this.msg = "Not authorised";
            this.$router.push("/logout");
          } else if (err.response.status == 405) this.msg = "Not permitted";
          else this.msg = err;
        }
      } catch (e) {
        this.msg = e;
        console.log("GFD554", e);
      }
    },
    //load lookup for select dropdowns
    async loadSources() {
      for (let sel of this.selects) {
        if (sel.startsWith("id") && sel.length > 2) {
          let tableName = sel.substring(2);
          this.Sources[sel] = [];
          const resH = await axios.get(this.$dbUrl + "/" + tableName, this.config);
          for (let dp of resH.data.recordset) {
            this.Sources[sel].push({ text: dp.name, value: dp.id });
          }
        }
      }
    },
    async cancel(event) {
      event.preventDefault();
      if (this.$router.options.history.state.current == this.$router.options.history.state.back) this.$router.push("/home");
      else this.$router.replace(this.$router.options.history.state.back);
    },
    async changeVal(e) {
      // console.log("NFR554", "target value", e.target.value); //new value
      // console.log("GTR283", "e.target.id", e.target.id); //dropdown name
      if (e.target.id == "SourceForm") await this.loadLabels(e.target.value);
    },
    async onchangeVal(e) {
      this.checkSaveDisabled();
    },
  },
};
</script>
