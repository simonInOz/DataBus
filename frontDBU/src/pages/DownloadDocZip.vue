<template>
  <form @submit.prevent="onSubmit" enctype="multipart/form-data">
    <b-container class="mx-5">
      <b-row>
        <b-col>
          <h2>Download Documentation Files</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <button @click="downloadDocZip" class="btn btn-default">
            download documentation zip
          </button></b-col
        >
      </b-row>

      <b-row>
        <b-col sm="*">{{ msg }}</b-col>
      </b-row>

      <b-row>
        <b-col>
          This will download a zip file of all documentation files.
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <h2><br>Upload Documentation Files (zipped)</h2>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-form-checkbox size="lg" id="overwrite" value="N"
            >Overwrite existing documentation data (otherwise add)
          </b-form-checkbox>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="pt-3 me-3">
          <input
            class="form-control"
            type="file"
            @change="onSelect"
            id="zipFile"
            accept=".zip"
          >
        </b-col>
      </b-row>
      <b-row>
        <b-col class="pt-3">
          <button
            @click="onSubmit"
            :disabled="submitDisabled"
            class="btn btn-default"
          >
            Upload file
          </button>
          &nbsp;&nbsp;{{ statusMsg }}
        </b-col>
      </b-row>
      <b-row
        ><b-col>
          <p class="bg-danger">{{ message }}</p>
        </b-col>
      </b-row>
      <b-row><b-col class="pb-5">&nbsp;</b-col></b-row>
    </b-container>
  </form>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";
export default {
  data() {
    return {
      RP_ID: "",
      RP_ID_confirm: "",
      msg: "",
      message: "",
      statusMsg: "",
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
      file1: null,
      overwrite: false,
      submitDisabled: true,
      fileSelected: false,
    };
  },

  created() {
    this.$bus.emit("titleUpdated", "Documentation Files");
  },
  methods: {
    async downloadDocZip() {
      try {
        this.message = "";
        this.msg = "";
        this.statusMsg = "Downloading";

        const url = this.$fileUrl + "/downloadDocZip/";
        const res = await axios.get(url, this.blobConfig);

        const blob = new Blob([res.data], { type: "application/zip" });

        var fileURL = window.URL.createObjectURL(blob);
        var fileLink = document.createElement("a");

        fileLink.href = fileURL;
        fileLink.setAttribute("download", "docs.zip");
        fileLink.setAttribute("processData", false);
        document.body.appendChild(fileLink);

        fileLink.click();
      } catch (e) {
        console.log("GNF223", e);
        this.msg = "download doc zip error " + e;
      }
    },
    onSelect() {
      this.fileSelected = true;
      this.submitDisabled = false;
    },
    async onSubmit() {
      this.submitDisabled = true;
      this.fileSelected = false;

      this.message = "";
      this.msg = "";
      this.statusMsg = "Uploading";

      const formData = new FormData();
      formData.append(
        "overwrite",
        this.$isCheckboxSelected("overwrite") ? "y" : "n"
      );

      const files = document.getElementById("zipFile").files;
      formData.append("file", files[0]);
      // console.log("ABF666",formData)

      try {
        await axios.post(
          this.$fileUrl + "/uploadDocZip/",
          formData,
          this.config
        );
        this.statusMsg = "File upload complete";

        setTimeout(() => {
          this.statusMsg = null;
        }, 3000);

        setTimeout(() => {
          this.$emit("uploadComplete");
        }, 1000);
      } catch (err) {
        this.message = err.message;
        if (err.message.includes("403")) this.msg = "Not authorised";
      }
    },
  },
};
</script>
