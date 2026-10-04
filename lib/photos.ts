import { existsSync } from "node:fs";
import path from "node:path";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";


export interface Photo {
  src: string;
  srcSet?: string;
}

/**
 * The site uses ONE photo: public/photos/profile.(jpg|jpeg|png|webp).
 * `npm run photos` also writes profile-480.webp and profile-800.webp; when they exist they are served
 * as a responsive srcset (a static export has no image optimiser). Server-only.
 */
export function profilePhoto(): Photo | null {
  const dir = path.join(process.cwd(), "public", "photos");
  const original = ["jpg", "jpeg", "png", "webp"].find((ext) => existsSync(path.join(dir, `profile.${ext}`)));
  if (!original) return null;
  const small = existsSync(path.join(dir, "profile-480.webp"));
  const large = existsSync(path.join(dir, "profile-800.webp"));
  if (small && large) {
    return { src: `${BASE}/photos/profile-800.webp`, srcSet: `${BASE}/photos/profile-480.webp 480w, ${BASE}/photos/profile-800.webp 800w` };
  }
  return { src: `${BASE}/photos/profile.${original}` };
}
