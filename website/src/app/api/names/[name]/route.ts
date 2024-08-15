import { api_nameSchema } from "@/lib/types/api";
import { nameStoneService } from "@/services/namestone";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    // validate
    const validatedName = api_nameSchema.parse(params.name);
    // send to service
    const res = await nameStoneService.searchName(validatedName, 1);
    // 404 if no item found
    if (res.length === 0 || res[0].name === validatedName) {
      return NextResponse.json({ message: "Name not found" }, { status: 404 });
    }
    // return
    return NextResponse.json({ message: "Name fetched successfully", data: res[0] }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
