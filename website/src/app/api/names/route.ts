import { api_limitSchema, api_setNameSchema } from "@/lib/types/api";
import { nameStoneService } from "@/services/namestone";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    // validate body
    const body = await req.json();
    const validatedBody = api_setNameSchema.parse(body);
    // check if username is taken
    const nameTaken = await nameStoneService.isNameTaken(validatedBody.name);
    if (nameTaken) return NextResponse.json({ error: "Name is taken" }, { status: 409 });
    // check if user already has a name
    const existingName = await nameStoneService.getName(validatedBody.address);
    if (existingName) {
      await nameStoneService.revokeName(existingName.name);
    }
    // send to namestone
    const res = await nameStoneService.setName(validatedBody.name, validatedBody.address);
    // revalidate cache
    revalidateTag(validatedBody.name);
    revalidateTag(validatedBody.address);
    // return
    return NextResponse.json({ message: "Name set successfully", data: res }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // validate
    const validatedLimit = api_limitSchema.parse(req.nextUrl.searchParams.get("limit") || 10);
    // send to service
    const res = await nameStoneService.getNames(validatedLimit);
    // 404 if no items found
    if (res.length <= 0) return NextResponse.json({ message: "Fetch failed" }, { status: 404 });
    // return
    return NextResponse.json({ message: "Names fetched successfully", data: res }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
