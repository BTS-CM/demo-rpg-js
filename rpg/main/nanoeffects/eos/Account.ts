import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_account(
  account_name: string,
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
    response = await rpc.get_account(account_name);
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
    let specificNode = args[1] ? (args[1] as string) : null;

    return await get_account(account_name, specificNode);
  },
});

export { createEOSAccountStore, get_account };
