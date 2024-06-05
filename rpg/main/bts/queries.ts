import Apis from "./ws/ApiInstances.js";

/**
 * Fetch the orderbook for a given market
 */
async function fetchOrderBook(chain: String, quote: String, base: String) {
  return new Promise(async (resolve, reject) => {
    const _node =
      chain === "bitshares" ? "wss://node.xbts.io/ws" : "wss://eu.nodes.testnet.bitshares.ws";

    let currentAPI;
    try {
      currentAPI = await Apis.instance(
        _node,
        true,
        4000,
        { enableDatabase: true },
        (error: Error) => console.log({ error })
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

export { fetchOrderBook };
