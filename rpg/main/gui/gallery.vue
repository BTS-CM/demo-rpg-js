<script>
import { defineComponent, computed, watch, watchEffect, ref, inject, onMounted } from "vue";
import { useStore } from "@nanostores/vue";

import { createMarketOrdersStore } from "../nanoeffects/MarketOrders";
import { $currentUser, $userStorage } from "../nanostores/users.ts";

import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/dialog/dialog";
import "@shoelace-style/shoelace/dist/components/spinner/spinner";
import "@shoelace-style/shoelace/dist/components/input/input";

import { generateDeepLink } from "../bts/generateDeepLink";
import { humanReadableFloat, blockchainFloat } from "../bts/common";

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
    const current_nft = ref(0);

    const about = ref(false);
    const buy = ref(false);
    const explore = ref(false);

    const beeteos = ref(false);
    const broadcast = ref(false);
    const deeplink = ref(null);

    // existing accounts
    const currentUser = useStore($currentUser);
    const storedUsers = useStore($userStorage);

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
      return props.properties.tags;
    });

    const filetype = computed(() => {
      return props.properties.filetype ?? null;
    });

    const media_qty = computed(() => {
      return props.properties.media_qty ?? null;
    });

    const basePrecision = computed(() => {
      // avoids blockchain asset query
      return props.properties.basePrecision ?? 5; // BTS has a precision of 5
    });

    const quotePrecision = computed(() => {
      // avoids blockchain asset query
      return props.properties.quotePrecision ?? 0; // NFTs have a precision of 0 (if whole indivisible units)
    });

    const baseAssetID = computed(() => {
      // avoids blockchain asset query
      return props.properties.baseAssetID ?? "1.3.0"; // BTS asset ID
    });

    const quoteAssetID = computed(() => {
      // avoids blockchain asset query
      return props.properties.quoteAssetID ?? "";
    });

    const CID = computed(() => {
      return props.properties.CID;
    });

    const retry = ref(0);
    const chainResult = ref(null);
    const loading = ref(false);

    // Fetching the latest order book data:
    watchEffect(async () => {
      if (beeteos.value || retry.value) {
        loading.value = true;

        const marketStore = createMarketOrdersStore([
          blockchain.value,
          symbol.value,
          blockchain.value === "bitshares" ? "BTS" : "TEST",
        ]);

        const unsub = marketStore.subscribe((result) => {
          if (result.error) {
            loading.value = false;
            console.error(result.error);
          }

          if (!result.loading) {
            if (result.data) {
              const res = result.data;
              console.log({ res });
              chainResult.value = res;
              loading.value = false;
            }
          }
        });

        return () => {
          unsub();
        };
      }
    });

    // Generating a deeplink for buying the lowest ask
    watchEffect(async () => {
      if (broadcast.value && chainResult.value) {
        if (!chainResult.value.asks || !chainResult.value.asks.length) {
          console.log("No asks available for this NFT.");
          return;
        }
        var expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 60);

        const operation = {
          seller: currentUser.value.id,
          amount_to_sell: {
            amount: parseInt(
              blockchainFloat(
                parseFloat(chainResult.value.asks[0].base),
                basePrecision.value
              ).toFixed(0)
            ),
            asset_id: baseAssetID.value,
          },
          min_to_receive: {
            amount: parseInt(
              blockchainFloat(
                parseFloat(chainResult.value.asks[0].quote),
                quotePrecision.value
              ).toFixed(0)
            ),
            asset_id: quoteAssetID.value,
          },
          expiration: expiry,
          fill_or_kill: false,
          extensions: [],
        };

        console.log({ operation });

        let res;
        try {
          res = await generateDeepLink(blockchain.value, "limit_order_create", [operation]);
        } catch (err) {
          console.error(err);
        }

        if (res) {
          console.log({ res });
          deeplink.value = res;
        }
      }
    });

    const mainImage = computed(() => {
      return `/main/spritesheets/gfx/NFT/${symbol}/0_256x256.${filetype}`;
    });

    const currentImage = computed(() => {
      return `/main/spritesheets/gfx/NFT/${symbol}/${current_nft}_256x256.${filetype}`;
    });

    return {
      // Dialog open states:
      open,
      beeteos,
      broadcast,
      about,
      buy,
      explore,
      current_nft,
      // Nanostore data:
      currentUser,
      storedUsers,
      // Blockchain data:
      chainResult,
      deeplink,
      // Static asset data:
      basePrecision,
      baseAssetID,
      quotePrecision,
      quoteAssetID,
      // generated urls
      currentImage,
      mainImage,
      // NFT Properties:
      artist,
      acknowledgements,
      blockchain,
      header,
      filetype,
      media_qty,
      narrative,
      symbol,
      tags,
      CID,
      // Functions for in-JSX use:
      humanReadableFloat,
    };
  },
});
</script>

<template>
  <div class="gallery">
    <sl-dialog
      :open="open"
      :label="`Viewing '${header}' created by ${artist}`"
      class="dialog-overview"
    >
      <div v-if="filetype && media_qty">
        <div
          class="microGrid"
          style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
          "
        >
          <a :href="`https://gateway.pinata.cloud/ipfs/${CID}`" target="_blank">
            <img
              :src="currentImage"
              :id="`nft_${current_nft}_${symbol}`"
              width="300px"
              alt="NFT media"
            />
          </a>
          <p>{{ current_nft + 1 }} of {{ media_qty }}</p>
        </div>
        <div class="smallGrid">
          <sl-button
            variant="neutral"
            @click="current_nft > 0 ? (current_nft -= 1) : (current_nft = media_qty - 1)"
            size="small"
            pill
          >
            Previous
          </sl-button>
          <sl-button
            variant="neutral"
            @click="current_nft < media_qty - 1 ? (current_nft += 1) : (current_nft = 0)"
            size="small"
            pill
            >Next</sl-button
          >
        </div>
      </div>
      <div v-else style="display: flex; justify-content: center; align-items: center; height: 100%">
        <img :src="mainImage" alt="NFT media" />
      </div>
      <div class="grid">
        <sl-button
          variant="neutral"
          @click="
            about = true;
            open = false;
          "
          >About</sl-button
        >

        <sl-button
          variant="neutral"
          @click="
            buy = true;
            open = false;
          "
          >Buy</sl-button
        >

        <sl-button
          variant="neutral"
          @click="
            explore = true;
            open = false;
          "
          >Explore</sl-button
        >
      </div>
    </sl-dialog>

    <sl-dialog :open="about" :label="`About ${header} by ${artist}`" class="dialog-overview">
      <p>Narrative: {{ narrative }}</p>
      <p>Acknowledgements: {{ acknowledgements }}</p>
      <p>Tags: {{ tags }}</p>
      <p>Blockchain: {{ blockchain }}</p>
      <sl-button
        slot="footer"
        variant="neutral"
        @click="
          open = true;
          about = false;
        "
        >Close</sl-button
      >
    </sl-dialog>

    <sl-dialog :open="buy" :label="`Where to buy '${header}'`" class="dialog-overview">
      <div class="grid">
        <a :href="`https://ex.xbts.io/market/${symbol}_BTS?r=nftprofessional1`" target="_blank">
          <sl-button slot="footer" variant="neutral" style="margin-right: 10px"
            >Buy on XBTS.io</sl-button
          >
        </a>

        <a :href="`https://bts.exchange/#/market/${symbol}_BTS?r=nftprofessional1`" target="_blank">
          <sl-button slot="footer" variant="neutral" style="margin-right: 10px"
            >Buy on bts.exchange</sl-button
          >
        </a>

        <sl-button
          v-if="currentUser.chain === blockchain"
          slot="footer"
          variant="neutral"
          @click="
            buy = false;
            beeteos = true;
          "
          >Buy via BeetEOS</sl-button
        >
      </div>

      <sl-button
        slot="footer"
        variant="neutral"
        @click="
          open = true;
          buy = false;
        "
        >Back</sl-button
      >
    </sl-dialog>

    <sl-dialog :open="explore" :label="`Explorer links for '${header}'`" class="dialog-overview">
      <div class="grid">
        <a :href="`https://nftea.gallery/nft/${symbol}`" target="_blank">
          <sl-button slot="footer" variant="neutral" style="margin-right: 10px"
            >NFTEA Gallery</sl-button
          >
        </a>
        <a :href="`https://blocksights.info/#/assets/${symbol}`" target="_blank">
          <sl-button slot="footer" variant="neutral" style="margin-right: 10px"
            >Blocksights</sl-button
          >
        </a>
      </div>

      <sl-button
        slot="footer"
        variant="neutral"
        @click="
          open = true;
          explore = false;
        "
        >Close</sl-button
      >
    </sl-dialog>

    <sl-dialog :open="beeteos" label="Buying NFT via BeetEOS" class="dialog-overview">
      <div v-if="loading">
        Checking NFT liquidity...<br />
        <sl-spinner></sl-spinner>
      </div>

      <div v-if="!loading && chainResult">
        <span v-if="!chainResult.asks || !chainResult.asks.length">
          This NFT is currently not for sale, try again later.
        </span>
        <span v-for="ask in chainResult.asks">
          <p :id="ask.id">
            {{ ask.owner_name }} is selling {{ ask.quote }} {{ chainResult.quote }} for
            {{ ask.base }} {{ chainResult.base }}
          </p>
        </span>
        <sl-button
          slot="footer"
          variant="neutral"
          @click="
            broadcast = true;
            beeteos = false;
          "
          >Buy lowest ask</sl-button
        >
      </div>

      <div
        v-if="!loading && !chainResult"
        label="Proceeding with BeetEOS broadcast"
        class="dialog-overview"
      >
        <p>Unable to locate blockchain data, try again later.</p>
        <sl-button slot="footer" variant="neutral" @click="retry += 1">Refresh</sl-button>
      </div>

      <sl-button
        slot="footer"
        variant="neutral"
        @click="
          open = true;
          beeteos = false;
        "
        >Close</sl-button
      >
    </sl-dialog>

    <sl-dialog :open="broadcast">
      <p v-if="chainResult">
        Buying {{ chainResult.asks[0].quote }} {{ chainResult.quote }} from
        {{ chainResult.asks[0].owner_name }} for {{ chainResult.asks[0].base }}
        {{ chainResult.base }}
      </p>

      <div v-if="!deeplink">
        <p>Generating your deeplink...</p>
        <sl-spinner></sl-spinner>
      </div>
      <div v-else>
        <p>
          Your BeetEOS raw deeplink is ready. Launch BeetEOS, navigate to the raw deeplink page,
          allow sufficient operations then click the following button to proceed.
        </p>
        <a
          :href="`rawbeeteos://api?chain=${
            currentUser.chain === 'bitshares' ? 'BTS' : 'BTS_TEST'
          }&request=${deeplink}`"
        >
          <sl-button slot="footer" variant="neutral">Broadcast to BeetEOS!</sl-button>
        </a>
      </div>

      <sl-button
        slot="footer"
        variant="neutral"
        @click="
          beeteos = true;
          broadcast = false;
        "
        >Close</sl-button
      >
    </sl-dialog>
  </div>
</template>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px;
  margin-top: 30px;
}
.smallGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 5px;
  margin-top: 30px;
}
.microGrid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 5px;
  margin-top: 30px;
}
</style>
