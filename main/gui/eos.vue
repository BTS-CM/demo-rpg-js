<script>
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

import htmlData from "../public/astro-eos-tool/index.html";

export default defineComponent({
  name: "eos",
  setup() {
    const open = ref(true);

    return {
      open,
      htmlData,
    };
  },
});
</script>

<template>
  <div class="eos">
    <sl-dialog :open="open" label="Dialog" class="dialog-overview">
      EOS Computer!<br />
      <div v-html="htmlData"></div><br/>
      <sl-button slot="footer" variant="primary" @click="open = false">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style></style>
