import { existsSync } from "node:fs";
import path from "node:path";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";


/**
 * The site uses ONE photo: public/photos/profile.(jpg|jpeg|png|webp).
 * Server-only. Returns its URL, or null until the file has been added.
 */
export function profilePhoto(): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (existsSync(path.join(process.cwd(), "public", "photos", `profile.${ext}`))) return `${BASE}/photos/profile.${ext}`;
  }
  return null;
}
