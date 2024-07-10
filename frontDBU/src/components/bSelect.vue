<script>
export default {
  props: [
    "id",
    "name",
    "class",
    "options",
    "title",
    "size",
    "required",
    "value",
  ],
  data() {
    return {
      myId: null,
      myName: null,
      myClass: "custom-select form-select",
      myTitle: null,
      myRequired: false,
      myValue: null,
    };
  },
  created() {
    if (this.id) this.myId = this.id;
    if (this.name) this.myName = this.name;
    if (this.size) this.myClass += "-" + this.size;
    if (this.class) this.myClass += " " + this.class;
    if (this.title) this.myTitle = this.title;
    if (typeof this.required == "string" && this.required != "false")
      this.myRequired = true;
    if (this.value) this.myValue = this.value;

    // console.log("NGR123 bSelect", "name=" + this.myName);
  },
};
</script>

<template>
  <select
    :id="myId"
    :name="myName"
    :class="myClass"
    :title="myTitle"
    :required="myRequired"
    :value="myValue"
  >
    <option
      v-for="opt in options" :key="opt"
      :value="typeof opt == 'string' ? opt : opt.value"
    >
      {{ typeof opt == "string" ? opt : opt.text }}
    </option>
  </select>
</template>
