import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'


@Item({
    id: 'book',
    name: 'Book',
    description: 'A readable book',
    price: 200
})
export default class Book {
    onAdd(player: RpgPlayer) {

    }

    onUse(player: RpgPlayer) {

    }

    onUseFailed(player: RpgPlayer) {

    }

    onRemove(player: RpgPlayer) {

    }
}