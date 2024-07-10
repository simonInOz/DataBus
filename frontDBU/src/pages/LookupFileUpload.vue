 <template>
   <b-container class="mx-3" fluid="true">
     <b-row>
       <b-col>
         <h2><b>Lookup File Upload</b></h2>
         <form @submit.prevent="onSubmit" enctype="multipart/form-data">
           <b-form-file @change="onSelect" accept=".xlsx" drop-placeholder="Drop file here..." placeholder="Choose a file or drop it here..." :state="Boolean(file1)" v-model="file1" />
           <div class="mt-3">Selected file: {{ file1 ? file1.name : "" }}</div>
 
           <div class="fields">
             <button @click="onSubmit" class="btn btn-default">Upload file</button>&nbsp;&nbsp;{{
               msg
             }}
             <b-progress :value="percent" title="Upload progress" :hidden="hideProgressBar" />
           </div>
           <div class="message">
             <h5>{{ message }}</h5>
           </div>
         </form>
         <p>
           This is specifically for uploading the spreadsheet file containing the
           tabs for the lookup tables including financial institutions data.
           <br>Database tables will be created named for each worksheet in the
           submitted workbook. <b>Existing data will be replaced. This is not a
           reversible operation.</b>
         </p>
       </b-col>
     </b-row>
   </b-container>
 </template>
 
<script>
//import Vue from "vue";
import axios from "axios";

export default {
  name: "LookupFileUpload",
  props: {},
  data() {
    return {
      file1: null,
      message: "",
      msg: null,
      fileSelected: false,
      submitDisabled: true,
      hideProgressBar: true,

      tablename: null,

      percent: 0,
      config: {
        headers:{ "x-access-token":localStorage.jwtToken},
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          this.percent = percentCompleted;
        },
      },
    };
  },
  methods: {
    async onSubmit() {
      this.percent = 0;
      this.submitDisabled = false;
      this.hideProgressBar = false;

      this.submitDisabled = true;
      this.fileSelected = false;

      const formData = new FormData();
      formData.append("tablename", this.tablename);
      // console.log("BGF443 tablename", this.tablename);
      formData.append("file", this.file1);

      const url = this.$uploadIdUrl;
      try {
        let response = await axios.post(
          url,
          formData,
          this.config
        );
        console.log("VDf384 file upload ", response);
        this.msg = "Id file uploaded";
        setTimeout(() => {
          this.msg = null;
        }, 10000);
        setTimeout(() => {
          this.hideProgressBar = true;
        }, 1000);
      } catch (err) {
        console.log("GVF483 file upload error ", err);
        this.msg = err.response.data.error;
        this.hideProgressBar = true;
      }
    },
  },
};
</script>
 
 <style scoped>
 select {
   margin: 0px 0px 10px 0px !important;
 }
 </style>
