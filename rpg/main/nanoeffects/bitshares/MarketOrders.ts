import { nanoquery } from "@nanostores/query";
import Apis from "../../bts/ws/ApiInstances";
import { chains } from "../../config/chains";

/**
 * Fetch the orderbook for a given market
 */
async function fetchOrderBook(chain: string, quote: string, base: string, specificNode?: string) {
  return new Promise(async (resolve, reject) => {
    let node: string;
    if (specificNode) {
      node = specificNode;
    } else {
      node = chains[chain].nodeList[0].url;
    }

    let currentAPI;
    try {
      currentAPI = await Apis.instance(node, true, 4000, { enableDatabase: true }, (error: Error) =>
        console.log({ error })
      );
    } catch (error) {
      console.log({ error });
      return reject(error);
    }

    let orderBook;
    try {
      orderBook = await currentAPI.db_api().exec("get_order_book", [base, quote, 50]);
    } catch (error) {
      console.log({ error });
    }

    try {
      await currentAPI.close();
    } catch (error) {
      console.log({ error });
    }

    if (!orderBook) {
      return reject(new Error("Couldn't retrieve orderbook"));
    }

    return resolve(orderBook);
  });
}

const [createMarketOrdersStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const quote = args[1] as string;
    const base = args[2] as string;

    let specificNode;
    if (args.length > 2) {
      specificNode = args[3] as string;
    }

    let response;
    try {
      response = specificNode
        ? await fetchOrderBook(chain, quote, base, specificNode)
        : await fetchOrderBook(chain, quote, base);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch market orders`);
      return;
    }

    return response;
  },
});

export { createMarketOrdersStore };
