<template>
  <select class="form-control" @change="onWorkspaceChange">
    <option disabled selected hidden value="">Select Workspace</option>
    <option value="">None</option>
    <option v-for="ws in workspaces" :value="ws.workspaceId" :selected="linkStatus(ws.syncedBarTitle)">
      {{ ws.workspaceName }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['setWorkspace'],
  props: {
    barTitle: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      selectedWorkspace: {
        syncedBarTitle: '',
        workspaceId: '',
        workspaceName: 'Select Workspace',
      },
      workspaces: [
        {
          syncedBarTitle: '',
          workspaceId: '',
          workspaceName: '',
        },
      ],
    };
  },
  methods: {
    async getWorkspaces() {
      const { workspaces } = await chrome.storage.sync.get('workspaces');
      console.log(workspaces);
      this.workspaces = workspaces;
    },
    onWorkspaceChange(event: Event) {
      const ev = event.target as HTMLSelectElement;
      this.selectedWorkspace = this.workspaces[parseInt(ev.value)];
      if (this.$props.barTitle !== undefined) {
        this.selectedWorkspace.syncedBarTitle = this.$props.barTitle;
      }
      this.$emit('setWorkspace', JSON.parse(JSON.stringify(this.selectedWorkspace)));
    },
    linkStatus(title) {
      if (this.$props.barTitle === undefined) {
        return false;
      }
      // check if the bar title is already linked to a workspace in the list
      if (title === this.$props.barTitle) {
        console.log(title, this.$props.barTitle);
        return true;
      }
      return false;
    },
  },
  computed: {},
  mounted() {
    this.getWorkspaces();
  },
});
</script>
