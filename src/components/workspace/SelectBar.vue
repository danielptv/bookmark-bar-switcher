<template>
  <select class="form-control" @change="onBarChange">
    <option disabled selected hidden value="">
      Select Bar
    </option>
    <option value="">
      None
    </option>
    <option v-for="bar in customBars" :key="bar.id" :value="bar.title" :selected="linkStatus(bar.title)">
      {{ bar.title }}
    </option>
  </select>
</template>

<script lang="ts">
import { BookmarkTreeNode, SyncedWorkspaceEntry } from '~/background/classes';
import { convertProxyObject } from '~/background/util';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    workspace: {
      type: Object as () => SyncedWorkspaceEntry,
      required: true,
    },
    customBars: {
      type: Array as () => BookmarkTreeNode[],
      required: true,
    },
  },
  emits: ['set-bar'],
  data() {
    return {selectedBar: ""};
  },
  methods: {
    onBarChange(event: Event) {
      const ev = event.target as HTMLSelectElement;
      this.selectedBar = ev.value;
      this.$emit('set-bar', convertProxyObject(this.$props.workspace), this.selectedBar);
    },
    linkStatus(title: string) {
      const {syncedBarTitle} = this.$props.workspace;
      if (syncedBarTitle === '') {
        return false;
      }
      // check if the bar title is already linked to a workspace
      return syncedBarTitle === title;
    },
  },
});
</script>
