import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import items from '../assets/index';

@Item({
    id: 'lootSack',
    name: 'Loot sack',
    description: 'Contains a random item, try your luck!',
    price: 100,
    consumable: true
})
export default class LootSack {
    async onUse(player: RpgPlayer) {
        const item = items[Math.floor(Math.random() * items.length)];
        player.addItem((item as any).id, 1);
        player.showNotification(`The loot sack contained a ${(item.prototype as any).name}!`);
    }
}