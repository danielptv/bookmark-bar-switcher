<template>
  <div id="myModal" class="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Remove bookmarks bar?</h5>
        </div>
        <div class="modal-body">
          <b>"{{ title }}"</b> will be removed permanently.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" @click="handleRemove">Remove</button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="
              () => {
                if (modal) modal.hide();
              }
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Modal } from 'bootstrap';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: { type: String, required: true },
    id: { type: String, required: true },
    index: { type: Number, required: true },
    modal: { type: Modal, required: true },
  },
  emits: ['confirmRemove'],
  methods: {
    handleRemove() {
      this.$emit('confirmRemove');
      if (this.modal) {
        this.modal.hide();
      }
    },
  },
});
</script>
