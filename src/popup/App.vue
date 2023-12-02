<template>
  <main style="min-width: max-content" class="m-2">
    <BookmarksBars :added-bar="createdBar" />
    <Create class="mt-2" @create="create" />
  </main>
</template>

<script lang="ts">
import { BookmarksBar } from 'bookmarks';
import BookmarksBars from '~/components/BookmarksBars.vue';
import Create from '~/components/Create.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Create, BookmarksBars },
  data() {
    return { createdBar: {} };
  },
  methods: {
    create(bar: BookmarksBar) {
      this.createdBar = bar;
    },
  },
});
</script>
