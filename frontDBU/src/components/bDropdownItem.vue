<script>
export default {
  props: ["class"],
  data() {
    return {
      myClass: "dropdown-item ddi",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <li :class="myClass"><slot></slot></li>
</template>