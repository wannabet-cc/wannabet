import { apiService } from "@/services/api/service";
import { NextRequest } from "next/server";
import { z } from "zod";
import { Address } from "viem";

const CursorSchema = z.string();
const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const AddressSchema = z.string().refine((value) => addressRegex.test(value), {
  message: "Invalid ethereum address",
});
const AsPositionSchema = z.enum(["party", "judge"]);
const NumSchema = z.number().positive();

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const asPosition = req.nextUrl.searchParams.get("as");
    const num = req.nextUrl.searchParams.get("num");
    const cursor = req.nextUrl.searchParams.get("cursor");

    const { success: addressSuccess, data: parsedAddress } = AddressSchema.safeParse(address);
    const { success: positionSuccess, data: parsedPosition } = AsPositionSchema.safeParse(asPosition);
    const { data: parsedNum } = NumSchema.safeParse(Number(num));
    const { data: parsedCursor } = CursorSchema.safeParse(cursor);

    const pageObject = { afterCursor: parsedCursor };
    let data;

    if (addressSuccess) {
      if (positionSuccess && parsedPosition === "party") {
        data = await apiService.getUserFormattedBetsAsParty(parsedAddress as Address, parsedNum, 0, pageObject);
      } else if (positionSuccess && parsedPosition === "judge") {
        data = await apiService.getUserFormattedBetsAsJudge(parsedAddress as Address, parsedNum, 0, pageObject);
      } else {
        data = await apiService.getUserFormattedBets(parsedAddress as Address, parsedNum, 0, pageObject);
      }
    } else {
      data = await apiService.getRecentFormattedBets(parsedNum, 0, pageObject);
    }
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({}, { status: 404 });
  }
}
