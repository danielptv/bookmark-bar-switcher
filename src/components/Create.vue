<template>
  <BInputGroup class="mt-2">
    <BFormInput v-model="inputValue" trim spellcheck placeholder="Enter name" @keydown.enter="save" />
    <BInputGroupAppend>
      <BButton variant="outline-success" title="Add" @click="save">
        <font-awesome-icon icon="fa-solid fa-square-plus" class="icon-lg" />
      </BButton>
    </BInputGroupAppend>
  </BInputGroup>
</template>

<script lang="ts">
import { BButton, BFormInput, BInputGroup, BInputGroupAppend } from 'bootstrap-vue-next';
import { createBar } from '~/background/service.ts';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { BButton, BInputGroup, BFormInput, BInputGroupAppend },
  emits: ['create'],
  data() {
    return { inputValue: '' };
  },
  methods: {
    async save() {
      if (this.inputValue === '') {
        return;
      }
      const createdBar = await createBar(this.inputValue);
      this.$emit('create', createdBar);
      this.inputValue = '';
    },
  },
});
</script>
