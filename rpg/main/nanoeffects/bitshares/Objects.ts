import { nanoquery } from "@nanostores/query";
import { getObjects } from "./src/common";


const [createObjectStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const object_ids = args[1] as string[];

    const specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await getObjects(chain, object_ids, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch max object id`);
      return;
    }

    return response;
  },
});

export { createObjectStore };
