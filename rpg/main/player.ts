import { RpgPlayer, type RpgPlayerHooks, Control, Components } from "@rpgjs/server";

const _allowedVariables = ["AT_COMPUTER", "AT_MARKET", "AFTER_INTRO", "AT_GALLERY"];
const _allowedComponents = [
  "bts-computer",
  "computer",
  "eos-computer",
  "player-computer",
  "market",
  "gallery",
];

async function promptPlayer(player: RpgPlayer, variable: string, prompt: string) {
  if (!variable || !_allowedVariables.includes(variable)) {
    console.log("Rejected prompt");
    return;
  }

  const retrievedVariable = player.getVariable(variable);

  const answer = await player.showChoices(prompt, [
    { text: "yes", value: "yes" },
    { text: "no", value: "no" },
  ]);

  if (
    !answer ||
    (answer && answer.value === "no") ||
    !retrievedVariable.properties ||
    !retrievedVariable.properties.component ||
    !_allowedComponents.includes(retrievedVariable.properties.component)
  ) {
    console.log("User rejected prompt");
    return;
  }

  player
    .gui(retrievedVariable.properties.component)
    .open({ properties: retrievedVariable.properties });
  player.showAttachedGui();
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

    //console.log({ x: player.position.x, y: player.position.y });
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
    await player.showText("Welcome to the astro rpg js");
    player.setVariable("AFTER_INTRO", true);
  },
};

export default player;
