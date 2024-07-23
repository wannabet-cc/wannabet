import {
  getRecentFormattedBets,
  getUserFormattedBets,
} from "@/services/services";
import { NextRequest } from "next/server";
import { z } from "zod";
import { Address } from "viem";

const CursorSchema = z.string();
const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const AddressSchema = z.string().refine((value) => addressRegex.test(value), {
  message: "Invalid ethereum address",
});
const NumSchema = z.number().positive();

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const num = req.nextUrl.searchParams.get("num");
    const cursor = req.nextUrl.searchParams.get("cursor");

    const { success: addressSuccess, data: parsedAddress } =
      AddressSchema.safeParse(address);
    const { data: parsedNum } = NumSchema.safeParse(Number(num));
    const { data: parsedCursor } = CursorSchema.safeParse(cursor);

    const pageObject = { afterCursor: parsedCursor };
    let data;

    if (addressSuccess) {
      data = await getUserFormattedBets(
        parsedAddress as Address,
        parsedNum,
        pageObject,
      );
    } else {
      data = await getRecentFormattedBets(parsedNum, pageObject);
    }
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({}, { status: 404 });
  }
}
