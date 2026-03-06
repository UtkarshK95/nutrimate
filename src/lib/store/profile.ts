import fs from "fs/promises";
import path from "path";
import type { HealthProfile } from "@/types/profile";
import { EMPTY_PROFILE } from "@/types/profile";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readProfile(): Promise<HealthProfile> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(PROFILE_PATH, "utf-8");
    return JSON.parse(raw) as HealthProfile;
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export async function writeProfile(profile: HealthProfile): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROFILE_PATH, JSON.stringify(profile, null, 2), "utf-8");
}
