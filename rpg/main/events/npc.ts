import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server'

import Potion from '../database/potion';
import Ale from '../database/ale';
import Book from '../database/book';
import Cheese from '../database/cheese';
import Ham from '../database/ham';
import Pearl from '../database/pearl';

@EventData({
    name: 'npc'
})
export default class CharaEvent extends RpgEvent {
    onInit() {
        this.setGraphic(this.properties.sprite ?? "hero")
    }

    async onAction(player: RpgPlayer) {
        const job = this.properties.job;
        if (job === "shop-1") {
            await player.showText(`Hello, welcome to my shop! What would you like to buy or sell?`);
    
            player.callShop([
                Potion,
                Ale,
                Book,
                Cheese,
                Ham,
                Pearl
            ]);
        }
    }
}