<script>
export default {
  props: ["class", "icon"],
  data() {
    return {
      myClass: null,
    };
  },
  created() {
    this.myClass = "bi bi-" + this.icon;
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <i :class="myClass"></i>
</template>
