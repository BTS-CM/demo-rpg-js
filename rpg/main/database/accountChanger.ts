import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import { $currentUser, eraseCurrentUser } from '../nanostores/users';
import { playerGold } from '../common/player';

@Item({
    id: 'accountChanger',
    name: 'Account changer',
    description: 'Switch between accounts and blockchains with this tool.',
    price: 0,
    consumable: true // Must be true for GUI to launch
})
export default class Book {
    async onUse(player: RpgPlayer) {
        await player.gui("intro").open({}, {waitingAction: true, blockPlayerInput: true});

        const usr = $currentUser.get();
        await playerGold(player, usr);

        player.setGraphic(usr.sprite);

        player.items = [];
        player.addItem("accountChanger", 1); // default user item
        player.changeMap('map');
    }
    
    onRemove(player: RpgPlayer) {
        player.addItem('accountChanger', 1); // avoid selling the tool
    }
}