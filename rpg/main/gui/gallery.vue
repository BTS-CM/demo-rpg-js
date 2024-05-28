<script>
import { defineComponent, computed, watchEffect, ref, inject, onMounted } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/dialog/dialog";

export default defineComponent({
  name: "gallery",
  props: {
    properties: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const open = ref(true);

    const artist = computed(() => {
      return props.properties.artist;
    });

    console.log({ artist: artist.value, properties: props.properties });

    return {
      open,
      artist,
    };
  },
});
</script>

<template>
  <div class="gallery">
    <sl-dialog :open="open" label="Dialog" class="dialog-overview">
      NFTEA Gallery modal<br />
      Artist: {{ artist }}<br />
      <sl-button slot="footer" variant="primary" @click="open = false">Close</sl-button>
    </sl-dialog>
  </div>
</template>

<style></style>
