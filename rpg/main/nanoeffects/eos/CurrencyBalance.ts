import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createEOSAccountStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const account_name = args[0] as string;
    const symbol = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;

    let rpc;
    try {
      rpc = await new JsonRpc(specificNode ? specificNode : chains["EOS"].nodeList[0].url);
    } catch (error) {
      console.log({ error });
      return;
    }

    let response;
    try {
      response = await rpc.get_currency_balance('eosio.token', account_name, symbol)
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch EOS account details...`);
      return;
    }

    return response;
  },
});

export { createEOSAccountStore };
