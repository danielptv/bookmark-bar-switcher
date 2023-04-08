<template class="d-flex flex-column">
  <BarButton
    v-for="bar in customBars"
    :key="bar.id"
    :title="bar.title"
    :current-bar-title="currentBarTittle"
    @click="handleClick(bar.title)"
  />
</template>

<script lang="ts">
import BarButton from "~/components/BarButton.vue";
import { defineComponent } from "vue";
import { exchangeBars } from "~/background/service/exchangeBars";
import { getCustomBars } from "~/background/service/util";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export default defineComponent({
  components: { BarButton },
  data() {
    return {
      customBars: [] as BookmarkTreeNode[],
      currentBarTittle: "",
    };
  },
  async created() {
    this.customBars = await getCustomBars();
    const result = await chrome.storage.sync.get("currentBarTitle");
    this.currentBarTittle = result.currentBarTitle;

    chrome.storage.onChanged.addListener(async () => {
      const result = await chrome.storage.sync.get("currentBarTitle");
      this.currentBarTittle = result.currentBarTitle;
    });
  },
  methods: {
    async handleClick(title: string) {
      await exchangeBars(title);
      this.currentBarTittle = title;
    },
  },
});

</script>
