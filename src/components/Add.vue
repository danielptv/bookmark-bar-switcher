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
      <button class="btn btn-outline-success" type="button" title="Add" @click="save">
        <font-awesome-icon icon="fa-solid fa-square-plus" class="icon-lg" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { createBar } from '~/background/service';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Add',
  emits: ['add', 'show-settings'],
  data() {
    return {
      currentValue: '',
      variableClasses: {
        'is-valid': false,
        'is-invalid': false,
      },
    };
  },
  methods: {
    async save() {
      if (this.currentValue === '') {
        return;
      }
      const result = await createBar(this.currentValue);
      this.$emit('add', result);
      this.currentValue = '';
      this.variableClasses['is-valid'] = false;
      this.variableClasses['is-invalid'] = false;
    },
    updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.currentValue = target.value;

      if (this.currentValue === '') {
        this.variableClasses['is-valid'] = false;
        this.variableClasses['is-invalid'] = false;
        return;
      }
      this.variableClasses['is-valid'] = true;
      this.variableClasses['is-invalid'] = false;
    },
  },
});
</script>
