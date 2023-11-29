<template>
  <div>
    <div class="d-flex flex-column shadow p-2">
      <BookmarkBars :added-bar="passedBar" />
      <Create @create="create" />
    </div>
  </div>
</template>

<script lang="ts">
import { BookmarksBar } from 'bookmarks';
import BookmarksBars from '~/components/BookmarksBars.vue';
import Create from '~/components/Create.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Create, BookmarkBars: BookmarksBars },
  data() {
    return { passedBar: {} };
  },
  methods: {
    create(bar: BookmarksBar) {
      this.passedBar = bar;
    },
  },
});
</script>
