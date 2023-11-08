<template>
  <div class="input-group mt-2">
    <input
      type="text"
      class="form-control"
      :class="variableClasses"
      placeholder="Enter name"
      :value="currentValue"
      @input="updateValue"
      @keydown.enter="save"
    >
    <div class="input-group-append ms-3">
      <button class="btn btn-outline-success" type="button" title="Add" @click="save">
        <font-awesome-icon icon="fa-solid fa-square-plus" class="icon-lg" />
      </button>
    </div>
  </div>
  <div class="input-group mt-2">
    <ConfigureWorkspace ref="configureWorkspace" @set-workspace="setWorkspace" />
    <div class="input-group-append ms-3">
      <button class="btn" type="button" title="Settings" @click="toggleSettings">
        <font-awesome-icon icon="fa-solid fa-gear" class="icon-md" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { OperaWorkspaceEntry, SyncedWorkspaceEntry } from '~/background/classes';
import { findFolder, getCustomDirectoryId } from '~/background/util';
import { getWorkspaceList, updateWorkspace } from '~/background/storage';
import ConfigureWorkspace from '~/components/ConfigureWorkspace.vue';
import { add } from '~/background/service';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Add',
  components: { ConfigureWorkspace },
  emits: ['add', 'show-settings'],
  data() {
    return {
      currentValue: '',
      variableClasses: {
        'is-valid': false,
        'is-invalid': false,
      },
      workspaces: [] as SyncedWorkspaceEntry[],
      selectedWorkspace: {
        syncedBarTitle: '',
        workspaceId: '',
        workspaceName: '',
      },
    };
  },
  async mounted() {
    await this.getWorkspaces();
  },
  methods: {
    async save() {
      if (this.currentValue === '' || (await this.isDuplicate())) {
        return;
      }
      const result = await add(this.currentValue);
      this.$emit('add', result);

      await this.linkWorkspace();

      this.currentValue = '';
      this.variableClasses['is-valid'] = false;
      this.variableClasses['is-invalid'] = false;
    },
    async updateValue(event: Event) {
      const target = event.target as HTMLInputElement;
      this.currentValue = target.value;
      this.selectedWorkspace.syncedBarTitle = target.value;

      if (this.currentValue === '') {
        this.variableClasses['is-valid'] = false;
        this.variableClasses['is-invalid'] = false;
        return;
      }
      const isDuplicate = await this.isDuplicate();
      if (isDuplicate) {
        this.variableClasses['is-valid'] = false;
        this.variableClasses['is-invalid'] = true;
        return;
      }
      this.variableClasses['is-valid'] = true;
      this.variableClasses['is-invalid'] = false;
    },
    async isDuplicate() {
      const customDirectoryId = await getCustomDirectoryId();
      const result = await findFolder(customDirectoryId, this.currentValue);
      return result.length > 0;
    },
    toggleSettings() {
      this.$emit('show-settings');
    },
    async getWorkspaces() {
      const workspaces = await getWorkspaceList();
      if (workspaces.length === 0) {
        return;
      }
      (this.$refs.configureWorkspace as InstanceType<typeof ConfigureWorkspace>).workspaces = workspaces.filter((ws) => ws.syncedBarTitle === '');
    },
    setWorkspace(workspace: OperaWorkspaceEntry) {
      this.selectedWorkspace.workspaceId = workspace.workspaceId;
      this.selectedWorkspace.workspaceName = workspace.workspaceName;
    },
    async linkWorkspace() {
      if (this.selectedWorkspace.workspaceId !== '') {
        const ws = await updateWorkspace(this.selectedWorkspace);
        (this.$refs.configureWorkspace as InstanceType<typeof ConfigureWorkspace>).clearSelection();
        (this.$refs.configureWorkspace as InstanceType<typeof ConfigureWorkspace>).workspaces = ws;
      }
    },
  },
});
</script>
