import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_activated_protocol_features(
    limit: number,
    search_by_block_num: boolean,
    reverse: boolean,
    lower_bound?: string | null,
    upper_bound?: string | null,
    specificNode?: string | null,
    existingRPC?: JsonRpc | null
) {
    let rpc;
    try {
        rpc = existingRPC
            ? existingRPC
            : await new JsonRpc(specificNode ? specificNode : chains["EOS"].nodeList[0].url);
    } catch (error) {
        console.log({ error });
        return;
    }

    let activatedProtocolFeatures;
    try {
        activatedProtocolFeatures = await rpc.get_activated_protocol_features(
            limit,
            search_by_block_num,
            reverse,
            lower_bound,
            upper_bound
        );
    } catch (error) {
        console.log({ error });
    }

    return activatedProtocolFeatures;
}

const [createEOSActivatedProtocolFeaturesStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
        const limit = args[0] as number;
        const search_by_block_num = args[1] as boolean;
        const reverse = args[2] as boolean;
        const lower_bound = args[3] ? (args[3] as string) : null;
        const upper_bound = args[4] ? (args[4] as string) : null;
        let specificNode = args[5] ? (args[5] as string) : null;

        return await get_activated_protocol_features(
            limit,
            search_by_block_num,
            reverse,
            lower_bound,
            upper_bound,
            specificNode
        );
    },
});

export { createEOSActivatedProtocolFeaturesStore, get_activated_protocol_features };