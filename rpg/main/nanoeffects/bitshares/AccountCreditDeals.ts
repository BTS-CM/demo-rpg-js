import { nanoquery } from "@nanostores/query";
import Apis from "../../bts/ws/ApiInstances";
import { chains } from "../../config/chains";

function fetchCreditDeals (
  chain: string,
  account_name_or_id: string,
  limit?: number | null,
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

        let options: any[] = [account_name_or_id];
        if (limit) {
          options.push(limit);
        }

        try {
          const [borrowerDeals, ownerDeals] = await Promise.all([
            currentAPI.db_api().exec("get_credit_deals_by_borrower", options),
            currentAPI.db_api().exec("get_credit_deals_by_offer_owner", options),
          ]);
    
          if (!borrowerDeals || !ownerDeals) {
            return reject(new Error("Couldn't retrieve credit deals"));
          }
    
          return resolve(
            {
              borrowerDeals,
              ownerDeals,
            }
          );
        } catch (error) {
          console.log({ error });
          return reject(error);
        } finally {
          try {
            currentAPI.close();
          } catch (error) {
            console.log({ error });
          }
        }
        
      });
}

const [createAccountCreditDealsStore] = nanoquery({
    fetcher: async (...args: unknown[]) => {
      const chain = args[0] as string;
      const account_id = args[1] as string;
      const limit = args[2] ? args[2] as number : 100;
      let specificNode = args[3] ? args[3] as string : null;
  
      let response;
      try {
        response =  await fetchCreditDeals(chain, account_id, limit, specificNode);
      } catch (error) {
        console.log({ error });
        return;
      }
  
      if (!response) {
        console.log(`Failed to fetch account credit deals`);
        return;
      }
  
      return response;
    },
  });
  
  export { createAccountCreditDealsStore, fetchCreditDeals };
  