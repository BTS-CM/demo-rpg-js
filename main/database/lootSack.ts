import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import items from '../assets/index';

@Item({
    id: 'lootSack',
    name: 'Loot sack',
    description: 'Contains 3 random items, try your luck!',
    price: 100,
    consumable: true
})
export default class LootSack {
    async onUse(player: RpgPlayer) {
        const chosenItems: any[] = [];
        for (let i = 0; i < 3; i++) {
            const item = items[Math.floor(Math.random() * items.length)];
            player.addItem((item as any).id, 1);
            if (item) {
                chosenItems.push((item.prototype as any).name);
            }
        }
        player.showNotification(`The loot sack contained the items: ${chosenItems.join(", ")}!`);
    }
}