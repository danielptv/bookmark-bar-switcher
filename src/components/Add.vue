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
    />
    <div class="input-group-append ms-3">
      <button class="btn btn-outline-success" type="button" title="Add" @click="save">
        <font-awesome-icon icon="fa-solid fa-square-plus" class="icon-lg" />
      </button>
    </div>
    <div class="input-group mt-2">
      <SelectWorkspace @setWorkspace="setWorkspace" />
      <div class="input-group-append ms-3">
        <button class="btn grey" type="button" title="Settings" @click="toggleSettings">
          <font-awesome-icon icon="fa-solid fa-gear" class="icon-lg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { findFolder, getCustomDirectoryId } from '~/background/util';
import { add } from '~/background/service';
import { defineComponent } from 'vue';
import { updateWorkspacesList } from '~/background/storage';
import SelectWorkspace from '~/components/SelectWorkspace.vue';

export default defineComponent({
  emits: ['add', 'showSettings'],
  components: { SelectWorkspace },
  data() {
    return {
      currentValue: '',
      variableClasses: {
        'is-valid': false,
        'is-invalid': false,
      },
      selectedWorkspace: {
        syncedBarTitle: '',
        workspaceId: '',
        workspaceName: 'Select Workspace',
      },
    };
  },
  methods: {
    async save() {
      if (this.currentValue === '' || (await this.isDuplicate())) {
        return;
      }
      const result = await add(this.currentValue);
      this.$emit('add', result);

      if (this.selectedWorkspace.workspaceId !== '') {
        const res = await updateWorkspacesList(this.selectedWorkspace);
        console.log(res);
      }

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
      this.$emit('showSettings');
    },
    setWorkspace(workspace: any) {
      this.selectedWorkspace.workspaceId = workspace.workspaceId;
      this.selectedWorkspace.workspaceName = workspace.workspaceName;
    },
  },
  computed: {},
});
</script>

<style scoped></style>
