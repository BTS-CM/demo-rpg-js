import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'


@Item({
    id: 'cheese',
    name: 'Cheese',
    description: 'Gives 5 HP',
    price: 5,
    hpValue: 5
})
export default class Cheese {
    onAdd(player: RpgPlayer) {

    }

    onUse(player: RpgPlayer) {

    }

    onUseFailed(player: RpgPlayer) {

    }

    onRemove(player: RpgPlayer) {

    }
}