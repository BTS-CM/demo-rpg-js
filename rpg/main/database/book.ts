import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import book from '../books/readme.json'

@Item({
    id: 'book',
    name: 'Book',
    description: 'A readable book',
    price: 200,
    consumable: true // Must be true for GUI to launch
})
export default class Book {
    onAdd(player: RpgPlayer) {

    }
    
    async onUse(player: RpgPlayer) {
        player.addItem('book', 1); // avoid losing the book
        await player.gui('book').open({contents: book.contents, title: book.title}, { waitingAction: true });
    }
    
    onRemove(player: RpgPlayer) {

    }
}