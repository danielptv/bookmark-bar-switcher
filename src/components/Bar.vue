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
    <div class="btn-group-append my-1">
      <BButton style="width: 15vw" variant="outline-primary" title="Edit" @click="$emit('edit')">
        <font-awesome-icon icon="fa-solid fa-pen-to-square" size="lg" />
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
