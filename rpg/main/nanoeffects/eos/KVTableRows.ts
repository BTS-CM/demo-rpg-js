import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createKVTableRowStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {

    const json = args[0] as boolean;
    const code = args[1] as string;
    const table = args[2] as string;
    const indexName = args[3] as string;
    const limit = args[4] as number;

    const indexValue = args[5] ? args[5] as string : null; // Method 1

    const lowerBound = args[6] ? args[6] as string : null; // Method 2
    const upperBound = args[7] ? args[7] as string : null; // Method 2

    const reverse = args[8] ? (args[8] as boolean) : false;
    const show_payer = args[9] ? (args[9] as boolean) : false;
    
    let chain = args[10] ? (args[10] as string) : "EOS";
    let specificNode = args[11] ? (args[11] as string) : null;

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
      table, // Table name
      indexName, // The name of the index name
      limit, // Maximum number of rows that we want to get
      reverse, // Optional: Get reversed data
      show_payer // Optional: Show ram payer
    }

    if (indexValue) {
      options["indexValue"] = indexValue; // Table primary key value
    }

    if (lowerBound && upperBound) {
      options["lowerBound"] = lowerBound; // Table primary key value
      options["upperBound"] = upperBound; // Table primary key value
    }

    let response;
    try {
      response = await rpc.get_kv_table_rows(options);
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

export { createKVTableRowStore };
