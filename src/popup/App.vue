<template>
  <main style="min-width: max-content" class="m-2">
    <div class="d-flex flex-column">
      <BookmarksBars :added-bar="createdBar" />
      <Create class="mt-2" @create="create" />
      <Options class="mt-2 align-self-end" style="width: 15vw" />
    </div>
  </main>
</template>

<script lang="ts">
import { BookmarksBar } from 'bookmarks';
import BookmarksBars from '~/components/BookmarksBars.vue';
import Create from '~/components/Create.vue';
import Options from '~/components/Options.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Create, BookmarksBars, Options },
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
