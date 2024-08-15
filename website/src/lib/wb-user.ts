import type { Address } from "viem";

class WannaBetUser {
  public type: "Address" | "ENS" | "NameStone";
  public name: string;
  public address: Address;
  public avatar?: string;

  constructor(params: { type: "Address" | "ENS" | "NameStone"; name: string; address: Address; avatar?: string }) {
    this.type = params.type;
    this.name = params.name;
    this.address = params.address;
    this.avatar = params.avatar;
  }
}

export { WannaBetUser };
