<script>
import { RpgPlayer } from "@rpgjs/server";
import { defineComponent, computed, watchEffect, ref, onMounted, inject, defineProps, toRaw } from "vue";
import { useStore } from "@nanostores/vue";

import {
  //type User,
  $currentUser,
  setCurrentUser,
  $userStorage,
  removeUser,
} from "../nanostores/users.ts";

import { createUserSearchStore } from "../nanoeffects/bitshares/UserSearch";

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";

export default defineComponent({
  name: "intro",
  setup() {
    const open = ref(true);
   
    const rpgGuiClose = inject("rpgGuiClose");

    const chain = ref();
    const method = ref();
    const inputText = ref();

    const inProgress = ref(false);
    const searchResult = ref(null);
    const searchError = ref(false);

    const spriteType = ref("male");
    const spriteValue = ref(0);
    
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

    const storedUsers = useStore($userStorage);

    async function search() {
      if (!chain.value || !inputText.value) {
        console.log("Invalid search parameters..");
        return;
      }

      searchError.value = false;
      inProgress.value = true;

      const searchStore = createUserSearchStore([chain.value, inputText.value]);

      const unsub = searchStore.subscribe((result) => {
        if (result.error) {
          searchError.value = true;
          inProgress.value = false;
          console.error(result.error);
        }

        if (!result.loading) {
          if (result.data) {
            const res = result.data;
            searchResult.value = res;
            inProgress.value = false;
          }
        }
      });

      return () => {
        unsub();
      };
    }

    function handleCloseRequest(event) {
      if (["overlay", "close-button", "escape"].includes(event.detail.source)) {
        event.preventDefault();
      }
    }

    function handleEscapeKey(event) {
      event.stopPropagation();
    }

    async function closeGUI() {     
      try {
        await rpgGuiClose('intro');
      } catch (error) {
        console.error(error);
      }
      
      open.value = false;
    }

    return {
      // basic dialog functionality
      open,
      chain,
      handleCloseRequest,
      handleEscapeKey,
      closeGUI,
      setCurrentUser,
      removeUser,
      // mode and storage
      method,
      storedUsers,
      // account search functionality
      inputText,
      inProgress,
      searchError,
      searchResult,
      search,
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
      label="Select a blockchain account to proceed!"
      class="dialog-overview"
      @sl-request-close="handleCloseRequest"
      @keydown.esc.prevent.stop="handleEscapeKey"
    >
      <div v-if="!chain">
        <p>Please select the blockchain you want to use.</p>
        <div class="smallGrid">
          <sl-button slot="footer" variant="primary" @click="chain = 'bitshares'"
            >Bitshares
          </sl-button>
          <sl-button slot="footer" variant="neutral" @click="chain = 'bitshares_testnet'">
            Bitshares testnet
          </sl-button>
        </div>
      </div>

      <div v-if="chain && !method">
        <p>
          {{
            chain === "bitshares"
              ? "You can either search for a new or a previous Bitshares account"
              : "You can either search for a new or a previous Bitshares testnet account"
          }}
        </p>
        <p>How do you want to proceed?</p>
        <div class="smallGrid">
          <sl-button slot="footer" variant="neutral" @click="method = 'new'">
            Search for an account
          </sl-button>
          <sl-button slot="footer" variant="neutral" @click="method = 'existing'">
            Previously used accounts
          </sl-button>
          <sl-button slot="footer" variant="neutral" @click="chain = null">Back</sl-button>
        </div>
      </div>

      <div v-if="chain && method === 'new'">
        <p>
          {{
            chain === "bitshares"
              ? "Searching for a replacement Bitshares (BTS) account"
              : "Searching for a replacement Bitshares testnet (TEST) account"
          }}
        </p>
        <sl-input
          type="text"
          placeholder="Username"
          @input="
            inputText = $event.target.value;
            searchResult = null;
            searchError = false;
          "
          @keypress.enter="search"
        ></sl-input>

        <div class="smallGrid">
          <sl-button slot="footer" variant="primary" @click="search">Search</sl-button>
          <sl-button slot="footer" variant="neutral" @click="method = null; searchResult = null; searchError = null;">Back</sl-button>
        </div>
        <sl-divider v-if="searchResult"></sl-divider>
      </div>

      <div v-if="searchResult && method !== 'sprite'">
        <p>
          {{
            chain === "bitshares"
              ? "Found the following Bitshares (BTS) account!"
              : "Found the following Bitshares testnet (TEST) account!"
          }}
        </p>
        <p>{{ searchResult.name }} ({{ searchResult.id }})</p>
        <sl-button
          slot="footer"
          variant="primary"
          @click="method = 'sprite';"
        >
          Proceed with this account
        </sl-button>
      </div>

      <div v-if="chain && method === 'existing'">
        <p>
          {{
            chain === "bitshares"
              ? "Selecting a previously used Bitshares (BTS) account"
              : "Selecting a previously used Bitshares testnet (TEST) account"
          }}
        </p>
        <div
          v-if="
            storedUsers &&
            storedUsers.users &&
            storedUsers.users.length > 0 &&
            storedUsers.users.filter((user) => user.chain === chain)
          "
        >
          <p>Choose an account from the list below:</p>

          <div style="max-height: 200px; overflow-y: scroll;" class="microGrid">
            <div v-for="user in storedUsers.users.filter((user) => user.chain === chain)">
              <sl-button
                variant="default"
                @click="
                  setCurrentUser(user.username, user.id, user.referrer, user.sprite, chain);
                  closeGUI();
                "
                :key="user.id"
                style="margin: 5px; width: 80%;"
              >
                <div class="parent">
                  <div
                    :style="{
                      width: '32px',
                      height: '32px',
                      backgroundImage: `url(/main/spritesheets/characters/${user.sprite}.png)`,
                      backgroundPosition: '-32px 0px',
                      backgroundSize: '96px 128px'
                    }"
                  ></div>
                  <div>
                    {{ user.username }} ({{ user.id }})
                  </div>
                </div>
              </sl-button>

              <sl-button
                variant="default"
                @click="removeUser(user.id)"
                :key="`${user.id}_remove`"
                style="margin: 5px;"
              >
                ❌
              </sl-button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No previously used accounts found, please use a new account.</p>
          <sl-button slot="footer" variant="primary" @click="method = 'new'" style="margin-bottom: 10px;">
            Find account
          </sl-button>
        </div>

        <sl-button slot="footer" variant="neutral" @click="method = null;" style="margin-top:15px;">Back</sl-button>
      </div>

      <div v-if="chain && method === 'sprite'">
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
            >Next</sl-button
          >
        </div>

        <div class="microGrid">
          <sl-button
            variant="primary"
            @click="
              setCurrentUser(
                searchResult.name,
                searchResult.id,
                searchResult.referrer,
                `${spriteType}-${spriteValue}`,
                chain
              );
              closeGUI();
            "
            size="small"
            pill
            >Use this sprite</sl-button
          >
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
