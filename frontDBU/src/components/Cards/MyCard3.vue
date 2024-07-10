<template>
  <table :id="id" :class="boxClass" :style="actualMinWidth + ' ' + actualMaxWidth">
    <tr>
      <th :class="'cardboxth ' + titleClass">{{ title }}</th>
    </tr>
    <tr v-if="header">
      <td class="header">{{ header }}</td>
    </tr>
    <tr class="cardboxtr" v-for="item in bodyList" :key="item">
      <td class="cardboxtd">{{ item }}</td>
    </tr>
    <tr class="cardboxtr" v-if="bodyArray && bodyArray.length > 0">
      <td>
        <b-table :id="'Card3_table_' + id" :items="bodyArray" :fields="bodyFields" class="tableFullWidth">
          <template #Date="data">
            <router-link title="more" v-if="data.value.includes('to:')" :to="getLink(data.value)" class="link">
              {{ getText(data.value) }}
            </router-link>
            <a href="#" @click="onClick(getLink(data.value))" v-else-if="data.value.includes('msg:')" class="link">{{
              getText(data.value)
            }}</a>
            <span v-else>{{ data.value }}</span>
          </template>
          <template #action="data"
            ><b-btn class="btn btn-default" @click="this.$bus.emit('cardAction', data)"
              >{{ cardActionButtonText }}
            </b-btn></template
          >
        </b-table>
      </td>
    </tr>
    <tr class="cardboxtr" v-if="linkText">
      <td class="m-1 ps-2">
        <router-link :to="link" class="link">{{ linkText }}</router-link>
      </td>
    </tr>
    <tr v-if="footer">
      <td class="footer">{{ footer }}</td>
    </tr>
    <tr>
      <td class="footer">{{ msg }}</td>
    </tr>
  </table>
</template>
<script>
export default {
  name: "card",
  props: [
    "id",
    "title",
    "titleClass",
    "header",
    "bodyList",
    "bodyArray",
    "bodyFields",
    "footer",
    "borderArray",
    "linkText",
    "link",
    "minWidth",
    "maxWidth",
    "cardActionButtonText",
  ],
  data() {
    return {
      msg: "",
      boxClass: "cardbox",
      actualMinWidth: "min-width: 200px;",
      actualMaxWidth: "",
    };
  },
  methods: {
    getText(s) {
      let pos = s.indexOf("to:");
      if (pos == -1) pos = s.indexOf("msg:");
      if (pos == -1) return s;
      return s.substring(0, pos).trim();
    },
    getLink(s) {
      let pos = s.indexOf("to:");
      if (pos == -1) pos = s.indexOf("msg:");
      if (pos == -1) return "";
      pos = s.indexOf(":");
      return s.substring(pos + 1).trim();
    },
    setWidth() {
      if (this.minWidth) {
        this.actualMinWidth = "min-width: " + this.minWidth + ";";
      }
      if (this.maxWidth) {
        this.actualMaxWidth = "max-width: " + this.maxWidth + ";";
      }
    },
    //currently used only for newer/older statistics on home.vue 2024/6/13
    onClick(data) {
      this.$bus.emit(data, "-");
    },
  },
  created() {
    this.setWidth();
  },
};
</script>
<style>
.cardbox {
  border-radius: 10px;
  background-color: whiteSmoke;
  padding: 0px;
  margin: 0px;
  box-shadow: 3px 3px 2px 1px darkgray;

  animation-name: gentle;
  animation-duration: 0.3s;
  animation-iteration-count: 1;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
}
@keyframes gentle {
  from {
    transform: scale(0.1, 0.1);
  }
  to {
    transform: scale(1, 1);
  }
}
.cardboxth {
  border-radius: 10px 10px 0px 0px;
  color: white;
  background-color: #99cccc; /* web_light_turquiose*/
  text-align: center;
  height: 25px;
  font-size: 20px;
  text-shadow: 2px 2px darkgray;
}
.cardbox .header {
  font-size: 14px;
  font-style: italic;
  padding-left: 5px;
  text-shadow: 2px 2px #cccccc;
  height: 28px;
}
.cardbox .footer {
  font-size: 14px;
  padding-left: 5px;
  padding-bottom: 3px;
}
.cardboxtd {
  padding-left: 5px;
  padding-right: 3px;
  height: 10px;
}
.cardboxtr {
  vertical-align: top;
}
</style>
