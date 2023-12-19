<template>
  <BInputGroup class="my-1">
    <BFormInput v-model="inputValue" trim spellcheck @keydown.enter="rename(barId, inputValue)" @focus="selectAll" />
    <BInputGroupAppend>
      <BButton style="width: 15vw" variant="outline-success" title="Save" @click="rename(barId, inputValue)">
        <font-awesome-icon icon="fa-solid fa-floppy-disk" size="lg" />
      </BButton>
      <BButton v-if="!isLast" style="width: 15vw" variant="outline-danger" title="Remove" @click="remove">
        <font-awesome-icon icon="fa-solid fa-trash-can" size="lg" />
      </BButton>
    </BInputGroupAppend>
  </BInputGroup>
</template>

<script lang="ts">
import { BButton, BFormInput, BInputGroup } from 'bootstrap-vue-next';
import { defineComponent } from 'vue';
import { renameBar } from '~/background/service.ts';

export default defineComponent({
  components: { BInputGroup, BFormInput, BButton },
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
    return { inputValue: this.initialValue };
  },
  methods: {
    async rename(id: string, value: string) {
      if (this.inputValue === '') {
        return;
      }
      await renameBar(id, value);
      this.$emit('rename', this.inputValue);
    },
    remove() {
      this.$emit('remove');
    },
    selectAll(event: Event) {
      const target = event.target as HTMLInputElement;
      target.select();
    },
  },
});
</script>
