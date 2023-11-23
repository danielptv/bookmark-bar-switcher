<template class="d-flex flex-column">
  <Container
    lock-axis="y"
    :animation-duration="400"
    drag-class="cursor-move"
    @drop="handleReorder"
    @drag-start="customBars.forEach((bar) => (bar.isActive = false))"
    @drag-end="addActive"
  >
    <Draggable v-for="(bar, index) in customBars" :key="index" class="d-flex flex-column">
      <Bar
        v-if="!bar.isEdited"
        :id="bar.id"
        :title="bar.title"
        :is-active="bar.isActive"
        @exchange="handleExchange(bar.id)"
        @edit="customBars[index].isEdited = true"
      />
      <Edit
        v-else
        :is-last="customBars.length < 2"
        :bar-id="bar.id"
        :initial-value="bar.title"
        @rename="
          (updatedTitle) => {
            customBars[index].title = updatedTitle;
            customBars[index].isEdited = false;
          }
        "
        @remove="handleRemove(index, bar.id, bar.title)"
      />
    </Draggable>
  </Container>
  <RemoveModal
    :id="removeId"
    :index="removeIndex"
    :title="removeTitle"
    :modal="modal"
    @confirm-remove="handleConfirmRemove(removeIndex, removeId)"
  />
</template>

<script lang="ts">
import { type BookmarksBar, BookmarksBarPopup } from '~/background/types.ts';
import { Container, Draggable } from 'vue-dndrop';
import { exchangeBars, removeBar, reorderBars } from '~/background/service.ts';
import Bar from '~/components/Bar.vue';
import Edit from '~/components/Edit.vue';
import { Modal } from 'bootstrap';
import RemoveModal from '~/components/Modal.vue';
import { defineComponent } from 'vue';
import { getActiveBar } from '~/background/storage.ts';
import { getCustomBars } from '~/background/util.ts';

let activeBar = await getActiveBar();

export default defineComponent({
  components: { RemoveModal, Edit, Bar, Draggable, Container },
  props: { addedBar: { type: Object, required: true } },
  data() {
    return {
      customBars: [] as BookmarksBarPopup[],
      removeIndex: undefined as unknown as number,
      removeTitle: undefined as unknown as string,
      removeId: undefined as unknown as string,
      modal: {} as Modal,
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
  mounted() {
    const modal = document.getElementById('myModal');
    const main = document.getElementById('main');
    this.modal = new Modal(modal as Element);
    if (!main) {
      return;
    }
    modal?.addEventListener('shown.bs.modal', () => {
      main.style.minHeight = '145px';
    });

    modal?.addEventListener('hidden.bs.modal', () => {
      main.style.minHeight = 'auto';
    });
  },
  async created() {
    const customBars = await getCustomBars();
    this.customBars = customBars.map((bar) => ({
      ...bar,
      isActive: bar.id === activeBar.id,
      isEdited: false,
    }));
    chrome.storage.onChanged.addListener(async () => {
      activeBar = await getActiveBar();
      this.customBars.forEach((bar) => {
        bar.isActive = bar.id === activeBar.id;
      });
    });
    chrome.commands.onCommand.addListener(() => this.cancelEdit());
  },
  methods: {
    addActive() {
      this.customBars.forEach((bar) => {
        bar.isActive = bar.id === activeBar.id;
      });
    },
    async handleReorder(dropResult: { removedIndex: number | null; addedIndex: number | null }) {
      this.customBars = await reorderBars(this.customBars, dropResult);
    },
    async handleExchange(id: string) {
      await exchangeBars(id);
      this.customBars.forEach((bar) => {
        bar.isActive = bar.id === id;
      });
    },
    handleRemove(index: number, id: string, title: string) {
      [this.removeIndex, this.removeTitle, this.removeId] = [index, title, id];
      this.modal.show();
    },
    async handleConfirmRemove(index: number, id: string) {
      if (this.customBars.length < 2) {
        return;
      }
      await removeBar(id);
      const activeBar = await getActiveBar();
      this.customBars.splice(index, 1);
      this.customBars.forEach((bar) => {
        bar.isActive = bar.id === activeBar.id;
      });
    },
    cancelEdit() {
      this.customBars.forEach((bar) => {
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
