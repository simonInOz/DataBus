 <template>
   <b-container class="ms-5 mt-1" fluid>
     <b-row>
       <b-col sm="0" />
       <b-col sm="*">
         <h2>Edit {{ name }}s</h2>
         <p>
           For: <i>{{ $route.params.name }}</i>
         </p></b-col>
       <b-col sm="1" /></b-row>
     <b-row>
       <b-col sm="0" />
       <b-col sm="6" class="px-0">
         <b-table v-if="items && items.length>0" :items="items" :fields="fields" class="px-0" hover striped>
           <template #edit="data">
             <button @click="deleteEntry(data.item.id)" size="sm" title="Remove entry" class="btn btn-danger">delete</button>
           </template>
         </b-table>
       </b-col>
       <b-col sm="1" /> </b-row><b-row>
       <b-col sm="1">
         <button @click="addEntry" class="btn btn-default">add</button></b-col>
       <b-col sm="*"><b-input v-model="newText" /> </b-col>
       <b-col sm="0" /></b-row>
     <b-row><b-col sm="1" /><b-col sm="*">{{ msg }}</b-col><b-col sm="1" /></b-row>
   </b-container>
 </template>
 
<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";

export default {
  props: ["name", "table", "label", "kkey"],
  data() {
    return {
      newText: null,
      items: [],
      fields: [{ label: this.label, key: this.kkey }, "Edit"],
      msg: null,

      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  async created() {
    // console.log("BBG537 created");
    await this.action("reload");
  },
  methods: {
    async action(op, ID) {
      try {
        let url = this.$dbUrl;
        let msg = op + " complete";
        switch (op) {
          case "delete":
            url += "/remove" + this.name + "/" + ID;
            break;
          case "add":
            url += "/add" + this.name + "/" + this.newText;
            break;
          case "reload":
            url += "/" + this.name + "_FI_ID/";
            break;
        }
        alert(url);
        const res = await axios.get(url, this.config);
        if (op == "reload") this.items = res.data.recordset;
        else {
          this.msg = msg;
          this.newText = "";
          setTimeout(() => {
            this.msg = null;
          }, 5000);
        }
      } catch (err) {
        if (err.response.status == 401) this.msg = "Not authorised";
        else if (err.response.status == 405) this.msg = "Not permitted";
        else this.msg = err;
      }
    },

    async deleteEntry(ID) {
      await this.action("delete", ID);
      await this.action("reload");
    },
    async addEntry() {
      await this.action("add");
      await this.action("reload");
    },
  },
};
</script>
