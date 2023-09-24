<template>
  <div class="input-group flex-nowrap mt-1 mb-1">
    <input
      id="validationCustom01"
      class="form-control"
      :class="variableClasses"
      type="text"
      :value="currentValue"
      spellcheck="true"
      @input="updateValue"
      @keydown.enter="edit(barId, currentValue)"
      @focus="selectAll"
    >
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
import { findFolder, getCustomDirectoryId } from '~/background/util';
import { defineComponent } from 'vue';
import { rename } from '~/background/service';

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
      variableClasses: {
        'is-valid': true,
        'is-invalid': false,
      },
    };
  },
  methods: {
    async edit(id: string, value: string) {
      if ((await this.isDuplicate()) || this.currentValue === '') {
        return;
      }
      await rename(id, value);
      this.$emit('rename', this.currentValue);
    },
    async updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.currentValue = target.value;
      const isDuplicate = await this.isDuplicate();
      if (isDuplicate || this.currentValue === '') {
        this.variableClasses['is-valid'] = false;
        this.variableClasses['is-invalid'] = true;
        return;
      }
      this.variableClasses['is-valid'] = true;
      this.variableClasses['is-invalid'] = false;
    },
    selectAll(event: Event) {
      const target = event.target as HTMLInputElement;
      target.select();
    },
    async isDuplicate() {
      const customDirectoryId = await getCustomDirectoryId();
      const result = await findFolder(customDirectoryId, this.currentValue);
      return result.length > 0 && !result.includes(this.barId);
    },
  },
});
</script>
