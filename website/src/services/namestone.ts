import { Address } from "viem";

const NAMESTONE_URL = "https://namestone.xyz/api/public_v1/";
const NAMESTONE_API_KEY = "";

/** General purpose function for sending a GET request to namestone.xyz api */
async function getNamestone<T>(
  path: "get-names" | "search-names",
  queryParams: string,
): Promise<T> {
  const res = await fetch(
    `${NAMESTONE_URL}${path}?domain=wannabet.eth&${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: NAMESTONE_API_KEY,
      },
      next: {
        revalidate: 0,
      },
    },
  );
  return (await res.json()) as T;
}

/** General purpose function for sending a POST request to namestone.xyz api */
async function postNamestone(
  path: "set-name" | "claim-name" | "revoke-name" | "set-domain",
  body: any,
) {
  fetch(NAMESTONE_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: NAMESTONE_API_KEY,
    },
    body: JSON.stringify(body),
    next: {
      revalidate: 0,
    },
  });
}

/** Posts to the namestone.xyz "Set Name" route */
function setName(name: string, address: Address, avatar?: string) {
  const body = {
    domain: "wannabet.eth",
    name,
    address,
    text_records: { avatar },
  };
  postNamestone("set-name", body);
}

/** Posts to the namestone.xyz "Claim Name" route */
function claimName(name: string, address: Address, avatar?: string) {
  const body = {
    domain: "wannabet.eth",
    name,
    address,
    text_records: { avatar },
  };
  postNamestone("claim-name", body);
}

/** Gets a list of names */ // ! Looking into pagination
async function getNames(limit: number): Promise<NamestoneResponse> {
  const queryParams = `limit=${limit}`;
  const data = await getNamestone<NamestoneResponse>("get-names", queryParams);
  return data;
}

/** Gets a single name matching an address */
async function getName(address: Address): Promise<NamestoneUser> {
  const queryParams = `address=${address}&limit=${1}`;
  const data = await getNamestone<NamestoneResponse>("get-names", queryParams);
  return data[0];
}

/** Searches names based on a string query */ // ! Looking into pagination
async function searchName(
  query: string,
  limit: number,
): Promise<NamestoneResponse> {
  const queryParams = `name=${query}&limit=${limit}`;
  const data = await getNamestone<NamestoneResponse>(
    "search-names",
    queryParams,
  );
  return data;
}

type NamestoneResponse = NamestoneUser[];

type NamestoneUser = {
  name: string;
  address: Address;
  domain: string; // ens name
  textRecords: {
    avatar: string; // url
  };
};
