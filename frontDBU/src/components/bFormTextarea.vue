<script>
export default {
  props: [
    "id",
    "name",
    "class",
    "size",
    "type",
    "rows",
    "disabled",
    "value",
    "title",
    "autocomplete",
    "required",
  ],
  emits: ["update:modelValue"],
  data() {
    return {
      myId: null,
      myName: null,
      myClass: "form-control",
      myType: "text",
      myRows:"6",
      myDisabled: false,
      myTitle: null,
      myAutocomplete: true,
      myRequired: false,
      myValue: null,
    };
  },
  created() {
    if (this.id) this.myId = this.id;
    if (this.name) this.myName = this.name;
    if (this.size) this.myClass += " form-control-" + this.size;
    if (this.class) this.myClass += " " + this.class;
    if (this.type) this.myType = this.type;
    if (this.disabled) this.myDisabled = this.disabled;
    if (this.rows) this.myRows = this.rows;
    if (this.title) this.myTitle = this.title;
    if (
      typeof this.autocomplete == "string" &&
      this.autocomplete != "true" &&
      this.autocomplete != "on"
    )
      this.myAutocomplete = false;
    if (
      typeof this.required == "string" &&
      this.required != "false" &&
      this.required != "yes"
    )
      this.myRequired = true;
    if (this.value) this.myValue = this.value;

    // console.log(
    //   "NGR123 bInput",
    //   "name=" + this.myName,
    //   "disabled=" + this.myDisabled,
    //   "type=" + this.myType
    // );
  },
};
</script>

<template>
  <textarea
    :id="myId"
    :name="myName"
    :type="myType"
    :disabled="myDisabled"
    :class="myClass"
    :title="myTitle"
    :autocomplete="myAutocomplete"
    :required="myRequired"
    :value="myValue"
    :rows="myRows"
    style="background-color: #F8F8F8"
  ></textarea>
</template>
