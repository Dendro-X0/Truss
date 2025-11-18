import { NextResponse } from "next/server";
import auth from "../../../../lib/auth/server";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  return NextResponse.json(session);
}
