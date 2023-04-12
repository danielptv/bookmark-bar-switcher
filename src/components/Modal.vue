<template>
  <div id="myModal" class="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Remove bookmark bar?
          </h5>
        </div>
        <div class="modal-body">
          <b>"{{ title }}"</b> will be removed permanently.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" @click="handleRemove">
            Remove
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="() => { if(modal) modal.hide() }"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Modal} from "bootstrap";
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    title: {type: String},
    id: {type: String},
    index: {type: Number},
    modal: {type: Modal},
  },
  emits: ["confirmRemove"],
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
