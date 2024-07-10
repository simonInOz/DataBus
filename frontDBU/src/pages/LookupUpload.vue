 <template>
   <LookupFileUpload @uploadComplete="uploadComplete($event)" />
 </template>
 
<script>
import LookupFileUpload from "../pages/LookupFileUpload.vue";

export default {
  name: "Upload",
  components: {
    LookupFileUpload,
  },
  data() {
    return {
      filter: "current",
      items: [],
    };
  },
  methods: {
    uploadComplete() {
      this.$refs.itemsDisplay.refreshData();
    },
  },
};
</script>
