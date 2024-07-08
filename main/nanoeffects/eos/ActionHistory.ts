import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function history_get_actions(
    accountName: string,
    pos: number,
    offset: number,
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

    let response;
    try {
        response = await rpc.history_get_actions(
            accountName, pos, offset
        );
    } catch (error) {
        console.log({ error });
        return;
    }

    if (!response) {
        console.log(`Failed to fetch EOS action history...`);
        return;
    }

    return response;
}

const [createActionHistoryStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
        const accountName = args[0] as string;
        const pos = args[1] as number;
        const offset = args[2] as number;
        let specificNode = args[3] ? (args[3] as string) : null;

        return await history_get_actions(accountName, pos, offset, specificNode);
    },
});

export { createActionHistoryStore, history_get_actions };