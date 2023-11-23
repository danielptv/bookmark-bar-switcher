<template>
  <div class="input-group flex-nowrap mt-1 mb-1">
    <input
      id="validationCustom01"
      class="form-control"
      :class="style"
      type="text"
      :value="currentValue"
      spellcheck="true"
      @input="updateValue"
      @keydown.enter="edit(barId, currentValue)"
      @focus="selectAll"
    />
    <div class="input-group-append ms-2">
      <button class="btn btn-outline-success" type="button" title="Save" @click="edit(barId, currentValue)">
        <font-awesome-icon icon="fa-solid fa-floppy-disk" class="icon-md" />
      </button>
    </div>
    <div v-if="!isLast" class="input-group-append ms-2">
      <button class="btn btn-outline-danger" type="button" title="Remove" @click="edit(barId, currentValue)">
        <font-awesome-icon icon="fa-solid fa-trash-can" class="icon-md" @click="$emit('remove')" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { renameBar } from '~/background/service.ts';

export default defineComponent({
  props: {
    isLast: {
      type: Boolean,
      required: true,
    },
    barId: {
      type: String,
      required: true,
    },
    initialValue: {
      type: String,
      required: true,
    },
  },
  emits: ['rename', 'remove'],
  data() {
    return {
      currentValue: this.initialValue,
      style: {
        'is-valid': true,
        'is-invalid': false,
      },
    };
  },
  methods: {
    async edit(id: string, value: string) {
      if (this.currentValue === '') {
        return;
      }
      await renameBar(id, value);
      this.$emit('rename', this.currentValue);
    },
    updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.currentValue = target.value;
      if (this.currentValue === '') {
        this.style['is-valid'] = false;
        this.style['is-invalid'] = true;
        return;
      }
      this.style['is-valid'] = true;
      this.style['is-invalid'] = false;
    },
    selectAll(event: Event) {
      const target = event.target as HTMLInputElement;
      target.select();
    },
  },
});
</script>
