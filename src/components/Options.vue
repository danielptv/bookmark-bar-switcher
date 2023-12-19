<template>
  <BButton style="height: 20px" variant="outline-dark" class="d-flex align-items-center">
    <font-awesome-icon icon="fa-solid fa-gear" size="s" />
  </BButton>
</template>

<script lang="ts">
import { BButton } from 'bootstrap-vue-next';

import { defineComponent } from 'vue';

export default defineComponent({
  components: { BButton },
});
</script>
