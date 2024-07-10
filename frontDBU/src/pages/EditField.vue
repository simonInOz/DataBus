<template>
  <b-col v-if="name != 'id'" sm="5">
    <div v-if="name == 'zFI_ID' && table == 'FI_Details'">
      {{ val }}
    </div>
    <div v-else>
      <b-form-checkbox
        v-if="type == 'chk'"
        :id="name"
        :value="newVal"
        size="lg"
        :title="name"
        unchecked-value="No"
      />
      <b-input
        v-if="type == 'text'"
        :id="name"
        :name="name"
        :value="newVal"
        :disabled="disabled"
        autocomplete="off"
        :required="required == 'true'"
        :title="name + (required == 'true' ? ' (required)' : '')"
        :class="required == 'true' ? 'redBorder' : ''"
        :onkeyup="onkeyup"
      />
      <b-form-textarea
        v-if="type == 'textarea'"
        :id="name"
        :name="name"
        :value="newVal"
        :disabled="disabled"
        autocomplete="off"
        :required="required == 'true'"
        :title="name"
        :class="required == 'true' ? 'redBorder' : ''"
        :rows="6"
      />
      <b-form-datepicker
        v-if="type == 'date'"
        :id="name"
        :name="name"
        :value="newVal"
        :title="name"
        :value-as-date="true"
      />
      <b-select
        v-if="type == 'select'"
        :id="name"
        :value="newVal"
        size="lg"
        :title="name"
        :options="options"
      />
      <b-input
        v-if="override=='true'"
        :id="name + '_override'"
        :title="'Set '+name+' to special name (for stats)'"
      />
    </div>
  </b-col>
</template>

<script>
export default {
  name: "EditField",
  props: [
    "name",
    "val",
    "type",
    "op",
    "table",
    "options",
    "disabled",
    "required",
    "override",
    "onkeyup"
  ],
  data() {
    return {
      message: null,
      newVal: null,
    };
  },
  created() {
    //console.log("NBV666 EditField", this.name, this.type)
    this.newVal = this.val;
    if (this.type == "date" && this.newVal != null)
      this.newVal = this.newVal.replaceAll("/", "-");
  },
  methods: {
    async changeVal(e) {
      this.$parent.changeVal(e);
    },
  },
};
</script>
