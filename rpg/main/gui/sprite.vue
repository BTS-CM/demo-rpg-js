<script>
import { RpgPlayer } from "@rpgjs/server";
import { defineComponent, computed, watchEffect, ref, onMounted, inject, defineProps, toRaw } from "vue";
import { useStore } from "@nanostores/vue";

import {
  //type User,
  $currentUser,
  changeSprite,
} from "../nanostores/users.ts";

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";

export default defineComponent({
  name: "sprite",
  setup() {
    const open = ref(true);
   
    const rpgGuiClose = inject("rpgGuiClose");

    const spriteType = ref("male");
    const spriteValue = ref(0);
    
    onMounted(() => {
      const user = $currentUser.get();
      const currentSprite = user.sprite;
      const [type, value] = currentSprite.split("-");
      spriteType.value = type;
      spriteValue.value = parseInt(value);
    });

    const spriteTypeQty = computed(() => {
      if (spriteType.value === "male") {
        return 74;
      } else {
        return 96;
      }
    });

    watchEffect(() => {
        if (spriteValue.value > spriteTypeQty.value) {
          spriteValue.value = spriteTypeQty.value - 1;
        }
    });

    const spriteURL = computed(() => {
      return `/main/spritesheets/characters/${spriteType.value}-${spriteValue.value}.png`;
    });

    async function closeGUI() {     
      try {
        await rpgGuiClose('sprite');
      } catch (error) {
        console.error(error);
      }
      
      open.value = false;
    }

    return {
      // basic dialog functionality
      open,
      closeGUI,
      changeSprite,
      // sprite selection
      spriteType,
      spriteValue,
      spriteTypeQty,
      spriteURL,
    };
  },
});
</script>

<template>
  <div class="computer">
    <sl-dialog
      :open="open"
      label="Selecting a new sprite"
      class="dialog-overview"
    >
      <div>
        <h3>Choose how your character appears</h3>
        <sl-radio-group :value="spriteType" @sl-change="spriteType = $event.target.value" size="medium" label="Select a sprite type" name="gender">
          <sl-radio-button style="margin-top: 10px;" pill value="male">Male</sl-radio-button>
          <sl-radio-button style="margin-top: 10px;" pill value="female">Female</sl-radio-button>
        </sl-radio-group>

        <img style="margin-top: 20px;" :src="spriteURL" />

        <p>Viewing {{ spriteValue + 1 }} of {{ spriteTypeQty }} {{ spriteType }} sprites</p>

        <div class="smallGrid">
          <sl-button
            variant="neutral"
            @click="spriteValue > 0 ? (spriteValue -= 1) : (spriteValue = spriteTypeQty - 1)"
            size="small"
            pill
          >
            Previous
          </sl-button>
          <sl-button
            variant="neutral"
            @click="spriteValue < spriteTypeQty - 1 ? (spriteValue += 1) : (spriteValue = 0)"
            size="small"
            pill
          >
            Next
          </sl-button>
        </div>

        <div class="microGrid">
          <sl-button
            variant="primary"
            @click="
              changeSprite(`${spriteType}-${spriteValue}`);
              closeGUI();
            "
            size="small"
            pill
          >
            Use this sprite
          </sl-button>
        </div>

      </div>

    </sl-dialog>
  </div>
</template>

<style scoped>
sl-dialog::part(header) {
  padding-bottom: 5px;
}
sl-dialog::part(body) {
  padding-top: 5px;
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
  margin-top: 15px;
}
.parent {
  display: flex;
  align-items: center;
}
.parent > div:first-child {
  flex-shrink: 0;
  flex-basis: 32px;
  margin-right: 10px;
}
.parent > div:last-child {
  flex-grow: 1;
}
</style>
