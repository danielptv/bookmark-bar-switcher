<template>
  <div v-if="!showSettings" class="d-flex flex-column shadow p-2">
    <BookmarkBars :added-bar="passedBar" />
    <Add
      v-show="!showSettings"
      @showSettings="toggleSettings"
      @add="
        (addedBar) => {
          passedBar = addedBar;
        }
      "
    />
  </div>
  <WorkspaceLink v-else :bars="passedBar" @showSettings="toggleSettings" />
</template>

<script lang="ts">
import Add from '~/components/Add.vue';
import BookmarkBars from '~/components/BookmarkBars.vue';
import WorkspaceLink from '~/components/WorkspaceLink.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Add, BookmarkBars, WorkspaceLink },
  data() {
    return {
      passedBar: {},
      showSettings: false,
    };
  },
  methods: {
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
  },
});
</script>
