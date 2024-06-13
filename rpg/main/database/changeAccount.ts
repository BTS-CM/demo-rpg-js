import { RpgPlayer } from '@rpgjs/server'
import { Item } from '@rpgjs/database'

import { $currentUser } from '../nanostores/users';
import { playerGold } from '../common/player';

@Item({
    id: 'changeAccount',
    name: 'Change account',
    description: 'Switch between accounts and blockchains with this tool.',
    price: 0,
    consumable: true // Must be true for GUI to launch
})
export default class ChangeAccounts {
    async onUse(player: RpgPlayer) {
        await player.gui("intro").open({}, {waitingAction: true, blockPlayerInput: true});

        const usr = $currentUser.get();
        await playerGold(player, usr);

        player.setGraphic(usr.sprite);

        player.items = [];
        player.addItem("changeAccount", 1);
        player.addItem("changeSprite", 1);

        player.showNotification("Changed account. Items and gold have been reset.");
    }
}