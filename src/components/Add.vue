<template>
  <div class="input-group mt-2">
    <input
      type="text"
      class="form-control"
      :class="variableClasses"
      placeholder="Enter name"
      :value="currentValue"
      @input="updateValue"
      @keydown.enter="save"
    >
    <div class="input-group-append ms-3">
      <button
        class="btn btn-outline-success"
        type="button"
        title="Add"
        @click="save"
      >
        <font-awesome-icon icon="fa-solid fa-square-plus" class="icon-lg" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {add} from "~/background/service";
import {defineComponent} from "vue";
import {findFolder} from "~/background/util";

export default defineComponent({
  emits: ["add"],
  data() {
    return {
      currentValue: "",
      variableClasses: {
        "is-valid": false,
        "is-invalid": false,
      },
    };
  },
  methods: {
    async save() {
      if (this.currentValue === "" || await this.isDuplicate()) {
        return;
      }
      const result = await add(this.currentValue);
      this.$emit("add", result);

      this.currentValue = "";
      this.variableClasses["is-valid"] = false;
      this.variableClasses["is-invalid"] = false;
    },
    async updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.currentValue = target.value;
      if (this.currentValue === "") {
        this.variableClasses["is-valid"] = false;
        this.variableClasses["is-invalid"] = false;
        return;
      }
      const isDuplicate = await this.isDuplicate();
      if (isDuplicate) {
        this.variableClasses["is-valid"] = false;
        this.variableClasses["is-invalid"] = true;
        return;
      }
      this.variableClasses["is-valid"] = true;
      this.variableClasses["is-invalid"] = false;
    },
    async isDuplicate() {
      const {customBarsId} = await chrome.storage.sync.get('customBarsId');
      const result = await findFolder(customBarsId, this.currentValue);
      return result.length > 0;
    },

  },
});
</script>

<style scoped>

</style>
