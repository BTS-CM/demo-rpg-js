import Apis from "./main/bts/ws/ApiInstances";
import * as hash from "./main/bts/ecc/hash.js";

const main = async () => {
    let node = "wss://node.xbts.io/ws";

    let currentAPI;
    try {
      currentAPI = await Apis.instance(node, true, 4000, { enableDatabase: true }, (error) =>
          console.log({ error })
        );
    } catch (error) {
      console.log({ error });
      return;
    }
    
    let committeeAccount;
    try {
        committeeAccount = await currentAPI.db_api().exec("get_accounts", [["committee-blacklist-manager"]]);
    } catch (error) {
      console.log({ error });
      return;
    }

    const blockedList = committeeAccount[0].blacklisted_accounts;

    console.log({user: blockedList[0]});

    //console.time()
    //let hashedBlockList = blockedList.map(account => hash.sha256(account).toString("hex"));
    //console.timeEnd();

    //console.log({hashedBlockList})

    process.exit(0);
};

main();