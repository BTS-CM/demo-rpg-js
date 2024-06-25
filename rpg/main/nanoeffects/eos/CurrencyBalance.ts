import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_currency_balance(
  account_name: string,
  symbol: string,
  specificNode?: string | null,
  existingRPC?: JsonRpc | null
) {
  let rpc;
  try {
    rpc = existingRPC ? existingRPC : await new JsonRpc(specificNode ? specificNode : chains["EOS"].nodeList[0].url);
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
}

const [createEOSAccountStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const account_name = args[0] as string;
    const symbol = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;

    return await get_currency_balance(account_name, symbol, specificNode);
  },
});

export { createEOSAccountStore, get_currency_balance };
