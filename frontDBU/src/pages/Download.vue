 <template>
   <div>
     <h2>Download</h2>
     <button @click="downloadWithAxios('test.txt', 'testabcd.txt')">
       Download file with Axios
     </button>
   </div>
 </template>
 
<script>
import axios from "axios";

export default {
  methods: {
    forceFileDownload(dest, response) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", dest);
      document.body.appendChild(link);
      link.click();
    },

    downloadWithAxios(src, dest) {
      const url = localStorage.downloadUrl + "/" + src;
      axios({
        method: "get",
        url: url,
        responseType: "arraybuffer",
      })
        .then((response) => {
          this.forceFileDownload(dest, response);
        })
        .catch((err) => console.log("CSG665 Download error occured " + err));
    },
  },
};
</script>
