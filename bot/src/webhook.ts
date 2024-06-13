import { Address } from "viem";
import { ALCHEMY_TOKEN } from "./config";

async function addAddress(new_address: Address) {
  console.log("Adding address " + new_address);

  const url = "https://dashboard.alchemy.com/api/graphql/variables/addressList";
  const body = { add: [new_address] };
  try {
    const res = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "X-Alchemy-Token": ALCHEMY_TOKEN,
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

async function removeAddress(old_address: Address) {
  console.log("Removing address " + old_address);

  const url = "https://dashboard.alchemy.com/api/graphql/variables/addressList";
  const body = { delete: [old_address] };
  try {
    const res = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "X-Alchemy-Token": ALCHEMY_TOKEN,
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

export { addAddress, removeAddress };
