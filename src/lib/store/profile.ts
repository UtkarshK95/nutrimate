import { Redis } from "@upstash/redis";
import type { HealthProfile } from "@/types/profile";
import { EMPTY_PROFILE } from "@/types/profile";

const redis = Redis.fromEnv();
const KEY = "nutrimate:profile";

export async function readProfile(): Promise<HealthProfile> {
  try {
    const data = await redis.get<HealthProfile>(KEY);
    return data ? { ...EMPTY_PROFILE, ...data } : { ...EMPTY_PROFILE };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export async function writeProfile(profile: HealthProfile): Promise<void> {
  await redis.set(KEY, profile);
}
