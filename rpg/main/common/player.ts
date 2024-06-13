import { RpgPlayer, type RpgPlayerHooks, Control, Components } from "@rpgjs/server";

import { User } from "../nanostores/users";
import { createUserBalancesStore } from "../nanoeffects/bitshares/UserBalances";
import { humanReadableFloat } from "../bts/common";

async function playerGold(player: RpgPlayer, usr: User) {
    if (!usr || !usr.chain) {
      return;
    }

    const userBalanceStore = createUserBalancesStore([usr.chain, usr.id]);
  
    const unsub = userBalanceStore.subscribe((result) => {
      if (result.error) {
        console.error(result.error);
      }
  
      if (!result.loading) {
        if (result.data) {
          const res = result.data as any[];
          const btsBalance = res.filter((x) => x.asset_id === "1.3.0");
          if (btsBalance.length) {
            player.gold = parseInt(humanReadableFloat(btsBalance[0].amount, 5).toFixed(0));
          }
        }
      }
    });
  
    return () => {
      unsub();
    };
}

export {
    playerGold
};