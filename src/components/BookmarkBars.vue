<template class="d-flex flex-column">
  <div
    v-for="(bar, index) in customBars"
    :key="index"
    class="d-flex flex-column"
  >
    <Bar
      v-if="!bar.editMode"
      :title="bar.title"
      :current-bar-title="currentBarTittle"
      @exchange="handleExchange(bar.title)"
      @edit="handleEdit(index)"
    />
    <Edit
      v-else
      :is-last="customBars.length < 2"
      :bar-id="bar.id"
      :initial-value="bar.title"
      @rename="(updatedTitle) => {updateUI(index, updatedTitle)}"
      @remove="handleRemove(index, bar.id)"
    />
  </div>
</template>

<script lang="ts">
import Bar from "~/components/Bar.vue";
import Edit from "~/components/Edit.vue";
import {defineComponent} from "vue";
import {exchangeBars} from "~/background/service/exchangeBars";
import {getCustomBars} from "~/background/service/util";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {removeBar} from "~/background/service/removeBar";

export default defineComponent({
  components: {Edit, Bar},
  props: {addedBar: {type: Object}},
  data() {
    return {
      customBars: [] as {
        id: string,
        title: string,
        editMode: boolean
      }[],
      currentBarTittle: "",
      activeInput: 0,
    };
  },
  watch: {
    addedBar: {
      immediate: true,
      handler(addedBar) {
        if (!addedBar) {
          return;
        }
        this.addBar(addedBar);
      },
    },
  },
  async created() {
    const customBars = await getCustomBars();
    this.customBars = customBars.map((bar) => ({
      id: bar.id,
      title: bar.title,
      editMode: false,
    }));
    const result = await chrome.storage.sync.get("currentBarTitle");
    this.currentBarTittle = result.currentBarTitle;

    chrome.storage.onChanged.addListener(async () => {
      const result = await chrome.storage.sync.get("currentBarTitle");
      this.currentBarTittle = result.currentBarTitle;
    });
    chrome.commands.onCommand.addListener(() => this.cancelEdit());
  },
  methods: {
    async handleExchange(title: string) {
      await exchangeBars(title);
      this.currentBarTittle = title;
    },
    handleEdit(index: number) {
      this.activeInput = index;
      this.customBars[index].editMode = true;
    },
    async handleRemove(index: number, id: string) {
      const result = await removeBar(id);
      if (!result) {
        return;
      }
      this.currentBarTittle = result;
      this.customBars.splice(index, 1);
    },
    updateUI(index: number, title: string) {
      this.customBars[index].title = title;
      this.customBars[index].editMode = false;
    },
    cancelEdit() {
      this.customBars.forEach((bar) => {
        bar.editMode = false;
      });
    },
    addBar(bar: BookmarkTreeNode) {
      this.customBars.push({
        id: bar.id,
        title: bar.title,
        editMode: false,
      });
    },
  },
});

</script>
