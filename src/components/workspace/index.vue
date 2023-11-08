<template>
  <div class="m-4">
    <div class="ms-2 my-4">
      <span class="btn-link cursor-pointer text-decoration-none" @click="toggleSettings">
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="me-4" />Back to Bookmarks
      </span>
    </div>
    <hr>
    <div v-if="workspaces.length > 0">
      <table style="width: 100%">
        <tr>
          <th>Workspace</th>
          <th>Bar</th>
        </tr>
        <tr v-for="ws in workspaces" :key="ws.workspaceId">
          <td>{{ ws.workspaceName }}</td>
          <td>
            <SelectBar :workspace="ws" :custom-bars="bars" @set-bar="linkWorkspace" />
          </td>
        </tr>
      </table>
    </div>
    <div v-else class="alert alert-info">
      <p>No workspaces found.</p>
      <p>Switch through each Workspace once, to update the list.</p>
    </div>
  </div></template>

<script lang="ts">
import { BookmarkTreeNode, SyncedWorkspaceEntry } from '~/background/classes';
import { getWorkspaceList, updateWorkspacesList } from '~/background/storage';
import SelectBar from '~/components/workspace/SelectBar.vue';
import { defineComponent } from 'vue';
import { getCustomBars } from '~/background/util';

export default defineComponent({
  components: { SelectBar },
  emits: ['show-settings'],
  data() {
    return {
      workspaces: [] as SyncedWorkspaceEntry[],
      bars: [] as BookmarkTreeNode[],
    };
  },
  async mounted() {
    if (this.workspaces.length === 0) {
      this.workspaces = await getWorkspaceList();
      console.log("getWorkspaceList", this.workspaces);
    }
    if (this.bars.length === 0) {
      this.bars = await getCustomBars();
    }
  },
  methods: {
    toggleSettings() {
      this.$emit('show-settings');
    },
    async linkWorkspace(workspace: SyncedWorkspaceEntry, bar: string) {
      const index = this.workspaces.findIndex((ws: SyncedWorkspaceEntry) => ws.workspaceId === workspace.workspaceId);
      this.workspaces[index].syncedBarTitle = bar;
      await updateWorkspacesList(this.workspaces);
      console.log('Workspace linked', this.workspaces);
    },
  },
});
</script>
<style scoped>
table tr th:nth-child(1),
table tr td:nth-child(1) {
  padding-right: 5px;
  width: 50%;
}

table tr th:nth-child(2) {
  min-width: 140px;
}
</style>
