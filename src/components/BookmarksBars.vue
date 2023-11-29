<template>
  <Container
    lock-axis="y"
    :animation-duration="400"
    drag-class="cursor-move"
    @drop="reorder"
    @drag-start="removeActive"
    @drag-end="addActive"
  >
    <Draggable v-for="(bar, index) in customBars" :key="index" class="d-flex flex-column">
      <Bar
        v-if="!bar.isEdited"
        :title="bar.title"
        :is-active="bar.isActive"
        @exchange="exchange(bar.id)"
        @edit="customBars[index].isEdited = true"
      />
      <Edit
        v-else
        :is-last="customBars.length < 2"
        :bar-id="bar.id"
        :initial-value="bar.title"
        @rename="
          (updatedTitle: string) => {
            customBars[index].title = updatedTitle;
            customBars[index].isEdited = false;
          }
        "
        @remove="
          {
            showPopup = true;
            setRemoveCandidate(bar, index);
          }
        "
      />
    </Draggable>
  </Container>
  <BModal v-model="showPopup" @ok="remove">Remove bookmarks bar and all of its bookmarks?</BModal>
</template>

<script setup lang="ts">
const showPopup = ref(false);
</script>

<script lang="ts">
import { type BookmarksBar, BookmarksBarPopup, RemoveCandidate } from 'bookmarks';
import { Container, Draggable, type DropResult } from 'vue-dndrop';
import { defineComponent, ref } from 'vue';
import { exchangeBars, removeBar, reorderBars } from '~/background/service.ts';
import { BModal } from 'bootstrap-vue-next';
import Bar from '~/components/Bar.vue';
import Edit from '~/components/Edit.vue';
import { getActiveBar } from '~/background/storage.ts';
import { getCustomBars } from '~/background/util.ts';

let activeBar = await getActiveBar();

export default defineComponent({
  components: { Edit, Bar, Draggable, Container, BModal },
  props: { addedBar: { type: Object, required: true } },
  data() {
    return {
      customBars: [] as BookmarksBarPopup[],
      removeCandidate: {} as RemoveCandidate,
    };
  },
  watch: {
    addedBar: {
      immediate: true,
      handler(addedBar) {
        if (addedBar as BookmarksBar) {
          this.addBar(addedBar);
        }
      },
    },
  },
  async created() {
    const customBars = await getCustomBars();
    this.customBars = customBars.map(
      (bar) =>
        ({
          ...bar,
          isActive: bar.id === activeBar.id,
          isEdited: false,
        } as BookmarksBarPopup),
    );
    chrome.storage.onChanged.addListener(async () => {
      activeBar = await getActiveBar();
      this.customBars.forEach((bar: BookmarksBarPopup) => {
        bar.isActive = activeBar.id === bar.id;
      });
    });
    chrome.commands.onCommand.addListener(() => this.cancelEdit());
  },
  methods: {
    addActive() {
      this.customBars.forEach((bar: BookmarksBarPopup) => {
        bar.isActive = bar.id === activeBar.id;
      });
    },
    removeActive() {
      this.customBars.forEach((bar: BookmarksBarPopup) => {
        bar.isActive = bar.id === activeBar.id;
      });
    },
    async reorder(dropResult: DropResult) {
      this.customBars = await reorderBars(this.customBars, dropResult);
    },
    setRemoveCandidate(bar: BookmarksBarPopup, index: number) {
      this.removeCandidate = {
        ...bar,
        index,
      };
    },
    async exchange(id: string) {
      await exchangeBars(id);
      this.customBars.forEach((bar: BookmarksBarPopup) => {
        bar.isActive = bar.id === id;
      });
    },
    async remove() {
      if (this.customBars.length < 2) {
        return;
      }
      await removeBar(this.removeCandidate.id);
      const activeBar = await getActiveBar();
      this.customBars.splice(this.removeCandidate.index, 1);
      this.customBars.forEach((bar) => {
        bar.isActive = bar.id === activeBar.id;
      });
    },
    cancelEdit() {
      this.customBars.forEach((bar: BookmarksBarPopup) => {
        bar.isEdited = false;
      });
    },
    addBar(bar: BookmarksBar) {
      this.customBars.push({
        ...bar,
        isActive: false,
        isEdited: false,
      });
    },
  },
});
</script>
~/types/types
