import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_block(
  block_number: number,
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

  let _block;
  try {
    _block = await rpc.get_block(block_number);
  } catch (error) {
    console.log({ error });
  }

  let _blockInfo;
  try {
    _blockInfo = await rpc.get_block_info(block_number);
  } catch (error) {
    console.log({ error });
  }

  let _blockHeaderState;
  try {
    _blockHeaderState = await rpc.get_block_header_state(block_number);
  } catch (error) {
    console.log({ error });
  }

  return {
    block: _block ?? null,
    blockInfo: _blockInfo ?? null,
    blockHeaderState: _blockHeaderState ?? null
  };
}

const [createEOSBlockStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const block_number = args[0] as number;
    let specificNode = args[1] ? (args[1] as string) : null;

    return await get_block(block_number, specificNode);
  },
});

export { createEOSBlockStore, get_block };
