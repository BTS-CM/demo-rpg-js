<script>
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export default defineComponent({
  name: "computer",
  setup() {
    const rpgCurrentPlayer = inject("rpgCurrentPlayer");

    const hp = ref(50);
    const maxHp = ref(100);
    const width = watchEffect(() => {
      return `${(hp.value / maxHp.value) * 100}%`;
    });

    const open = ref(true);

    return {
      hp,
      maxHp,
      width,
    };
  },
});
</script>

<template>
  <div class="computer">
    <sl-dialog label="Dialog" open="open" class="dialog-overview">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      <sl-button slot="footer" variant="primary" onclick="open = false">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style>
.health-bar {
  width: 200px;
  margin-top: 10px;
  margin-left: 10px;
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
}

.health-bar p {
  margin: 5px;
  color: white;
  font-size: 21px;
  font-weight: bold;
  font-family: sans-serif;
}

.bar {
  border: 2px solid black;
  border-radius: 5px;
  position: relative;
}

.inner-bar {
  background: #c54;
  height: 10px;
  position: relative;
  transition: width 0.5s linear;
}
</style>
