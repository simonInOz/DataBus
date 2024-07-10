<script>
export default {
  name: "bTableFilter",
  props: [
    "id",
    "loaded",
    "caption",
    "fields",
    "items",
    "tableClass",
    "thClass",
    "trClass",
    "tdClass",
    "sortLabels",
    "sortFields",
    "striped",
    "hover",
    "bordered",
    "filter",
    "fieldInfo",
    "settings",
  ],
  emits: ["set-child-data"],
  data() {
    return {
      myLabels: [],
      myLabelToKey: {},
      myKeys: [],
      myFormats: [],
      myRows: [],
      mySort: [],
      mySortLabels: [],
      mySortFields: [],
      sortCol: { colName: null, direction: null },
      show: true,
      myTableClass: "tableZtable",
      myThClass: "tableZth",
      myTrClass: "tableZtr",
      myTdClass: [],
      myFieldInfo: null,
      defaultTdClass: "tableZtd",
      sortList: "",
      filterable: false,

      modalKey: "xxx",
      modalTitle: "",
      modalMinorTitle: null,
      modalSubtitle: null,
      modalItems: null,
      modalFields: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      if (this.items) {
        //this copying is to allow defaults
        //css
        if (this.tableClass) this.myTableClass = this.tableClass;
        if (this.thClass) this.myThClass = this.thClass;
        if (this.trClass) this.myTrClass = this.trClass;
        if (this.filter) this.filterable = true;

        this.myTdClass = [];

        if (typeof this.bordered == "string") {
          this.myTableClass = "tableZtableBordered";
        }

        //sorting
        if (this.sortFields) this.mySortFields = this.sortFields;
        if (this.sortLabels) this.mySortLabels = this.sortLabels;

        let sortable = true;

        if (this.fieldInfo) this.myFieldInfo = this.fieldInfo;

        //now the data
        if (this.fields && this.fields.length > 0) {
          for (let field of this.fields) {
            sortable = true;
            let label, key;
            if (typeof field == "string") {
              key = field;
              label = this.pretty(field).trim();
              this.myLabels.push(label);
              this.myKeys.push(key);
              this.myLabelToKey[label] = key;
              this.myFormats[field] = "std";
              this.myTdClass[key] = this.defaultTdClass;

              //dodgy custom formatting
              if (key.includes("sum_") || key.includes("umber") || key.includes("alue")) {
                this.myTdClass[key] = "tableZtdNumber";
              }
            } else {
              if (field.key || field.id || field.field) {
                let key;
                if (field.key) key = field.key;
                if (field.id) key = field.id;
                if (field.field) key = field.field;
                this.myKeys.push(key);

                this.myTdClass[key] = this.defaultTdClass;
                if (field.tdClass) this.myTdClass[key] += " " + field.tdClass;

                if (field.label) label = field.label.trim();
                else label = this.pretty(key).trim();
                this.myLabels.push(label);
                this.myLabelToKey[label] = key;

                if (
                  field.sortable ||
                  field.sortable == "true" ||
                  field.sortable == "TRUE" ||
                  field.sortable == "y" ||
                  field.sortable == "Y" ||
                  this.mySortFields.includes(key) ||
                  this.mySortLabels.includes(label)
                ) {
                  sortable = true;
                }
                sortable = true; //yes, dammit

                if (field.format) this.myFormats[key] = field.format;
                else this.myFormats[key] = "std";

                //dodgy custom formatting
                if (key.includes("sum_") || key.includes("umber") || key.includes("alue")) {
                  this.myTdClass[key] = "tableZtdNumber";
                }
              } else console.log("TableZ443 error no key/id/field in fields entry " + field);
            }
            if (sortable || this.mySortFields.includes(field) || this.mySortLabels.includes(label)) {
              this.mySort[label] = {
                dir: "None",
                upIcon: "bi-caret-up",
                upChar: "△",
                downIcon: "bi-caret-down",
                downChar: "▽",
              };
            }
          }
        } else {
          //no fields - extract from data
          let row = this.items[0];
          for (let key in row) {
            // sortable = false;
            sortable = true;
            const label = this.pretty(key).trim();
            this.myLabels.push(label);
            this.myKeys.push(key);
            this.myLabelToKey[label] = key;
            this.myTdClass[key] = this.defaultTdClass;

            if (this.mySortFields.includes(key) || this.mySortLabels.includes(label)) {
              sortable = true;
            }
            if (sortable) this.sortList += "   " + key + ":" + label;
            if (sortable)
              this.mySort[label] = {
                dir: "None",
                upIcon: "bi-caret-up",
                upChar: "△",
                downIcon: "bi-caret-down",
                downChar: "▽",
              };
          }
        }

        this.myRows = [...this.items]; //clone items
        this.show = true;
      }
    },

    up(h) {
      this.clearSort();
      this.mySort[h].upChar = "▲";
      this.sortData("up", h);
    },
    down(h) {
      this.clearSort();
      this.mySort[h].downChar = "▼";
      this.sortData("down", h);
    },
    clearSort() {
      for (let s in this.mySort) {
        let sort = this.mySort[s];
        sort.upChar = "△";
        sort.downChar = "▽";
      }
    },
    setPropertiesPopup(label) {
      const key = this.myLabelToKey[label];
      this.modalKey = key;

      const type = this.myFieldInfo[key].type;
      // console.log("NHT887", "type", type, this.myFieldInfo[key]);

      if (key == "id") {
        this.modalFields = ["hide", "filterTo", "filterMin", "filterMax", "orderBy", "orderByDescending"];
      } else {
        if (["money", "int", "decimal"].includes(type)) {
          this.modalFields = ["hide", "filterTo", "filterMin", "filterMax", "sum", "orderBy", "orderByDescending"];
        } else {
          this.modalFields = ["hide", "filterTo", "filterMin", "filterMax", "groupBy", "orderBy", "orderByDescending"];
        }
      }

      this.modalItems = this.myFieldInfo[key].fields;
      // console.log("NGR556", type, this.modalItems);

      this.modalTitle = label + " properties (" + key + ")";
      this.modalMinorTitle = null;
      this.modalSubtitle = null;

      document.getElementById("popUpBox1").showModal();
    },
    savePopup() {
      const fields = this.$getInputValues();
      // console.log("NSJ495", fields);
      for (let f of this.modalFields) {
        const val = fields[this.modalKey + "_" + f];
        // console.log("NGR885", f, val);
        this.$emit("set-child-data", this.modalKey, f, val);
        this.myFieldInfo[this.modalKey].fields[f] = val;
      }
      document.getElementById("popUpBox1").close();
    },
    cancelPopup() {
      document.getElementById("popUpBox1").close();
    },
    sortData(dir, label) {
      let key = this.myLabelToKey[label];

      //case insensitive sort myRows by col with label "key"
      if (dir == "up")
        this.myRows.sort(function (a, b) {
          let akey = a[key];
          let bkey = b[key];
          if (akey == null) akey = "";
          if (bkey == null) bkey = "";
          if (akey == bkey) return 0;
          if (typeof akey == "string" && typeof bkey == "string") {
            return akey.toUpperCase() > bkey.toUpperCase() ? 1 : -1;
          }
          return akey > bkey ? 1 : -1;
        });
      else
        this.myRows.sort(function (a, b) {
          let akey = a[key];
          let bkey = b[key];
          if (akey == null) akey = "";
          if (bkey == null) bkey = "";
          if (akey == bkey) return 0;
          if (typeof akey == "string" && typeof bkey == "string") {
            return akey.toUpperCase() < bkey.toUpperCase() ? 1 : -1;
          }
          return akey < bkey ? 1 : -1;
        });
    },
    getTRClass(cls, row) {
      if (row.hasOwnProperty("_rowVariant")) {
        return cls + "  tr" + row["_rowVariant"];
      }
      return cls;
    },
    pretty(field) {
      try {
        const fLower = field.toLowerCase();
        if (fLower == "id") return "id";
        if (fLower == "ip") return "IP";
        let s = field.substr(0, 1);
        let f = s.toUpperCase() + field.substr(1);
        let g = f.replaceAll("_", " ");

        let k = "";
        let prev = "a";
        let t = "";
        for (let pos = 0; pos < g.length; pos++) {
          t = g.substr(pos, 1);
          const prevUpper = prev.toUpperCase() == prev;
          const tUpper = t.toUpperCase() == t;
          if (prev != " " && !prevUpper && tUpper) k += " ";
          k += t;
          prev = t;
        }
        return k;
      } catch (e) {
        return "Pretty error {" + field + "} " + e + " " + typeof field;
      }
    },
    empty(a, name = null) {
      let r = false;
      if (a == null) r = true;
      if (typeof a == "string" && a.length == 0) r = true;
      return r;
    },
    dirty(label) {
      try {
        const key = this.myLabelToKey[label];
        const f = this.myFieldInfo[key].fields;
        const result =
          f.hide ||
          f.groupBy ||
          f.orderBy ||
          f.orderByDescending ||
          f.sum ||
          !this.empty(f.filterTo, "filterTo") ||
          !this.empty(f.filterMin, "filterMin") ||
          !this.empty(f.filterMax, "filterMax");
        return result;
      } catch (e) {
        return false;
      }
    },
  },
};
</script>

<template>
  <table :class="myTableClass" v-if="show">
    <caption v-if="caption" class="tableCaption">
      {{
        caption
      }}
    </caption>
    <tr>
      <th :class="myThClass" v-for="h in myLabels" :key="h">
        <table style="width: 100%">
          <tr v-if="h != 'row Variant'">
            <td rowspan="3">{{ h }}</td>
          </tr>
          <tr>
            <td v-if="dirty(h)" class="upDownIcon realLink loud" title="properties" @click="setPropertiesPopup(h)">&#x2699;</td>
            <td v-else class="upDownIcon realLink" title="properties" @click="setPropertiesPopup(h)">&#x2699;</td>
          </tr>
        </table>
      </th>
    </tr>

    <tr :class="getTRClass(myTrClass, r)" v-for="r in myRows" :key="r">
      <td :class="myTdClass[k]" v-for="k in myKeys" :key="k">
        <span v-if="r[k] != null && k != '_rowVariant'">
          <slot :name="k" :value="r[k]" :item="r">{{ r[k] }}</slot>
        </span>
      </td>
    </tr>
  </table>
  <dialog id="popUpBox1">
    <table width="100%">
      <tr>
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
    <table width="100%" class="smoke">
      <tr>
        <th>Item</th>
        <th>Setting</th>
      </tr>
      <tr v-for="h in modalFields" :key="h">
        <td>{{ pretty(h) }}</td>
        <td>
          <input type="checkbox" v-if="typeof modalItems[h] == 'boolean' && modalItems[h]" :id="modalKey + '_' + h" checked />
          <input type="checkbox" v-if="typeof modalItems[h] == 'boolean' && !modalItems[h]" :id="modalKey + '_' + h" />
          <input v-if="typeof modalItems[h] != 'boolean'" :id="modalKey + '_' + h" :value="modalItems[h]" />
        </td>
      </tr>
      <tr>
        <td />
        <td><button @click="savePopup">save</button></td>
        <td><button @click="cancelPopup">cancel</button></td>
      </tr>
    </table>
  </dialog>
</template>

<style>
.realLink {
  cursor: pointer;
}
.realLink:hover {
  color: black;
  font-weight: bold;
  cursor: pointer;
}
.upDownIcon {
  color: gray;
  font-size: 14px;
  padding: 0px;
  margin: 0px;
  line-height: 0.25;
  width: 20px;
}
.loud {
  color: red;
}

.tableZtable {
  padding: 8px;
  line-height: 1.3;
  vertical-align: top;
  animation: fadeInAnimation ease-in-out 0.3s;
  margin-bottom: 1rem;
  color: #212529;
}
.tableZtableBordered {
  padding: 8px;
  line-height: 1.3;
  vertical-align: top;
  border: 1px solid #ddd;
  border-collapse: collapse;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  animation: fadeInAnimation ease-in-out 0.3s;
  margin-bottom: 1rem;
  color: #212529;
}
.tableZth {
  background-color: white;
  border: 1px solid #ddd;
  padding-left: 5px;
  vertical-align: top;
}
.tableZtr:hover {
  background-color: gainsboro !important;
}
.tableZtr {
  background-color: white;
}
.tableZtr:nth-child(even) {
  background-color: #f2f2f2;
}
.trsuccess {
  background-color: paleGreen !important;
}
.trdanger {
  background-color: #f5c6cb !important;
}
.trwarning {
  background-color: #ffeeba !important;
}
.trinfo {
  background-color: #bee5eb !important;
}

.tableZtd {
  border: 1px solid #ddd;
  padding: 6px;
  vertical-align: top;
}
.tableCaption {
  color: dim gray;
  font-size: large;
  font-weight: bold;
  display: table-caption;
  caption-side: top;
  text-align: center;
  background-color: #e5e4e2;
  border-radius: 6px;
}
.tableFullWidth {
  width: 100%;
}
.tableZtdNumber {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: right;
  vertical-align: top;
}
</style>
