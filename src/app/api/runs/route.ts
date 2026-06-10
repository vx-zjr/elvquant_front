import { NextResponse } from "next/server";
import { RunCreateRequestSchema } from "@/lib/contracts";
import { createRun, getRuns } from "@/lib/core-api";
import { currentOwnerUserId } from "@/lib/auth";

export async function GET() {
  const userId = await currentOwnerUserId();
  return NextResponse.json({ runs: await getRuns(userId) });
}

export async function POST(request: Request) {
  const userId = await currentOwnerUserId();
  const body = RunCreateRequestSchema.parse(await request.json());
  return NextResponse.json(await createRun(userId, body.workflowId));
}
