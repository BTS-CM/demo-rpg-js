import { nanoquery } from "@nanostores/query";
import { JsonRpc } from 'eosjs';

import { chains } from "../../config/chains";

async function code(
    accountName: string,
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

    let _code;
    try {
        _code = await rpc.get_code(accountName);
    } catch (error) {
        console.log({ error });
        return;
    }

    let _codeHash;
    try {
        _codeHash = await rpc.get_code_hash(accountName);
    } catch (error) {
        console.log({ error });
        return;
    }

    return {
        code: _code ?? null,
        codeHash: _codeHash ?? null
    };
}

const [createEOSCodeStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
        const accountName = args[0] as string;
        let specificNode = args[1] ? (args[1] as string) : null;

        return await code(accountName, specificNode);
    },
});

export { createEOSCodeStore, code };