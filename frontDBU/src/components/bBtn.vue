<script>
export default {
  props: ["class", "size", "title", "variant", "pill"],
  data() {
    return {
      myClass: "btn",
    };
  },
  created() {
    if (this.variant) this.myClass += " btn-" + this.variant;
    else this.myClass += " btn-secondary";
    if (this.size) this.myClass += " btn-" + this.size;
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <button type="button" :class="myClass" :title="title"><slot></slot></button>
</template>
<style>
.btn {
  color:white;
  font-weight: bold !important;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-default {
  color: whitesmoke !important;
  background-color: #00b398 !important;
}

.btn-info{
  zcolor: whitesmoke !important;
}

.btn-warning{
  zcolor: whitesmoke !important;
}

.btn-default:hover {
  color: #ffffff;
  background-color: #00806d !important;
  border-color: #92542e !;
}
.btn:disabled {
  color: white;
  background-color: gray !important;
}
.btn-secondary:hover {
  background-color: DarkSlateGray !important;
}
.btn-warning:hover {
  background-color: gold !important;
}
</style>
