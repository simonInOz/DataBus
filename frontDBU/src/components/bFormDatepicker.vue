<script>
export default {
  props: ["id", "name", "class", "disabled", "value", "title", "required"],
  data() {
    return {
      myId: null,
      myName: null,
      myClass: "form-control",
      myDisabled: false,
      myTitle: null,
      myRequired: false,
      myValue: null,
    };
  },
  created() {
    if (this.id) this.myId = this.id;
    if (this.name) this.myName = this.name;
    if (this.class) this.myClass += " " + this.class;
    if (this.disabled) this.myDisabled = this.disabled;
    if (this.title) this.myTitle = this.title;
    if (this.value) {
      if (typeof this.value == "string") {
        this.myValue = this.value.substring(0, 10);
      } else this.myValue = this.value;
    }
    if (
      typeof this.required == "string" &&
      this.required != "false" &&
      this.required != "yes"
    )
      this.myRequired = true;
    if (this.myRequired) this.myClass += " redBorder";
  },
};
</script>
<template>
  <input
    :id="id"
    :name="myName"
    type="date"
    :disabled="myDisabled"
    :class="myClass"
    :title="myTitle"
    :required="myRequired"
    :value="myValue"
  />
</template>
