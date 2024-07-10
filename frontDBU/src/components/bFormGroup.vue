<script>
export default {
  props: ["label", "labelCols", "class"],
  data() {
    return {
      myClass: "",
      myLabelCols: "col-sm-3",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;

    if (typeof this.labelCols == "string")
      this.mylabelCols = "col-sm-" + this.labelCols;
  },
};
</script>

<template>
  <div :class="container">
    <div class="row">
      <div :class="myLabelCols">
        <label :class="myClass">{{ label }}</label>
      </div>
      <div class="col-sm-5"><slot></slot></div>
    </div>
  </div>
</template>
