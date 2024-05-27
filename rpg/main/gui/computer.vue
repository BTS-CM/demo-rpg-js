<script>
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export default defineComponent({
  name: "computer",
  setup() {
    const rpgCurrentPlayer = inject("rpgCurrentPlayer");
    const open = ref(true);
    return {
      open,
    };
  },
});
</script>

<template>
  <div class="computer">
    <sl-dialog label="Dialog" :open="open" class="dialog-overview">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      <sl-button slot="footer" variant="primary" @click="open = false">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style></style>
