<template>
  <select class="form-control" @change="onBarChange">
    <option disabled selected hidden value="">Select Bar</option>
    <option value="">None</option>
    <option v-for="bar in customBars" :value="bar.title" :selected="linkStatus(bar.title)">
      {{ bar.title }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getCustomBars } from '~/background/util';
import { SyncedWorkspaceEntry, BookmarkTreeNode } from '~/background/classes';

export default defineComponent({
  emits: ['setBar'],
  props: {
    workspace: {
      type: Array as () => SyncedWorkspaceEntry[],
      required: true,
    },
  },
  data() {
    return {
      selectedBar: {} as BookmarkTreeNode,
      customBars: [] as BookmarkTreeNode[],
    };
  },
  methods: {
    onBarChange(event: Event) {
      const ev = event.target as HTMLSelectElement;
      this.selectedBar = ev.value;
      console.log(this.selectedBar, JSON.parse(JSON.stringify(this.$props.workspace)));
      this.$emit('setBar', JSON.parse(JSON.stringify(this.$props.workspace)), this.selectedBar);
    },
    linkStatus(title: String) {
      const syncedBarTitle = this.$props.workspace.syncedBarTitle;
      if (syncedBarTitle === '') {
        return false;
      }
      // check if the bar title is already linked to a workspace in the list
      if (syncedBarTitle === title) {
        console.log(title, this.$props.workspace);
        return true;
      }
      return false;
    },
  },
  computed: {},
  async mounted() {
    this.customBars = await getCustomBars();
    console.log(this.customBars);
  },
});
</script>
