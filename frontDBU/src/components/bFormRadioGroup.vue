<script>
export default {
  props: ["class", "sm", "lg", "options", "name", "value", "label"],
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
  <div class="gainsboro ps-2">
    <b>{{label}}</b><span v-for="opt in options" v-bind:key="opt">
      <div :id="name" class="form-check form-check-inline">
        <input
          v-if="value == opt || (opt.value && value == opt.value)"
          :name="name"
          type="radio"
          checked
          :class="myClass"
          :value="opt.value ? opt.value : opt"
        />
        <input
          v-else
          :name="name"
          type="radio"
          :class="myClass"
          :value="opt.value ? opt.value : opt"
        />
        <label class="form-check-label">{{ opt.text ? opt.text : opt }}</label>
      </div>
    </span>
  </div>
</template>
