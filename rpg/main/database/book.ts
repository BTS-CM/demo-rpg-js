import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'


@Item({
    id: 'book',
    name: 'Book',
    description: 'A readable book',
    price: 200,
    consumable: true
})
export default class Book {
    onAdd(player: RpgPlayer) {

    }
    
    async onUse(player: RpgPlayer) {
        // Consumable to trigger this event
        player.addItem('book', 1); // avoid losing the book
        await player.gui('book').open({}, { waitingAction: true });
    }
    
    onRemove(player: RpgPlayer) {

    }
}