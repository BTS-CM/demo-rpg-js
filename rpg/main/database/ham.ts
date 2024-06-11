import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

@Item({
    id: 'ham',
    name: 'ham',
    description: 'Gives 100 HP',
    price: 200,
    hpValue: 100
})
export default class Ham {
    onAdd(player: RpgPlayer) {

    }

    onUse(player: RpgPlayer) {

    }

    onUseFailed(player: RpgPlayer) {

    }

    onRemove(player: RpgPlayer) {

    }
}