import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createEOSBlockStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const block_number = args[0] as number;
    let specificNode = args[1] ? (args[1] as string) : null;

    let rpc;
    try {
      rpc = await new JsonRpc(specificNode ? specificNode : chains["EOS"].nodeList[0].url);
    } catch (error) {
      console.log({ error });
      return;
    }

    let response;
    try {
      response = await rpc.get_block(block_number);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch EOS block details...`);
      return;
    }

    return response;
  },
});

export { createEOSBlockStore };
