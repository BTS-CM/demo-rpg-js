import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'


@Item({
    id: 'ale',
    name: 'Ale',
    description: 'Gives -10 HP',
    price: 20,
    hpValue: -10,
    consumable: true
})
export default class Ale {
    onAdd(player: RpgPlayer) {
        player.showNotification('You have added an ale to your inventory')
    }

    onUse(player: RpgPlayer) {
        player.showNotification('You have used an ale')
    }

    onUseFailed(player: RpgPlayer) {
        player.showNotification('You cannot use an ale')
    }

    onRemove(player: RpgPlayer) {
        player.showNotification('You have removed an ale from your inventory')
    }

    onAction(player: RpgPlayer) {
        player.showText('You see a bottle of ale')
    }
}