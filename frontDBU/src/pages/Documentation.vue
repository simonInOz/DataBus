<template>
  <table class="high">
    <tr class="aligntop">
      <td class="ps-3 ms-3 smoke pe-3" rowspan="2">
        <h2>Documentation</h2>
        <b-tree-view
        message-name="docData"
          :data="treeData"
        />
      </td>
      <td class="ps-3 pe-3">
        <div id="print-area">
          <h3>{{ head }}</h3>
          <Markdown class="md-body" :source="displayData" />
          <VueMermaidString
            v-if="bottomDiagram && bottomDiagram.length > 0"
            :value="bottomDiagram"
          />
        </div>
        <div v-if="canPrint && msg !== null && msg.length > 5">
          <a @click="printPage()" class="tinyLink">print page</a>
        </div>
      </td>
    </tr>
    <tr>
      <td><br><br></td>
    </tr>
  </table>
</template>
<script>
// eslint-disable-next-line no-unused-vars
//import { bTreeView } from "bootstrap-vue-treeview";
//import bTreeView from "../components/bTreeView.vue";
import axios from "axios";
import Markdown from "vue3-markdown-it";
import VueMermaidString from "vue-mermaid-string";

// import MarkdownItVue from "markdown-it-vue";
// import "markdown-it-vue/dist/markdown-it-vue.css";

// eslint-disable-next-line no-unused-vars
function pretty(s) {
  //remove ext
  const s1 = s.replace(/[0-9]+/, "");
  const s2 = s1.replace(/\.[^/.]+$/, "");
  const s3 = s2.replace(/_/g, " ");
  const s4 = s3.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
  return s4;
}

export default {
  components: { Markdown, VueMermaidString },
  data() {
    return {
      title: "",
      msg: null,
      head: "",
      displayData: "",
      canPrint: true,
      docos: [],
      bottomDiagram: "",

      treeData: [],
      config: {
        headers: { "x-access-token": localStorage.jwtToken },
      },
    };
  },

  async created() {
    this.$bus.emit("titleUpdated", "Documentation");

    this.$bus.off("docData")
      this.$bus.on("docData", (data) => {
        this.head = data.name;
      this.extractMermaid(this.docos[data.id]);
    });

    let url = this.$documentationUrl;
    try {
      const res = await axios.get(url, this.config);
      this.docos = [];
      for (let md in res.data.doco) {
        this.docos[md] = res.data.doco[md];
      }
      this.treeData = res.data.tree;
      // console.log("MGT334 tree", this.treeData)
    } catch (e) {
      this.msg = e;
    }
  },
  methods: {
    nodeSelect(node, selected) {
      const myNode = node;

      const myKey = myNode.$vnode.data.key;
      const myHead = pretty(myNode.$vnode.data.key); //can't seem to get the text, weirdly;
      // console.log("MJU777", myNode.$vnode.data, "key="+myKey, "head="+myHead, "selected="+selected);
      if (selected) {
        if (this.docos[myKey]) {
          this.head = myHead;

          //this.msg = marked(this.docos[myKey]);
          this.msg = this.docos[myKey];
          setTimeout(this.reload, 500);
        } else {
          this.msg = null;
          this.canEdit = false;
          if (myNode.children && myNode.$children.length > 0) {
            this.msg = "<ul>";
            for (let child of myNode.$children) {
              this.msg += "<li>" + child.$vnode.data.key + "</li>";
            }
            this.msg += "</ul>";
          }
        }
      }
    },
    nodeClick(nodeId) {
      //console.log("FHY382", nodeId);
    },
    reload() {
      this.msg = this.msg + "\n\n*Australian Payments Network &copy; 2023*";
    },
    async printPage() {
      // console.log("Print Page");
      const prtContent = document.getElementById("print-area");
      const WinPrint = window.open(
        "",
        "",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
      );
      WinPrint.document.write(prtContent.innerHTML);
      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    },
    extractMermaid(txt) {
      if (txt && typeof txt == "string" && txt.length>0) {
        const backTick = "```";
        let pos = txt.indexOf(backTick + "mermaid");
        if (pos > -1) {
          let endPos = txt.indexOf(backTick, pos + 10);
          if (endPos > -1) {
            this.displayData =
              txt.substring(0, pos) + txt.substring(endPos + 3);
            this.bottomDiagram = txt.substring(pos + 10, endPos).trim();
            return;
          }
        }
        this.displayData = txt;
        this.bottomDiagram = "";
      } else {
        this.displayData = "";
        this.bottomDiagram = "";
      }
    },
  },
  unmounted() {
    this.$bus.off("docData");
  },
};
</script>
<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css";
.tinyLink {
  font-size: x-small;
  cursor: pointer;
}
</style>
