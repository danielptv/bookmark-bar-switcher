<template>
  <div v-if="!showSettings">
    <div class="d-flex flex-column shadow p-2">
      <BookmarkBars :added-bar="passedBar" />
      <Add
        @show-settings="toggleSettings"
        @add="
          (addedBar) => {
            passedBar = addedBar;
          }
        "
      />
    </div>
  </div>
  <WorkspaceSettings v-else @show-settings="toggleSettings" />
</template>

<script lang="ts">
import Add from '~/components/Add.vue';
import BookmarkBars from '~/components/BookmarkBars.vue';
import WorkspaceSettings from '~/components/workspace/index.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Add, BookmarkBars, WorkspaceSettings },
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
