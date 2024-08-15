import type { Address } from "viem";
import { arbitrumContracts, baseContracts } from "./contracts";

export { baseContracts, arbitrumContracts };

export async function fetchEns(nameOrAddress: `${string}.eth` | Address): Promise<EnsIdeasResponse> {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return fetch(ensIdeasUrl + nameOrAddress).then((res) => res.json());
}

export type EnsIdeasResponse = {
  address: Address;
  name: string | null;
  displayName: string;
  avatar: string | null;
};
