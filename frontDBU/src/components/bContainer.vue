<script>
export default {
  props: ["class", "fluid"],
  data() {
    return {
      myClass: "container",
    };
  },
  created() {
    if (typeof this.fluid == "string") {
      this.myClass = "container-fluid";
    }
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <div :class="myClass"><slot></slot></div>
</template>
