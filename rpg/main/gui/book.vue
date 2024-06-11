<script>
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export default defineComponent({
  name: "book",
  setup() {
    const rpgGuiClose = inject("rpgGuiClose");
    const rpgCurrentPlayer = inject("rpgCurrentPlayer");
    const open = ref(true);
    
    async function closeBook() {
      try {
        await rpgGuiClose('book');
      } catch (e) {
        console.error(e);
      }
      open.value = false;
    }
    
    return { open, closeBook };
  },
});
</script>

<template>
  <div class="book">
    <sl-dialog :open="open" label="Dialog" class="dialog-overview">
      Book contents<br />
      <sl-button slot="footer" variant="primary" @click="closeBook();">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style></style>
