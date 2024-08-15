import { addressSchema } from "@/lib/types";
import { api_nameSchema } from "@/lib/types/api";
import { nameStoneService } from "@/services/namestone";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { user: string } }) {
  try {
    // validate name
    const validatedName = api_nameSchema.safeParse(params.user);
    if (validatedName.success) {
      // send to service
      const res = await nameStoneService.searchName(validatedName.data, 1);
      // 404 if no item found
      if (res.length === 0 || res[0].name !== validatedName.data) {
        return NextResponse.json({ message: "Name not found" }, { status: 404 });
      }
      // return
      return NextResponse.json({ message: "Name fetched successfully", data: res[0] }, { status: 200 });
    }

    // validate address
    const validatedAddress = addressSchema.safeParse(params.user);
    if (validatedAddress.success) {
      // send to service
      const res = await nameStoneService.getName(validatedAddress.data);
      // 404 if no item found
      if (!res) return NextResponse.json({ message: "Address not found" }, { status: 404 });
      // return
      return NextResponse.json({ message: "Name fetched successfully", data: res }, { status: 200 });
    }

    // throw if both are invalid
    throw new z.ZodError([...(validatedName.error.errors || []), ...(validatedAddress.error.errors || [])]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
