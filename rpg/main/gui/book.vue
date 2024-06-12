<script>
import { defineComponent, computed, watchEffect, ref, onMounted, watch, inject } from "vue";

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export default defineComponent({
  name: "book",
  props: {
    title: {
      type: String,
      default: "???",
    },
    contents: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const rpgGuiClose = inject("rpgGuiClose");
    const open = ref(true);

    const title = computed(() => {
      return props.title ?? "???";
    });
    
    const textContents = computed(() => {
      return props.contents ?? null;
    });

    const currentPage = ref(0);
    const pageSize = 1000;

    const totalPages = computed(() => Math.ceil(textContents.value.length / pageSize));

    const currentPageContents = computed(() => {
      const start = currentPage.value * pageSize;
      const end = start + pageSize;
      return textContents.value.slice(start, end);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value - 1) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--;
      }
    };
    
    watchEffect(async () => {
      if (open.value) {
        console.log(`Book opened: ${title.value}`);
      } else {
        console.log("Book closed...");
        try {
          await rpgGuiClose("book");
        } catch (e) {
          console.error(e);
        }
      }
    });

    function closeDialog() {
      open.value = false;
    }
    
    return {
      // Dialog state
      open,
      closeDialog,
      // For use in JSX:
      title,
      currentPageContents,
      // For reading the book
      currentPage,
      totalPages,
      nextPage,
      prevPage,
   };
  },
});
</script>

<template>
  <div class="book">
    <sl-dialog :open="open" :label="title" class="dialog-overview" @sl-after-hide="closeDialog">
      <div v-if="currentPageContents">
        <div class="text-content">
          {{ currentPageContents }}
        </div>
        <div class="smallGrid">
          <sl-button slot="footer" variant="neutral" @click="prevPage" :disabled="currentPage === 0">Previous</sl-button>
          <sl-button slot="footer" variant="neutral" @click="nextPage" :disabled="currentPage >= totalPages - 1">Next</sl-button>
        </div>
      </div>
      <div v-else>
        You're unable to read this book...
      </div>
    </sl-dialog>
  </div>
</template>

<style scoped>
.dialog {
  width: 300px;
  height: 300px;
}
.text-content {
  overflow: hidden;
  text-overflow: ellipsis;
}
.smallGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 5px;
  margin-top: 30px;
}
</style>