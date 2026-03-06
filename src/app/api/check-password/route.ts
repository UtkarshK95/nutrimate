import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 500 }
    );
  }

  if (parsed.data.password !== sitePassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("site-password", sitePassword, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
