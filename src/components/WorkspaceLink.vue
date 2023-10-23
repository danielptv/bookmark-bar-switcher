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
          <th>Bar</th>
          <th>Workspace</th>
        </tr>
        <tr v-for="bar in bars">
          <td>{{ bar }}</td>
          <td><SelectWorkspace :barTitle="bar" @setWorkspace="linkWorkspace" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getWorkspaceList, updateWorkspacesList } from '~/background/storage';
import { getCustomBars } from '~/background/util';
import SelectWorkspace from '~/components/SelectWorkspace.vue';

export default defineComponent({
  emits: ['showSettings'],
  components: { SelectWorkspace },
  props: {
    bars: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      workspaces: [
        {
          syncedBarTitle: '',
          workspaceId: '',
          workspaceName: '',
        },
      ],
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
    async linkWorkspace(workspace) {
      await updateWorkspacesList(workspace);
      console.log(workspace);
    },
  },
  async mounted() {
    this.workspaces = this.workspaces[0].workspaceId === '' ? await getWorkspaceList() : null;
    this.bars = (await getCustomBars()).map((bar) => {
      return bar.title;
    });
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
