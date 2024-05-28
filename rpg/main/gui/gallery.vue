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
    const beeteos = ref(false);

    const artist = computed(() => {
      return props.properties.artist;
    });

    const acknowledgements = computed(() => {
      return props.properties.acknowledgements;
    });

    const blockchain = computed(() => {
      return props.properties.blockchain;
    });

    const header = computed(() => {
      return props.properties.header;
    });

    const narrative = computed(() => {
      return props.properties.narrative;
    });

    const symbol = computed(() => {
      return props.properties.symbol;
    });

    const tags = computed(() => {
      return props.properties.tags.split(", ");
    });

    const imgURL = computed(() => {
      const lowerCase = header.value.toLowerCase();
      return `/main/spritesheets/gfx/NFT/${lowerCase}.webp`;
    });

    const extURL = computed(() => {
      return `https://nftea.gallery/nft/${symbol.value}`;
    });

    const dexURL = computed(() => {
      return `https://ex.xbts.io/market/${symbol.value}_BTS`;
    });

    const firstDialogLabel = computed(() => {
      return `NFTEA NFT - ${header.value} by ${artist.value}`;
    });

    const beeteosDialogLabel = computed(() => {
      return `Buying ${symbol.value} via BeetEOS`;
    });

    return {
      open,
      artist,
      acknowledgements,
      blockchain,
      header,
      imgURL,
      extURL,
      dexURL,
      narrative,
      symbol,
      tags,
      firstDialogLabel,
      beeteosDialogLabel,
    };
  },
});
</script>

<template>
  <div class="gallery">
    <sl-dialog :open="open" :label="firstDialogLabel" class="dialog-overview">
      <img :src="imgURL" alt="NFT media" /><br />

      <a :href="extURL" target="_blank">
        <sl-button slot="footer" variant="primary" style="margin-right: 10px"
          >View externally</sl-button
        >
      </a>
      <a :href="dexURL" target="_blank">
        <sl-button slot="footer" variant="primary" style="margin-right: 10px"
          >Buy on XBTS.io</sl-button
        >
      </a>
      <sl-button
        slot="footer"
        variant="primary"
        @click="
          open = false;
          beeteos = true;
        "
        >Buy via BeetEOS</sl-button
      >
      <sl-button slot="footer" variant="primary" @click="open = false">Close</sl-button>
    </sl-dialog>
    <sl-dialog :open="beeteos" :label="beeteosDialogLabel" class="dialog-overview">
      <p>BeetEOS NFT purchase method!</p>
      <sl-button
        slot="footer"
        variant="primary"
        @click="
          open = true;
          beeteos = false;
        "
        >Close</sl-button
      >
    </sl-dialog>
  </div>
</template>

<style></style>
