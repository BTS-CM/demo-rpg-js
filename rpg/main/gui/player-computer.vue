<script>
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export default defineComponent({
  name: "player-computer",
  setup() {
    const rpgCurrentPlayer = inject("rpgCurrentPlayer");
    console.log({ rpgCurrentPlayer });
    const open = ref(true);
    return {
      open,
    };
  },
});
</script>

<template>
  <div class="player-computer">
    <sl-dialog :open="open" label="Dialog" class="dialog-overview">
      Player computer modal<br />
      <sl-button slot="footer" variant="primary" @click="open = false">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style></style>
