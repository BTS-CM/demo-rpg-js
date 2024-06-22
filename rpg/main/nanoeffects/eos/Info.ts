import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createInfoStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    let specificNode = args[0] ? (args[0] as string) : null;

    let rpc;
    try {
      rpc = await new JsonRpc(specificNode ? specificNode : chains["EOS"].nodeList[0].url);
    } catch (error) {
      console.log({ error });
      return;
    }

    let response;
    try {
      response = await rpc.get_info();
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch EOS info...`);
      return;
    }

    return response;
  },
});

export { createInfoStore };
