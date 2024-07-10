<script>
export default {
  props: ["messageName", "class", "data", "depth", "parent", "parentItem"],
  data() {
    return {
      myClass: "",
      myDepth: "",
      myMessageName: "treeview",
    };
  },
  methods: {
    treeopen(item, data) {
      this.treecloseall(data);
      item.open = "y";
    },
    treeclose(item) {
      item.open = "n";
    },
    treecloseparent() {
      // eslint-disable-next-line vue/no-mutating-props
      if (this.parent) this.parent.open = "n";
      if (this.parentItem) this.parentItem.treecloseparent();
    },
    treecloseall(data) {
      for (let md of data) md.open = "n";
    },
    treeshow(item) {
      this.$bus.emit(this.myMessageName, item);
    },
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
    if (this.depth) this.myDepth += this.depth;
    if (this.messageName) this.myMessageName = this.messageName;
  },
};
</script>

<template>
  <ul class="dropdown-menu show">
    <span v-for="md in data" v-bind:key="md">
      <li
        class="dropdown-item"
        v-if="md.id"
        @click="
          treeshow({ id: md.id, name: md.name });
          if (!md.children) treecloseparent();
        "
      >
        <a href="#" class="link black">
          {{ depth }}{{ md.name.trim() }}
          <b-icon
            v-if="md.children && md.open == 'y'"
            icon="arrow-down-circle-fill"
            @click="treeclose(md)"
          ></b-icon>
          <b-icon
            v-if="md.children && md.open != 'y'"
            icon="arrow-right-circle-fill"
            @click="treeopen(md, data)"
          ></b-icon>
        </a>
      </li>
      <b-tree-view
        v-if="md.children && md.open == 'y'"
        :messageName="myMessageName"
        :parent="md"
        :parentItem="this"
        :data="md.children"
        :class="myClass"
        :depth="myDepth + '&nbsp;&nbsp;'"
      ></b-tree-view>
    </span>
  </ul>
</template>
<style>
.black {
  color: black !important;
}
.treeItem {
  max-width: 100px !important;
  word-wrap: break-word;
}
</style>
