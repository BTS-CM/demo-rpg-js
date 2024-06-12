import { map } from "nanostores";
import { persistentMap } from "@nanostores/persistent";

type User = {
  username: string;
  id: string;
  chain: string;
  sprite: string;
  referrer: string;
};

/**
 * Declaring the current user map nanostore
 */
const $currentUser = map<User>({
  username: "",
  id: "",
  chain: "",
  sprite: "",
  referrer: "",
});

/**
 * Setting the current user in a non persistent nanostore map
 */
function setCurrentUser(username: string, id: string, referrer: string, sprite: string, chain: string) {
  $currentUser.set({
    username,
    id,
    chain,
    sprite,
    referrer,
  });

  try {
    addUser(username, id, referrer, sprite, chain);
  } catch (e) {
    console.log(e);
  }
}

function eraseCurrentUser() {
  $currentUser.set({
    username: "",
    id: "",
    chain: "",
    sprite: "",
    referrer: "",
  });
}

type StoredUsers = {
  users: User[];
  lastAccount: User[];
};

/**
 * Declaring the persistent user store
 */
const $userStorage = persistentMap<StoredUsers>(
  "storedUsers:",
  {
    users: [],
    lastAccount: [],
  },
  {
    encode(value) {
      return JSON.stringify(value);
    },
    decode(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.log(e);
        return value;
      }
    },
  }
);

/**
 * Add an user to the persistent user store
 */
function addUser(username: string, id: string, referrer: string, sprite: string, chain: string) {
  const users = $userStorage.get().users;
  const user = { username, id, referrer, sprite, chain };
  console.log({user})
  $userStorage.setKey("lastAccount", [user]);
  if (users.find((user) => user.id === id)) {
    //console.log("Using existing user");
    return;
  }
  const newUsers = [...users, user];
  $userStorage.setKey("users", newUsers);
}

/**
 * Removing a single user from the persistent user store
 */
function removeUser(id: string) {
  const users = $userStorage.get().users;
  const newUsers = users.filter((user) => user.id !== id);
  $userStorage.setKey("users", newUsers);

  const lastUser = $userStorage.get().lastAccount;
  if (lastUser && lastUser.length && lastUser[0].id === id) {
    $userStorage.setKey("lastAccount", []);
  }
}

export { User, $currentUser, setCurrentUser, eraseCurrentUser, $userStorage, addUser, removeUser };
