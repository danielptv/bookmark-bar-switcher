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
        v-if="!bar.editMode"
        :title="bar.title"
        :is-active="bar.isActive"
        @exchange="handleExchange(bar.title)"
        @edit="customBars[index].editMode = true"
      />
      <Edit
        v-else
        :is-last="customBars.length < 2"
        :bar-id="bar.id"
        :initial-value="bar.title"
        @rename="
          (updatedTitle) => {
            customBars[index].title = updatedTitle;
            customBars[index].editMode = false;
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
import { Container, Draggable } from 'vue-dndrop';
import { exchange, remove, reorder } from '~/background/service';
import Bar from '~/components/Bar.vue';
import { BookmarkTreeNode } from '~/background/workspace';
import Edit from '~/components/Edit.vue';
import { Modal } from 'bootstrap';
import RemoveModal from '~/components/Modal.vue';
import { defineComponent } from 'vue';
import { getCurrentBarTitle } from '~/background/storage';
import { getCustomBars } from '~/background/util';

let currentBarTitle = await getCurrentBarTitle();

export default defineComponent({
  components: { RemoveModal, Edit, Bar, Draggable, Container },
  props: { addedBar: { type: Object } },
  data() {
    return {
      customBars: [] as {
        id: string;
        title: string;
        isActive: boolean;
        editMode: boolean;
      }[],
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
      id: bar.id,
      title: bar.title,
      isActive: bar.title === currentBarTitle,
      editMode: false,
    }));
    this.customBars.forEach((bar) => {
      bar.isActive = bar.title === currentBarTitle;
    });
    chrome.storage.onChanged.addListener(async () => {
      currentBarTitle = await getCurrentBarTitle();
      this.customBars.forEach((bar) => {
        bar.isActive = bar.title === currentBarTitle;
      });
    });
    chrome.commands.onCommand.addListener(() => this.cancelEdit());
  },
  methods: {
    addActive() {
      this.customBars.forEach((bar) => {
        bar.isActive = bar.title === currentBarTitle;
      });
    },
    async handleReorder(dropResult: { removedIndex: number | null; addedIndex: number | null }) {
      this.customBars = await reorder(this.customBars, dropResult);
    },
    async handleExchange(title: string) {
      await exchange(title);
      this.customBars.forEach((bar) => {
        bar.isActive = bar.title === title;
      });
    },
    handleRemove(index: number, id: string, title: string) {
      [this.removeIndex, this.removeTitle, this.removeId] = [index, title, id];
      this.modal.show();
    },
    async handleConfirmRemove(index: number, id: string) {
      const result = await remove(id);
      if (!result) {
        return;
      }
      this.customBars.splice(index, 1);
      this.customBars.forEach((bar) => {
        bar.isActive = bar.title === result;
      });
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
        isActive: false,
        editMode: false,
      });
    },
  },
});
</script>
