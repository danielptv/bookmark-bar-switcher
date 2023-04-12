<template>
  <div class="d-flex flex-column shadow p-2">
    <BookmarkBars :added-bar="passedBar" />
    <Add @add="(addedBar) => {passedBar = addedBar}" />
  </div>
</template>

<script lang="ts">
import Add from "~/components/Add.vue";
import BookmarkBars from "~/components/BookmarkBars.vue";
import {defineComponent} from "vue";

export default defineComponent({
  components: {Add, BookmarkBars},
  data() {
    return {passedBar: {}};
  },
});
</script>
