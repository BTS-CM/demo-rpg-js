import { RpgPlayer, type RpgPlayerHooks, Control, Components } from "@rpgjs/server";
import {
  $currentUser,
  User,
} from "./nanostores/users";
import { createUserBalancesStore } from "./nanoeffects/UserBalances";
import { humanReadableFloat } from "./bts/common";

const _allowedVariables = ["AT_COMPUTER", "AT_MARKET", "AFTER_INTRO", "AT_GALLERY"];
const _allowedComponents = [
  "bts-computer",
  "computer",
  "eos-computer",
  "player-computer",
  "market",
  "gallery",
];


// Ask the user if they want to launch a GUI
async function promptPlayer(player: RpgPlayer, variable: string, prompt: string) {
  if (!variable || !_allowedVariables.includes(variable)) {
    console.log("Rejected prompt");
    return;
  }

  const retrievedVariable = player.getVariable(variable);

  if (
    !retrievedVariable.properties ||
    !retrievedVariable.properties.component ||
    !_allowedComponents.includes(retrievedVariable.properties.component)
  ) {
    console.log("Rejected prompt");
    return;
  }

  if (
    retrievedVariable.properties.component === "gallery" &&
    !retrievedVariable.properties.symbol.length
  ) {
    await player.showText("No art is currently on display here yet.");
    return;
  }

  const answer = await player.showChoices(prompt, [
    { text: "yes", value: "yes" },
    { text: "no", value: "no" },
  ]);

  if (!answer || (answer && answer.value === "no")) {
    console.log("User rejected prompt");
    return;
  }

  if (player.gui(retrievedVariable.properties.component)) {
    console.log("Closing previous GUI");
    await player.gui(retrievedVariable.properties.component).close();
    await player.hideAttachedGui();
  }

  await player
    .gui(retrievedVariable.properties.component)
    .open({ properties: retrievedVariable.properties });
  await player.showAttachedGui();
}

async function playerGold(player: RpgPlayer, usr: User) {
  if (!usr || !usr.chain) {
    return;
  }

  const userBalanceStore = createUserBalancesStore([usr.chain, usr.id]);

  const unsub = userBalanceStore.subscribe((result) => {
    if (result.error) {
      console.error(result.error);
    }

    if (!result.loading) {
      if (result.data) {
        const res = result.data as any[];
        const btsBalance = res.filter((x) => x.asset_id === "1.3.0");
        if (btsBalance.length) {
          player.gold = parseInt(humanReadableFloat(btsBalance[0].amount, 5).toFixed(0));
        }
      }
    }
  });

  return () => {
    unsub();
  };
}

const player: RpgPlayerHooks = {
  onConnected(player: RpgPlayer) {
    player.name = "";
    player.setGraphic("male-69");
    player.setComponentsTop(Components.text("{name}"));
  },
  async onInput(player: RpgPlayer, { input }) {
    if (input === Control.Back) {
      player.callMainMenu();
    }

    if (input === Control.Action && player.getVariable("AT_MARKET")) {
      await promptPlayer(player, "AT_MARKET", "Want to buy this item?");
    }

    if (input === Control.Action && player.getVariable("AT_GALLERY")) {
      await promptPlayer(player, "AT_GALLERY", "Want to view this item?");
    }

    if (input === Control.Action && player.getVariable("AT_COMPUTER")) {
      await promptPlayer(player, "AT_COMPUTER", "Want to access this computer?");
    }

    if (input === Control.Action && player.getVariable("AT_MESSAGE")) {
      const retrievedVariable = player.getVariable("AT_MESSAGE");

      if (!retrievedVariable.properties || !retrievedVariable.properties.msg) {
        await player.showText("Welcome to my RPG JS demo implementation!");
        await player.showText(
          "Try buying in game items, accessing computers, and viewing NFT art in the gallery!"
        );
        return;
      }

      await player.showText(retrievedVariable.properties.msg);
    }

    /*
    if (input === Control.Action) {
      console.log({ x: player.position.x, y: player.position.y });
    }
    */
  },
  async onInShape(player: RpgPlayer, shape: any) {
    if (shape.name.includes("wall") || shape.name.includes("collision")) {
      return; // avoid processing collision shapes
    }

    if (shape.name.includes("teleport") && !shape.obj.properties.x && !shape.obj.properties.y) {
      await player.changeMap(shape.obj.properties.destination);
      if (shape.obj.properties.direction) {
        player.direction = shape.obj.properties.direction;
      }
      return;
    }

    if (shape.name.includes("teleport") && shape.obj.properties.x && shape.obj.properties.y) {
      await player.changeMap(shape.obj.properties.destination, {
        x: shape.obj.properties.x,
        y: shape.obj.properties.y,
      });
      if (shape.obj.properties.direction) {
        player.direction = shape.obj.properties.direction;
      }
      return;
    }

    if (shape.name.includes("door")) {
      await player.changeMap(player.map, { x: shape.obj.properties.x, y: shape.obj.properties.y });
      if (shape.obj.properties.direction) {
        player.direction = shape.obj.properties.direction;
      }
      return;
    }

    if (shape.name === "message") {
      player.setVariable("AT_MESSAGE", { name: shape.name, properties: shape.obj.properties });
      player.name = "Read me!";
    }

    if (shape.name.includes("market")) {
      player.setVariable("AT_MARKET", { name: shape.name, properties: shape.obj.properties });
      player.name = shape.obj.properties.header;
    }

    if (shape.name.includes("gallery")) {
      player.setVariable("AT_GALLERY", { name: shape.name, properties: shape.obj.properties });
      player.name = shape.obj.properties.header;
    }

    if (shape.name.includes("computer")) {
      player.setVariable("AT_COMPUTER", { name: shape.name, properties: shape.obj.properties });
      player.name = shape.obj.properties.header;
    }
  },
  async onOutShape(player: RpgPlayer, shape: any) {
    if (shape.name.includes("message")) {
      player.name = " ";
      player.setVariable("AT_MESSAGE", null);
    }
    if (shape.name.includes("computer")) {
      player.name = " ";
      player.gui(shape.obj.properties.component).close();
      player.hideAttachedGui();
      player.setVariable("AT_COMPUTER", null);
    }
    if (shape.name.includes("market")) {
      player.name = " ";
      player.gui(shape.obj.properties.component).close();
      player.hideAttachedGui();
      player.setVariable("AT_MARKET", null);
    }
    if (shape.name.includes("gallery")) {
      player.name = " ";
      player.gui(shape.obj.properties.component).close();
      player.hideAttachedGui();
      player.setVariable("AT_GALLERY", null);
    }
  },
  async onJoinMap(player: RpgPlayer) {
    if (player.getVariable("AFTER_INTRO")) {
      return;
    }

    await player.gui("intro").open({}, {waitingAction: true, blockPlayerInput: true});

    const usr = $currentUser.get();
    await playerGold(player, usr);

    player.setVariable("AFTER_INTRO", true);
  },
};

export default player;
