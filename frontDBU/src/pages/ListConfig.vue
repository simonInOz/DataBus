 <template>
   <b-container class="pt-3 pl-3" fluid>
    <b-row><b-col class="pl-2"><h2>Table and Reports used by each Form</h2></b-col></b-row>
     <b-row class="ps-2 ms-2 me-2">
       <b-col sm="*"><pre>{{ data }}</pre></b-col>
     </b-row>
     <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
     <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
   </b-container>
 </template>
 
<script>
import axios from "axios";

export default {
  data() {
    return {
      msg: null,
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
      data:null,
    };
  },

  async created() {
    this.$bus.emit("titleUpdated", "Form ReportDetails/TableDetails");

     let url = this.$fileUrl + "/listConfig";
    const results = await axios.get(url, this.config);
    // console.log(results)
    this.data = results.data.data
  },
  methods: {

  },
  
};
</script>
