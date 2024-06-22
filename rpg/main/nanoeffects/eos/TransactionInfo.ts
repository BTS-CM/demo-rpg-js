import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

const [createTransactionInfoBlockStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const id = args[0] as string;
    const blockNumHint = args[1] ? (args[1] as number) : null;
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
      response = blockNumHint
        ? await rpc.history_get_transaction(id, blockNumHint)
        : await rpc.history_get_transaction(id);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch EOS transaction info details...`);
      return;
    }

    return response;
  },
});

export { createTransactionInfoBlockStore };
