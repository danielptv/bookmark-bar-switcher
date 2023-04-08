<template>
  <button
    :class="variableClasses"
    class="btn mt-1 mb-1"
    value="{{title}}"
  >
    {{ title }}
  </button>
</template>

<script lang="ts">

import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    currentBarTitle: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      variableClasses: {
        "btn-secondary": true,
        "btn-primary": false,
        "cursor-default": false,
      },
    };
  },
  watch: {
    currentBarTitle: {
      immediate: true,
      handler(currentTitle) {
        if (currentTitle === this.title) {
          this.variableClasses["btn-primary"] = true;
          this.variableClasses["btn-secondary"] = false;
          this.variableClasses["cursor-default"] = true;
          return;
        }
        this.variableClasses["btn-primary"] = false;
        this.variableClasses["btn-secondary"] = true;
        this.variableClasses["cursor-default"] = false;
      },
    },
  },
});

</script>
