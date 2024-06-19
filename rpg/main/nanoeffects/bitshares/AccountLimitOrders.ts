import { nanoquery } from "@nanostores/query";
import Apis from "../../bts/ws/ApiInstances";
import { chains } from "../../config/chains";

function getAccountLimitOrders (
  chain: string,
  accountID: string,
  limit?: number | null,
  lastID?: string | null,
  specificNode?: string | null
) {
    return new Promise(async (resolve, reject) => {
        let node = specificNode ? specificNode : chains[chain].nodeList[0].url;

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

        const options: any[] = [accountID];
        if (limit) {
          options.push(limit);
        }
        if (lastID) {
          options.push(lastID);
        }
    
        let limitOrders;
        try {
          limitOrders = await currentAPI
            .db_api()
            .exec("get_limit_orders_by_account", options)
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
    
        if (!limitOrders) {
          reject(new Error("Account limit orders not found"));
          return;
        }
    
        resolve(limitOrders);
      });
}

const [createAccountLimitOrderStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
      const chain = args[0] as string;
      const account_id = args[1] as string;
      const limit = args[2] ? args[2] as number : 100;
      const lastID = args[3] ? args[3] as string : null;
      let specificNode = args[4] ? args[4] as string : null;
  
      let response;
      try {
        response =  await getAccountLimitOrders(chain, account_id, limit, lastID, specificNode);
      } catch (error) {
        console.log({ error });
        return;
      }
  
      if (!response) {
        console.log(`Failed to fetch account limit orders`);
        return;
      }
  
      return response;
    },
  });
  
  export { createAccountLimitOrderStore, getAccountLimitOrders };
  