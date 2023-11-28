<template>
  <BButtonGroup>
    <BButton
      :class="isActive ? 'cursor-default' : ''"
      :variant="isActive ? 'primary' : 'secondary'"
      class="mt-1 mb-1"
      @click="$emit('exchange')"
      @dblclick="$emit('edit')"
    >
      {{ title }}
    </BButton>
    <div class="btn-group-append mt-1 mb-1 ms-2">
      <BButton variant="outline-primary" title="Edit" @click="$emit('edit')">
        <font-awesome-icon icon="fa-solid fa-pen-to-square" class="icon-md" />
      </BButton>
    </div>
  </BButtonGroup>
</template>

<script lang="ts">
import { BButton, BButtonGroup } from 'bootstrap-vue-next';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { BButton, BButtonGroup },
  props: {
    title: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['exchange', 'edit'],
});
</script>
