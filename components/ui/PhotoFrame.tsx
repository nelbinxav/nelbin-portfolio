import Image from "next/image";
import { profilePhoto } from "@/lib/photos";

/** The one photo on the site. Shows a neutral frame, naming the file to add, until public/photos/profile.* exists. */
export function PhotoFrame({ alt, aspect, sizes, priority, className = "", position = "center" }: { alt: string; aspect: string; sizes: string; priority?: boolean; className?: string; position?: string }) {
  const src = profilePhoto();
  return (
    <div className={`photo ${className}`} style={{ aspectRatio: aspect }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
      ) : (
        <div className="photo-empty" role="img" aria-label="Placeholder for a portrait photo">
          <span className="photo-mono" aria-hidden="true">NJ</span>
          <span className="photo-hint">Add public/photos/profile.jpg</span>
        </div>
      )}
      <span className="photo-tint" aria-hidden="true" />
    </div>
  );
}
