<template>
  <div class="m-4">
    <div class="ms-2 my-4 cursor-pointer" style="min-width: 300px">
      <span @click="toggleSettings">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        Back to Bookmarks
      </span>
    </div>
    <div>
      <table>
        <tr>
          <th>Workspace</th>
          <th>Bar</th>
        </tr>
        <tr v-for="ws in workspaces">
          <td>{{ ws.workspaceName }}</td>
          <td><SelectBar :workspace="ws" @setBar="linkWorkspace" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getWorkspaceList, updateWorkspacesList } from '~/background/storage';
import { SyncedWorkspaceEntry } from '~/background/classes';
import SelectBar from '~/components/SelectBar.vue';

export default defineComponent({
  emits: ['showSettings'],
  components: { SelectBar },
  data() {
    return {
      workspaces: [] as SyncedWorkspaceEntry[],
      bars: [
        {
          id: '',
          title: '',
          isActive: false,
          editMode: false,
        },
      ],
    };
  },
  methods: {
    toggleSettings() {
      this.$emit('showSettings');
    },
    async linkWorkspace(workspace: SyncedWorkspaceEntry, bar: string) {
      const index = this.workspaces.findIndex((ws) => ws.workspaceId === workspace.workspaceId);
      this.workspaces[index].syncedBarTitle = bar;
      await updateWorkspacesList(this.workspaces);
      console.log('Workspace linked', this.workspaces);
    },
  },
  async mounted() {
    if (this.workspaces.length === 0) {
      this.workspaces = await getWorkspaceList();
    }
  },
});
</script>
<style scoped>
table tr th:nth-child(1),
table tr td:nth-child(1) {
  padding-right: 5px;
}
table tr th:nth-child(2) {
  min-width: 140px;
}
</style>
