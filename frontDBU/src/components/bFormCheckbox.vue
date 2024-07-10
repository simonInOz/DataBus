<script>
export default {
  props: ["id", "class", "size", "title", "unchecked-value", "value"],
  data() {
    return {
      myClass: "form-check-input",
    };
  },
  created() {
    if (this.class) this.myClass += " " + this.class;
  },
};
</script>

<template>
  <div>
    <input
      :id="id"
      type="checkbox"
      :class="myClass"
      :title="title"
      :checked="
        (uncheckedValue && uncheckedValue != value) ||
        (typeof value == 'boolean' && value) ||
        (typeof value == 'string' && value.toUpperCase().startsWith('Y'))
      "
    />
    <label :for="id" class="form-check-label">&nbsp;<slot></slot></label>
  </div>
</template>
