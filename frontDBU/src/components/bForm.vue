<script>
export default {
  props: ["class"],
  data() {
    return {
      myClass: "",
    };
  },
  created() {
    this.id = "chk" + Math.random();
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <form :class="myClass"><slot></slot></form>
</template>
