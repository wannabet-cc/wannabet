import { nameStoneService } from "@/services/namestone";
import { abbreviateHex } from "@/utils";
import { fetchEns } from ".";
import { ensSchema } from "./types/ens";
import { nameStone_NameSchema } from "./types/namestone";
import { addressSchema } from "./types";
import { z } from "zod";
import type { WannaBetUser } from "./types/wb-user";

/**
 * This is class must be executed on the server side.
 */

class UserResolver {
  /** Validates and returns a WannaBetUser */
  static async getPreferredUser(userAlias: string): Promise<WannaBetUser | null> {
    try {
      // NameStone
      const validated_nameStoneAlias = nameStone_NameSchema.safeParse(userAlias);
      if (validated_nameStoneAlias.success) {
        // Send to service
        const res = await nameStoneService.searchName(validated_nameStoneAlias.data);
        // Return
        return {
          type: "NameStone",
          name: res[0].name,
          address: res[0].address,
          avatar: res[0].text_records && res[0].text_records.avatar,
          path: `/u/${res[0].name}`,
        } as WannaBetUser;
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
        const nameStoneRes = await nameStoneService.getName(res.address);
        if (nameStoneRes) {
          return {
            type: "NameStone",
            name: nameStoneRes.name,
            address: nameStoneRes.address,
            avatar: nameStoneRes.text_records && nameStoneRes.text_records.avatar,
            path: `/u/${nameStoneRes.name}`,
          } as WannaBetUser;
        }
        return {
          type: "ENS",
          name: res.name,
          address: res.address,
          avatar: res.avatar || undefined,
          path: `/u/${res.name}`,
        } as WannaBetUser;
      }

      // Address
      const validated_addressAlias = addressSchema.safeParse(userAlias);
      if (validated_addressAlias.success) {
        // Return
        const nameStoneRes = await nameStoneService.getName(validated_addressAlias.data);
        if (nameStoneRes) {
          return {
            type: "NameStone",
            name: nameStoneRes.name,
            address: nameStoneRes.address,
            avatar: nameStoneRes.text_records && nameStoneRes.text_records.avatar,
            path: `/u/${nameStoneRes.name}`,
          } as WannaBetUser;
        }
        const ensRes = await fetchEns(validated_addressAlias.data);
        if (ensRes.name) {
          return {
            type: "ENS",
            name: ensRes.name,
            address: ensRes.address,
            avatar: ensRes.avatar || undefined,
            path: `/u/${ensRes.name}`,
          } as WannaBetUser;
        }
        return {
          type: "Address",
          name: abbreviateHex(validated_addressAlias.data),
          address: validated_addressAlias.data,
          path: `/u/${validated_addressAlias.data}`,
        } as WannaBetUser;
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
