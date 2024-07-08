import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function get_all_producers (
    json: boolean,
    lower_bound: string = "",
    limit: number = 50,
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
        response = await rpc.get_producers(json, lower_bound, limit);
    } catch (error) {
        console.log({ error });
        return;
    }

    if (!response) {
        console.log(`Failed to fetch EOS producers...`);
        return;
    }

    return response;
}

const [createEOSProducersStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
        const json = args[0] as boolean;
        const lower_bound = args[1] as string;
        const limit = args[2] as number;
        let specificNode = args[3] ? (args[3] as string) : null;

        return await get_all_producers(json, lower_bound, limit, specificNode);
    },
});

export { createEOSProducersStore, get_all_producers };