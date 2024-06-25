import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_table_by_scope(
  code: string,
  table: string,
  lower_bound: string | null,
  upper_bound: string | null,
  limit: number,
  chain: string,
  specificNode?: string | null,
  existingRPC?: JsonRpc | null
) {

  let rpc;
  try {
    rpc = existingRPC ? existingRPC : await new JsonRpc(specificNode ? specificNode : chains[chain].nodeList[0].url);
  } catch (error) {
    console.log({ error });
    return;
  }

  let response;
  try {
    response =   await rpc.get_table_by_scope({
      code,
      table,
      lower_bound: lower_bound ?? "",
      upper_bound: upper_bound ?? "",
      limit
    });
  } catch (error) {
    console.log({ error });
    return;
  }

  if (!response) {
    console.log(`Failed to fetch EOS table rows...`);
    return;
  }

  return response;
}

const [createTableRowStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {

    const code = args[0] as string;
    const table = args[1] as string;
    const lower_bound = args[2] ? (args[2] as string) : null;
    const upper_bound = args[3] ? (args[3] as string) : null;
    const limit = args[4] as number;

    let chain = args[5] ? (args[5] as string) : "EOS";
    let specificNode = args[6] ? (args[6] as string) : null;

    return await get_table_by_scope(
      code,
      table,
      lower_bound,
      upper_bound,
      limit,
      chain,
      specificNode
    );
  },
});

export { createTableRowStore, get_table_by_scope };
