import { RpgPlayer, type RpgPlayerHooks, Control, Components } from "@rpgjs/server";

const player: RpgPlayerHooks = {
  onConnected(player: RpgPlayer) {
    player.name = "😎";
    player.setComponentsTop(Components.text("{name}"));
  },
  onInput(player: RpgPlayer, { input }) {
    if (input == Control.Back) {
      player.callMainMenu();
    }
    if (input == Control.Action && player.getVariable("AT_COMPUTER")) {
      player.showNotification("Accessing computer...");
      player.gui("computer").open();
      player.showAttachedGui();
    }
    //console.log({ x: player.position.x, y: player.position.y });
  },
  async onInShape(player: RpgPlayer, shape: any) {
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
      await player.showText("Welcome to my RPG JS demo implementation!");
      await player.showNotification("Message notification");
      const answer = await player.showChoices("Want to proceed?", [
        { text: "yes", value: "yes" },
        { text: "no", value: "no" },
      ]);
      console.log({ answer });
      return;
    }

    if (shape.name.includes("computer")) {
      player.setVariable("AT_COMPUTER", { name: shape.name, obj: shape.obj });
    }
  },
  async onOutShape(player: RpgPlayer, shape: any) {
    if (shape.name.includes("computer")) {
      player.setVariable("AT_COMPUTER", null);
      player.hideAttachedGui();
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
