 <template>
   <b-container class="mx-3">
     <b-row>
       <b-col>
         <h2>Uploads file Upload</h2>
         <form class="mb-3" @submit.prevent="onSubmit" enctype="multipart/form-data">
           <b-form-file accept=".xlsx" drop-placeholder="Drop file here..." placeholder="Choose a file or drop it here..." :state="Boolean(file1)" v-model="file1" />
           <div class="mt-3 fields">
             <button @click="onSubmit" class="btn btn-default">Upload file</button>&nbsp;&nbsp;{{ msg }}&nbsp;&nbsp;
             <div v-if="loading" role="status" class="mt-3 spinner-border">
               <span class="sr-only">Loading...</span>
             </div>
           </div>
         </form>
         <b-table v-if="errorList.length > 0" :items="errorList" hover striped />
         <br>
         <br>
         <br>
         <p>
           This is specifically for uploading TEST data for uploads from a
           spreadsheet file
         </p>
       </b-col>
     </b-row>
   </b-container>
 </template>
 
<script>
//import Vue from "vue";
import axios from "axios";

export default {
  props: {},
  data() {
    return {
      file1: null,
      msg: null,
      loading: false,
      fileSelected: false,
      submitDisabled: true,

      tablename: null,
      errorList: [],

      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },
  methods: {
    async onSubmit() {
      this.submitDisabled = false;

      this.submitDisabled = true;
      this.fileSelected = false;
      this.msg = "Processing file";
      this.loading = true;
      this.errorList = [];

      const formData = new FormData();
      formData.append("file", this.file1);

      const url = this.$uploadUploadsUrl + "/y";
      try {
        let response = await axios.post(url, formData, this.config);
        console.log("BGD554 file upload ", response);
        this.msg = "Uploads file uploaded";
        if (response.data && response.data.errors)
          this.errorList = response.data.errors;
        else this.errorList = [];
      } catch (err) {
        console.log("DSB665 file upload error ", err);
        console.log("BFD444", err);
        this.msg = "Error " + err;
      }
      this.loading = false;
    },
  },
};
</script>
 
 <style scoped>
 select {
   margin: 0px 0px 10px 0px !important;
 }
 </style>
