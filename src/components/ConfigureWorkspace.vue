<template>
  <select
    ref="selection"
    class="form-control"
    style="font-size: 12px; color: #595959"
    :disabled="workspaces.length === 0"
    @change="onWorkspaceChange"
  >
    <option v-if="workspaces.length > 0" disabled selected hidden value="clear">
      Configure Workspace
    </option>
    <option v-else disabled selected value="">
      No unlinked workspaces found.
    </option>
    <option value="">
      None
    </option>
    <option
      v-for="ws in workspaces"
      :key="ws.workspaceId"
      :value="ws.workspaceId"
    >
      {{ ws.workspaceName }}
    </option>
  </select>
</template>

<script lang="ts">
import { SyncedWorkspaceEntry } from "~/background/classes";
import { convertProxyObject } from '~/background/util';
import { defineComponent } from 'vue';

export default defineComponent({
  exposes: ['workspaces'],
  emits: ['set-workspace'],
  data() {
    return {
      selectedWorkspace: {} as SyncedWorkspaceEntry,
      workspaces: [] as SyncedWorkspaceEntry[],
    };
  },
  methods: {
    clearSelection() {
      (this.$refs.selection as HTMLSelectElement).value = 'clear';
    },
    onWorkspaceChange(event: Event) {
      const ev = event.target as HTMLSelectElement;
      if (ev.value === '' || ev.value === 'clear') {
        return;
      }
      const ws = this.workspaces[Number.parseInt(ev.value, 10)];
      if (!ws) {
        return;
      }
      this.selectedWorkspace = {
        workspaceId: ws.workspaceId,
        workspaceName: ws.workspaceName,
        syncedBarTitle: this.$props.barTitle,
      };

      this.$emit('set-workspace', convertProxyObject(this.selectedWorkspace));
    },
  },
});
</script>
