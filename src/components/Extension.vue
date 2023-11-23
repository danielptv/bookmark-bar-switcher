<template>
  <div>
    <div class="d-flex flex-column shadow p-2">
      <BookmarkBars :added-bar="passedBar" />
      <Create
        @create="
          (addedBar) => {
            passedBar = addedBar;
          }
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import BookmarkBars from '~/components/BookmarkBars.vue';
import Create from '~/components/Create.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Create, BookmarkBars },
  data() {
    return { passedBar: {} };
  },
});
</script>
