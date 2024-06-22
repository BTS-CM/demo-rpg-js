import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createTableRowStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {

    const json = args[0] as boolean;
    const code = args[1] as string;
    const scope = args[2] as string;
    const table = args[3] as string;
    const limit = args[4] as number;
    const reverse = args[5] ? (args[5] as boolean) : false;
    const show_payer = args[6] ? (args[6] as boolean) : false;
    const lower_bound = args[7] ? (args[7] as string) : null;
    const index_position = args[8] ? (args[8] as number) : null;

    let chain = args[9] ? (args[9] as string) : "EOS";
    let specificNode = args[10] ? (args[10] as string) : null;

    let rpc;
    try {
      rpc = await new JsonRpc(specificNode ? specificNode : chains[chain].nodeList[0].url);
    } catch (error) {
      console.log({ error });
      return;
    }

    let options = {
      json, // Get the response as json
      code, // Contract that we target
      scope, // Account that owns the data
      table, // Table name
      limit, // Maximum number of rows that we want to get
      reverse, // Optional: Get reversed data
      show_payer // Optional: Show ram payer
    }

    if (lower_bound) {
      options["lower_bound"] = lower_bound; // Table primary key value
    }

    if (index_position) {
      options["index_position"] = index_position; // secondary index
    }

    let response;
    try {
      response =   await rpc.get_table_rows(options);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch EOS table rows...`);
      return;
    }

    return response;
  },
});

export { createTableRowStore };
