import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function history_get_key_accounts(
  public_key: string,
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
    response = await rpc.history_get_key_accounts(public_key);
  } catch (error) {
    console.log({ error });
    return;
  }

  if (!response) {
    console.log(`Failed to fetch EOS accounts from a public key...`);
    return;
  }

  return response;
}

const [createKeyAccountStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const public_key = args[0] as string;
    let specificNode = args[1] ? (args[1] as string) : null;

    return await history_get_key_accounts(public_key, specificNode);
  },
});

export { createKeyAccountStore, history_get_key_accounts };
