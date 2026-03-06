import { NextResponse } from "next/server";
import { z } from "zod";
import { readProfile, writeProfile } from "@/lib/store/profile";

const profileSchema = z.object({
  name: z.string().max(100),
  age: z.number().int().min(1).max(120).nullable(),
  gender: z.string().max(50),
  medications: z.array(z.string().max(200)).max(50),
  conditions: z.array(z.string().max(200)).max(50),
  allergies: z.array(z.string().max(200)).max(50),
  goals: z.string().max(2000),
  personalNotes: z.string().max(5000).default(""),
});

export async function GET() {
  try {
    const profile = await readProfile();
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const profile = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    await writeProfile(profile);
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
