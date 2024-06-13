import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import { $currentUser } from '../nanostores/users';

@Item({
    id: 'changeSprite',
    name: 'Change sprite',
    description: 'Change your sprite for a different look',
    price: 0,
    consumable: true // Must be true for GUI to launch
})
export default class ChangeSprite {
    async onUse(player: RpgPlayer) {
        await player.gui("sprite").open({}, {waitingAction: true, blockPlayerInput: true});
        const usr = $currentUser.get();
        player.setGraphic(usr.sprite);
    }
    
    onRemove(player: RpgPlayer) {
        player.addItem('changeSprite', 1); // avoid selling the tool
    }
}