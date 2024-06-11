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

import { createUserSearchStore } from "../nanoeffects/UserSearch";

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";

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
      if (event.detail.source === "overlay" || event.detail.source === "close-button") {
        event.preventDefault();
      }
    }

    async function closeGUI(name, id, referrer, chain) {
      setCurrentUser(name, id, referrer, chain);
      
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
      closeGUI,
      // mode and storage
      method,
      storedUsers,
      // account search functionality
      inputText,
      inProgress,
      searchError,
      searchResult,
      search,
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
    >
      <div v-if="!chain">
        <p>Please select the blockchain you want to use.</p>
        <div class="smallGrid">
          <sl-button slot="footer" variant="neutral" @click="chain = 'bitshares'"
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

      <div v-if="searchResult">
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
          @click="
            closeGUI(searchResult.name, searchResult.id, searchResult.referrer, chain);
          "
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

          <sl-button
            v-for="user in storedUsers.users.filter((user) => user.chain === chain)"
            @click="
              closeGUI(user.username, user.id, user.referrer, chain);
            "
            :key="user.id"
            variant="neutral"
            style="margin: 5px"
          >
            {{ user.username }} ({{ user.id }})
          </sl-button>
        </div>
        <div v-else>
          <p>No previously used accounts found, please use a new account.</p>
          <sl-button slot="footer" variant="neutral" @click="method = 'new'">
            Find account
          </sl-button>
        </div>
        <sl-button slot="footer" variant="neutral" @click="method = null;">Back</sl-button>
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
</style>
