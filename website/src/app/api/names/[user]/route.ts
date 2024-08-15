import { addressSchema } from "@/lib/types";
import { nameStone_NameSchema } from "@/lib/types/namestone";
import { UserResolver } from "@/lib/wb-user-resolver";
import { nameStoneService } from "@/services/namestone";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { user: string } }) {
  try {
    const user = await UserResolver.getPreferredUser(params.user);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User fetched successfully", data: user }, { status: 200 });
  } catch (error) {
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
