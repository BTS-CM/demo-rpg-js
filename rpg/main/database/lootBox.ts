import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

@Item({
    id: 'lootBox',
    name: 'Loot box',
    description: 'May contain gold, or may be empty! Try your luck!',
    price: 100,
    consumable: true
})
export default class LootBox {
    async onUse(player: RpgPlayer) {
        console.log("Opening loot box...");
        if (Math.random() < 0.25) {
            const goldQty = Math.random() * 1000;
            player.gold += goldQty;
            player.showNotification(`Congratulations! You've won ${goldQty} gold!`);
        } else {
            player.showNotification("Unlucky, you're not a winner. Better luck next time!");
        }
    }
}