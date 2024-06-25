import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_currency_stats(
  code: string,
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
    response = await rpc.get_currency_stats(code, symbol);
  } catch (error) {
    console.log({ error });
    return;
  }

  if (!response) {
    console.log(`Failed to fetch EOS currency stats...`);
    return;
  }

  return response;
}

const [createCurrencyStatsStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const code = args[0] as string;
    const symbol = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;

    return await get_currency_stats(code, symbol, specificNode);
  },
});

export { createCurrencyStatsStore, get_currency_stats };
