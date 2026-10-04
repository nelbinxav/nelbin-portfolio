// Generates responsive WebP versions of public/photos/profile.(jpg|jpeg|png|webp).
// A static export has no image optimiser, so we pre-size the photo here.
// Run after changing the photo:  npm run photos
import sharp from "sharp";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "photos");
const src = ["jpg", "jpeg", "png", "webp"].map((e) => path.join(dir, `profile.${e}`)).find(existsSync);
if (!src) { console.log("No public/photos/profile.* found; nothing to do."); process.exit(0); }

for (const w of [480, 800]) {
  const out = path.join(dir, `profile-${w}.webp`);
  await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  console.log(`profile-${w}.webp  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}
