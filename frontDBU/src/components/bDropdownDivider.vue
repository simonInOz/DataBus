<script>
export default {
  props: ["class"],
  data() {
    return {
      myClass: "dropdown-item",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <li class="dropdownDivider"></li>
</template>
