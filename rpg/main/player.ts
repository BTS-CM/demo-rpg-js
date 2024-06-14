import { RpgPlayer, type RpgPlayerHooks, Control, Components } from "@rpgjs/server";
import { RpgGui } from '@rpgjs/client'

import { $currentUser, User } from "./nanostores/users";
import { playerGold } from "./common/player";

import items from "./assets";

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

  if (
    RpgGui.exists(retrievedVariable.properties.component) || 
    player.gui(retrievedVariable.properties.component)
  ) {
    console.log("Closing previous GUI");
    await player.gui(retrievedVariable.properties.component).close();
    await player.hideAttachedGui();
  }

  await player
    .gui(retrievedVariable.properties.component)
    .open({ properties: retrievedVariable.properties, player }, { waitingAction: true });

  await player.showAttachedGui();
}

const player: RpgPlayerHooks = {
  onConnected(player: RpgPlayer) {
    player.name = "";
    player.setComponentsTop(Components.text("{name}"));
  },
  async onInput(player: RpgPlayer, { input }) {
    if (input === Control.Back) {
      player.callMainMenu();
    }

    if (input === Control.Action && player.getVariable("AT_MARKET")) {
      await promptPlayer(player, "AT_MARKET", "Want to evaluate this item?");
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


    if (input === Control.Action) {
      console.log({ x: player.position.x, y: player.position.y });
    }

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
      const relevantItem = items.find(item => (item as any).id === shape.obj.properties.item);
      player.name = relevantItem ? (relevantItem.prototype as any).name : "";
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

    await playerGold(player, usr); // assign gold to player

    player.setGraphic(usr.sprite);
    player.addItem("changeAccount", 1); // default user item
    player.addItem("changeSprite", 1); // default user item

    player.setVariable("AFTER_INTRO", true);
  },
};

export default player;
