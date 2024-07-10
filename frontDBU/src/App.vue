<script setup>
import { RouterView } from "vue-router";

import TopBar from "./pages/TopBar.vue";
import Footer from "./pages/Footer.vue";
</script>

<template>
  <header>
    <TopBar />
  </header>
  <b-container id="main" fluid class="pt-1 p-0 smoke">
    <router-view />
  </b-container>
  <Footer />
</template>

<script>
export default {
  methods: {
    click() {
      alert("hello world");
    },
  },
};
</script>

<style>
/* AusPayNet colours */

/* 
.apn {
  web_turquiose: #00b398;
  web_dark_GREY: #3f4444;
  web_orange: #ff3300;
  web_light_warm_grey: #cccccc;
  web_aubergine: #3e1151;
  web_serenity: #9999cc;
  web_light_turquiose: #99cccc;
}
*/

.menuSelected {
  background-color: #9999cc !important;
}
.white {
  color: white !important;
  background-color: #9999cc !important;
}
.menuUnselected {
  /* default - color does not actually do anything */
  color: black;
}

h2 {
  font-size: 30px !important;
  margin-top: 7px !important;
  margin-bottom: 7px !important;
}

.nowrap {
  white-space: nowrap;
}

.shadow {
  color: #bcc6cc !important;
}
.red {
  /* test */
  background-color: red !important;
}
.green {
  /* test */
  background-color: green !important;
}
.greenText {
  /* test */
  color: white !important;
  background-color: green !important;
}
.icongreen {
  color: #00b398 !important;
}
.iconred {
  color: #ff3300 !important;
}
.pink {
  /* test */
  background-color: pink !important;
}
.orange {
  background-color: orange !important;
}
.blue {
  /* test */
  background-color: blue !important;
}
.purple {
  /* test */
  background-color: purple !important;
}
.boldText {
  font-weight: bold;
}
.redText {
  color: #ff3300 !important;
  text-shadow: 1px 1px#3e1151 !important;
}
.redTextNormal {
  color: #ff3300 !important;
}
.inactive{
  font-weight: bold;
  font-style: italic;
  background-color: gray !important;
  color: white  !important;
}
.merging{
  font-weight: bold;
  font-style: italic;
  background-color: #99cccc !important;
  color: white  !important;
}
.merged{
  font-weight: bold;
  background-color: #9999cc !important;
}

.tiny {
  font-size: 8px;
}
.smallText {
  font-size: 0.6em !important;
}
.smoke {
  background-color: #efefef;
}
.gainsboro {
  background-color: gainsboro;
}
.high {
  height: 90vh;
}
.aligntop {
  vertical-align: top;
}
.alignright {
  text-align: right;
}
.dangerAlert {
  background-color: orange;
  margin-left: 10px;
  padding: 10px;
}
.infoAlert {
  background-color: grey;
  margin-left: 10px;
  padding: 10px;
}
select {
  margin: 0px 0px 5px 0px !important;
}
.black-text {
  color: black !important;
}
.text-black-text {
  color: black !important;
}
.narrow {
  max-width: 50px !important;
}
.narrowish {
  max-width: 75px !important;
}
.mediumWide {
  min-width: 150px !important;
}
.mediumishWide {
  min-width: 180px !important;
}
.squeezeTight {
  overflow-wrap: break-word !important;
  max-width: 100px !important;
}
.wideTD {
  overflow-wrap: break-word !important;
  width: 20px;
}
.squeeze {
  overflow-wrap: break-word !important;
  max-width: 150px !important;
}
.squeezeMild {
  overflow-wrap: break-word !important;
  max-width: 200px !important;
}
.squeezeMedium {
  overflow-wrap: break-word !important;
  max-width: 300px !important;
}
.squeezeSlight {
  overflow-wrap: break-word !important;
  max-width: 400px !important;
}
.squeezeWider {
  overflow-wrap: break-word !important;
  width: 400px !important;
}
.squeezeWide {
  overflow-wrap: break-word !important;
}
.narrow {
  width: 100px;
}
.centre {
  text-align: center;
}
.tableft {
  float: left !important;
  background-color: red !important;
}
.tabright {
  float: right !important;
}
.date-narrow {
  width: 175px;
  overflow-wrap: break-word;
}
.italic {
  font-style: italic;
}
#popUpBox1 {
  width: 750px;
  max-height: 600px;
  overflow: auto;
  background: white;
  box-shadow: 0 0 10px black;
  border-radius: 10px;
  animation: fadeInAnimation ease-in-out 0.5s;
  padding: 10px;
  text-align: left;
}
@keyframes fadeInAnimation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fadeOutAnimation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.redBorder {
  border-color: red !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.slide-leave-active,
.slide-enter-active {
  transition: 1s;
}
.slide-enter {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(-100%, 0);
}
.nowrap {
  white-space: nowrap;
}
.indent {
  margin-left: 50px;
  margin-top: 20px;
  line-height: 3ex;
}
button {
  color: white;
  background-color: rgb(0, 179, 152);
  padding: 5px;
  font-size: 100%;
  border: 1px solid gray;
  border-radius: 6px !important;
}
button:hover {
  transition: 0.3s;
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24), 0 17px 50px 0 rgba(0, 0, 0, 0.19);
}

.custom-nav {
  -webkit-box-shadow: 0px 3px 6px 2px #cccccc;
  -moz-box-shadow: 0px 3px 6px 2px #cccccc;
  /* box-shadow h-offset(px) v-offset(px) blur(px) spread(px) color */
  box-shadow: 0px 3px 3px 2px #cccccc;
  background-color: #f8f9fa !important;
  padding: 0 0 0 0;
  margin: 0 0 0 0;
  width: 100%;
}
.menuLink {
  color: rgb(124, 124, 124);
  font-size: 20px;
  text-decoration: none;
}
.menuLink:hover {
  color: black;
  /* background-color: rgb(153, 204, 204); */
}
.link {
  color: #00b398;
  font-size: 20px;
  text-decoration: none;
}
.link:hover {
  color: black;
  font-weight: bold;
}
.dropdowndivider {
  height: 5px;
}
body {
  font-family: Roboto Condensed, Helvetica Neue, Helvetica, Arial, sans-serif !important;
  font-size: 18px !important;
  padding: 0 0 0 0;
  margin: 0 0 0 0;
}
.hiddenMenu {
  display: none;
  background-color: white;
  border-style: solid;
  border-width: 1px;
  border-color: gray;
}
/* matched size=30 in INPUT */
.size30 {
  width: 247px;
}

h2 {
  font-weight: 100;
}
.dropdownButton {
  padding-top: 1px;
  height: 25px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
}

.downloadProgress {
  text-align: center;
  color: white;
  background-color: #99cccc; 
}
.linkButton {
  color: #00b398 !important;
  font-size: 20px !important;
  font-weight: normal !important;
}
.linkButton:hover {
  color: white !important;
  font-size: 20px !important;
}
.wideDropdown {
  min-width: 250px !important;
}
.dropLink a {
  font-size: 14t;
  font-weight: 500;
  margin-left: 5px;
  color: gray;
  text-decoration: none;
}
.dropLink a:hover {
  color: black;
}
.dropdownDivider {
  height: 1px;
  background-color: #adb5bd;
}
.ddi {
  padding-left: 10px !important;
  padding-bottom: 5px !important;
  padding-top: 5px !important;
}
.ddiZero {
  padding-left: 0px !important;
  padding-bottom: 0px !important;
  padding-top: 0px !important;
}
.dropsquare {
  height: 25px;
  width: 25px;
}
.smallText{
  font-size: 10pt;
}
.centreText{
  text-align: center;
}
.dashmenu {
  font-size: 18px;
  font-weight: normal;
  color: gray;
  padding-left: 5px;
  padding-right: 5px;
  height: 50px;
  padding-top: 12px;
  text-decoration: none;
}
.dashmenu:hover {
  font-weight: normal;
  color: white;
  background-color: #99cccc !important;
  transition: 0.3s;
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
    0 17px 50px 0 rgba(0, 0, 0, 0.19);
  z-index: 33;
}
.thinBorder{
  border-color: lightgray;
  border-style: solid;
  border-radius: 10px;
  background-color: white;
}
#grad {
  background-image: linear-gradient(to bottom right, #cccccc,#99cccc );
}
.jumpy:hover {
  font-size: 10pt;
  animation-name: jump;
  animation-delay: 10s;
  animation-duration: 10s;
  animation-iteration-count: infinite;
}
@keyframes jump {
  from {
  }
  to {
    transform: rotateY(360deg);
  }
}
.spinny:hover {
  animation-name: spin;
  animation-delay: 5s;
  animation-duration: 6s;
  animation-iteration-count: 2;
  animation-direction: alternate;
}
@keyframes spin {
  from {
  }
  to {
    transform: translate(500px , 300px) scale(5, 5) rotateX(360deg) rotateY(360deg) rotateZ(360deg);
  }
}
</style>
