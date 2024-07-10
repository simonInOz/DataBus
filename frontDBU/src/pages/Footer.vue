<template>
  <div class="footer no-print">
    <span
      >Copyright © 2023&nbsp;Australian Payments Network Limited. All rights reserved.&nbsp; Read&nbsp;full&nbsp;
      <a
        data-entity-type="file"
        href="https://www.auspaynet.com.au/sites/default/files/inline-files/AusPayNet%20-%20Website%20Terms%20of%20Use%20-%2025Aug2017.pdf"
        target="_blank"
        title="Australian Payments Network - Website Terms of Use - 25 August 2017"
        >Terms&nbsp;of&nbsp;Use</a
      >.
      <a
        data-entity-type="file"
        href="https://www.auspaynet.com.au/sites/default/files/inline-files/Privacy%20Policy.pdf"
        target="_blank"
        title="Australian Payments Network - Privacy Policy"
        >Privacy Statement</a
      >.<br />
      Australian Payments Network <sup>®</sup> and AusPayNet <sup>®</sup> are registered trademarks of Australian Payments Network
      Limited.
    </span>
  </div>
</template>

<style scoped>
.footer {
  color: #838383;
  background-color: #000000 !important;
  font-size: small;
  line-height: 1.4;
  padding-left: 10px;

  position: fixed;
  bottom: 0;
  height: 40px;
  width: 100%;
  min-height: 40px;
}
.footer span {
  position: fixed;
  bottom: 0;
  padding-bottom: 1px;
}
.footer a {
  color: #838383;
  text-decoration: none;
}
.footer a:hover {
  text-decoration: underline;
}
@media print {
  .no-print,
  .no-print * {
    display: none !important;
  }
}
</style>
