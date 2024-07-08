import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_producer_schedule(
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
    response = await rpc.get_producer_schedule();
  } catch (error) {
    console.log({ error });
    return;
  }

  if (!response) {
    console.log(`Failed to fetch EOS producer schedule...`);
    return;
  }

  return response;
}

const [createEOSProducerScheduleStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    let specificNode = args[0] ? (args[0] as string) : null;

    return await get_producer_schedule(specificNode);
  },
});

export { createEOSProducerScheduleStore, get_producer_schedule };