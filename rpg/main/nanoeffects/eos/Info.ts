import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_info(
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
}

const [createInfoStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    let specificNode = args[0] ? (args[0] as string) : null;

    return await get_info(specificNode);
  },
});

export { createInfoStore };
