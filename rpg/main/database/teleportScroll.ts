import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

@Item({
    id: 'teleportScroll',
    name: 'Scroll of teleportation',
    description: 'Teleports you to another map of your choosing!',
    price: 100,
    consumable: true
})
export default class TeleportScroll {
    async onUse(player: RpgPlayer) {

        player.removeGui("rpg-main-menu"); // hide main menu

        const choice = await player.showChoices('Where do you want to teleport to?', [
            { text: 'The docks', value: 'map' },
            { text: 'Market', value: 'shop-1' },
            { text: 'NFTEA Gallery', value: 'gallery' },
            { text: 'Castle entrance', value: 'castle-entrance' },
            { text: 'Underground office', value: 'shop-4' },
            { text: 'Underground passage', value: 'corridor' }
        ])

        if (!choice) {
            player.addItem('teleportScroll', 1);
            return;
        }

        const map = choice.value;
        player.changeMap(map);
    }
}