<script>
export default {
  props: ["class", "size", "variant", "text"],
  data() {
    return {
      id: null,
      myText: null,
      myClass: "btn btn-default dropdown-toggle",
    };
  },
  created() {
    //generate id
    this.id = "menuZ" + Math.random();
    if (this.text) this.myText = this.text;
    if (typeof this.size == "string" && this.size.length > 0)
      this.myClass += " btn-" + this.size;
    if (this.class) this.myClass += " " + this.class;
  },
  methods: {
    showMenu(id) {
      this.clearMenus();
      let menu = document.getElementById(id);
      menu.style.display = "block";
    },
    clearMenu(id) {
      let menu = document.getElementById(id);
      menu.style.display = "none";
    },
    clearMenus() {
      let menus = document.getElementsByName("menuZ");
      for (let menu of menus) {
        menu.style.display = "none";
      }
    },
  },
};
</script>

<template>
  <div class="dropdown">
    <button
      :class="myClass"
      type="button"
      :id="id"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      {{ myText }}
    </button>
    <ul class="dropdown-menu" :aria-labelledby="id">
      <slot />
    </ul>
  </div>
</template>
