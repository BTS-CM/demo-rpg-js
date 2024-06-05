import { nanoquery } from "@nanostores/query";
import Apis from "../bts/ws/ApiInstances.js";

//Fetch account balances
async function getAccountBalances(chain: String, accountID: String) {
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

    let balances;
    try {
      balances = await currentAPI
        .db_api()
        .exec("get_account_balances", [accountID, []])
        .then((results: Object[]) => {
          if (results && results.length) {
            return results;
          }
        });
    } catch (error) {
      console.log({ error });
      currentAPI.close();
      reject(error);
    }

    currentAPI.close();

    if (!balances) {
      return resolve([]);
    }

    return resolve(balances);
  });
}

// Create fetcher store for user balances
const [createUserBalancesStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const accountID = args[1] as string;

    let response;
    try {
      response = await getAccountBalances(chain, accountID);
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

export { createUserBalancesStore };
