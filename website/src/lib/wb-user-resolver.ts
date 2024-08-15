import { nameStoneService } from "@/services/namestone";
import { abbreviateHex } from "@/utils";
import { fetchEns } from ".";
import { ensSchema } from "./types/ens";
import { nameStone_NameSchema } from "./types/namestone";
import { addressSchema } from "./types";
import { z } from "zod";
import { Address } from "viem";
import { WannaBetUser } from "./wb-user";

/**
 * This is class must be executed on the server side.
 */

class UserResolver {
  /** Validates and returns a WannaBetUser */
  static async getUser(userAlias: string): Promise<WannaBetUser | null> {
    try {
      // NameStone
      const validated_nameStoneAlias = nameStone_NameSchema.safeParse(userAlias);
      if (validated_nameStoneAlias.success) {
        // Send to service
        const res = await nameStoneService.searchName(validated_nameStoneAlias.data, 1);
        // Throw if not found
        if (res.length === 0 || res[0].name !== validated_nameStoneAlias.data) {
          throw new Error("Name not found");
        }
        // Return
        return new WannaBetUser({
          type: "NameStone",
          name: res[0].name,
          address: res[0].address,
          avatar: res[0].text_records && res[0].text_records.avatar,
        });
      }

      // ENS
      const validated_ensAlias = ensSchema.safeParse(userAlias);
      if (validated_ensAlias.success) {
        // Send to service
        const res = await fetchEns(validated_ensAlias.data);
        // Throw if not found
        if (!res.name) {
          throw new Error("No matching record for ENS found");
        }
        // Return
        return new WannaBetUser({
          type: "ENS",
          name: res.name,
          address: res.address,
          avatar: res.avatar || undefined,
        });
      }

      // Address
      const validated_addressAlias = addressSchema.safeParse(userAlias);
      if (validated_addressAlias.success) {
        // Return
        return new WannaBetUser({
          type: "Address",
          name: abbreviateHex(validated_addressAlias.data),
          address: validated_addressAlias.data,
        });
      }

      // Fallback
      throw new z.ZodError([
        ...(validated_nameStoneAlias.error.errors || []),
        ...(validated_ensAlias.error.errors || []),
        ...(validated_addressAlias.error.errors || []),
      ]);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export { UserResolver };
