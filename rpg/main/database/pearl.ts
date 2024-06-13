import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

@Item({
    id: 'pearl',
    name: 'Pearl',
    description: 'Collectable',
    price: 200,
})
export default class Pearl {
    onAdd(player: RpgPlayer) {

    }
    onRemove(player: RpgPlayer) {

    }
}