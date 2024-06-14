<script>
import { RpgPlayer } from '@rpgjs/server'
import { defineComponent, computed, watchEffect, ref, onMounted, inject } from "vue";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";

import items from "../assets/index.ts";

export default defineComponent({
  name: "market",
  props: {
    properties: {
      type: Object,
      required: true,
    },
    player: {
      type: RpgPlayer,
      default: null,
    }
  },
  setup(props) {  
    const open = ref(true);
    const rpgGuiClose = inject("rpgGuiClose");

    const qty = ref(1);

    const item = computed(() => {
      return props.properties.item;
    });

    const itemProps = computed (() => {
      return items.find(item => item.id == props.properties.item);
    });

    const player = computed(() => {
      return props.player;
    });

    const totalPrice = computed(() => {
      return itemProps.value.price * qty.value;
    });

    watchEffect(async () => {
      if (open.value) {
        console.log(`Market GUI opened: ${itemProps.value.name}`);
      } else {
        console.log("Market GUI closed...");
        try {
          await rpgGuiClose("market");
        } catch (e) {
          console.error(e);
        }
      }
    });

    function buy() {
      if (player.value.gold >= itemProps.value.price) {
        player.value.gold -= itemProps.value.price;
        player.value.addItem(itemProps.value.id, qty.value);
        open.value = false;
      } else {
        console.log('You have insufficient gold for this purchase!');
      }
    }

    function leave() {
      open.value = false;
    }

    return {
      open,
      //
      gold: player.gold,
      //
      item,
      itemProps,
      //
      totalPrice,
      qty,
      buy,
      leave
    };
  },
});
</script>

<template>
  <div class="market">
    <sl-dialog :open="open" label="Would you like to buy this item?" class="dialog-overview">
      <div class="details">
        <div>
          <img :src="`/main/assets/${itemProps.id}.png`" alt="item" style="width: 100px; height: 100px;" />
        </div>
        <div>
          <h4 style="margin: 0px; padding: 0px;">
            Item: {{ itemProps.name }}
          </h4>
          <p>
            Description: {{ itemProps.prototype.description }}<br/>
            Price: {{ itemProps.price }}<br/>
            {{ itemProps.prototype.hpValue ? 'HP value: ' + itemProps.prototype.hpValue : '' }}
          </p>
        </div>
      </div>
      <sl-alert v-if="gold < totalPrice" variant="danger" open>
        ⛔ <strong>You have insufficient gold for this purchase!</strong>
      </sl-alert>
      <p>How many would you like?</p>
      <p>{{ qty }} {{ itemProps.prototype.name }} for {{ totalPrice }} gold.</p>
      <div class="smallGrid" style="padding-bottom: 10px;">
        <sl-button size="small" @click="qty > 1 ? qty -= 1 : qty = 1">- 1</sl-button>
        <sl-button size="small" @click="qty += 1">+ 1</sl-button>
      </div>
      <div class="smallGrid">
        <sl-button slot="footer" variant="primary" @click="buy">Buy</sl-button>
        <sl-button slot="footer" variant="warning" @click="leave">Leave</sl-button>
      </div>
    </sl-dialog>
  </div>
</template>

<style>
.smallGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 5px;
  margin-top: 5px;
}
.details {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 5px;
  margin-top: 30px;
}
</style>
