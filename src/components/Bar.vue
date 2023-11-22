<template>
  <div class="btn-group w-100">
    <button :class="style" class="btn mt-1 mb-1" @click="$emit('exchange')" @dblclick="$emit('edit')">
      {{ title }}
    </button>
    <div class="btn-group-append mt-1 mb-1 ms-2">
      <button class="btn btn-outline-primary" type="button" title="Edit" @click="$emit('edit')">
        <font-awesome-icon icon="fa-solid fa-pen-to-square" class="icon-md" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
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
  data() {
    return {
      style: {
        'btn-secondary': true,
        'btn-primary': false,
        'cursor-default': false,
      },
    };
  },
  watch: {
    isActive: {
      immediate: true,
      handler(isActive) {
        if (isActive) {
          this.style['btn-primary'] = true;
          this.style['btn-secondary'] = false;
          this.style['cursor-default'] = true;
          return;
        }
        this.style['btn-primary'] = false;
        this.style['btn-secondary'] = true;
        this.style['cursor-default'] = false;
      },
    },
  },
});
</script>
