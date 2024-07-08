import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

@Item({
    id: 'potion',
    name: 'Potion',
    description: 'Gives 10 HP',
    price: 20,
    hpValue: 10,
    hitRate: 1,
    consumable: true,
    addStates: [],
    removeStates: [],
    elements: [],
    paramsModifier: {}
})
export default class Potion {
    onAdd(player: RpgPlayer) {
        player.showNotification('You have added a potion to your inventory')
    }

    onUse(player: RpgPlayer) {
        player.showNotification('You have used a potion')
        player.hp += 10
    }

    onUseFailed(player: RpgPlayer) {
        player.showNotification('You cannot use a potion')
    }

    onRemove(player: RpgPlayer) {
        player.showNotification('You have removed a potion from your inventory')
    }
}