<script>
export default {
  props: ["class"],
  data() {
    return {
      myClass: "row",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <div :class="myClass"><slot></slot></div>
</template>
