<script>
export default {
  props: ["class", "to"],
  data() {
    return {
      myClass: "link",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <router-link :to="to" :class="myClass"><slot></slot></router-link>
</template>
