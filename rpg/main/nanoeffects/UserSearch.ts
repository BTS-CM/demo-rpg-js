import { nanoquery } from "@nanostores/query";
import Apis from "../bts/ws/ApiInstances.js";

async function accountSearch(chain: String, search_string: String) {
  return new Promise(async (resolve, reject) => {
    const node =
      chain === "bitshares" ? "wss://node.xbts.io/ws" : "wss://eu.nodes.testnet.bitshares.ws";

    let currentAPI;
    try {
      currentAPI = await Apis.instance(node, true, 4000, { enableDatabase: true }, (error: Error) =>
        console.log({ error })
      );
    } catch (error) {
      console.log({ error });
      reject(error);
      return;
    }

    let object;
    try {
      object = await currentAPI.db_api().exec("get_accounts", [[search_string]]);
    } catch (error) {
      console.log({ error });
      currentAPI.close();
      reject(error);
    }

    if (!object || !object.length) {
      return reject(new Error("Couldn't retrieve account"));
    }

    currentAPI.close();
    resolve(object[0]);
  });
}

const [createUserSearchStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const searchText = args[1] as string;

    let response;
    try {
      response = await accountSearch(chain, searchText);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch user balances`);
      return;
    }

    return response;
  },
});

export { createUserSearchStore };
