<script>
export default {
  props: ["class", "sm", "md", "lg"],
  data() {
    return {
      myClass: "col",
    };
  },
  created() {
    if (this.sm) {
      if (
        this.sm == "*" //this.myClass = "col col-sm-6";
      );
      else this.myClass = "col col-sm-" + this.sm;
    }
    if (this.md) {
      if (
        this.md == "*" //this.myClass = "col col-md-6";
      );
      else this.myClass = "col col-md-" + this.md;
    }
    if (this.lg) {
      if (
        this.lg == "*" //this.myClass = "col col-lg-6";
      );
      else this.myClass = "col col-lg-" + this.lg;
    }

    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <div :class="myClass"><slot /></div>
</template>
