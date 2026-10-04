import { profilePhoto } from "@/lib/photos";

/** The one photo on the site. Shows a neutral frame, naming the file to add, until public/photos/profile.* exists. */
export function PhotoFrame({ alt, aspect, sizes, priority, className = "", position = "center" }: { alt: string; aspect: string; sizes: string; priority?: boolean; className?: string; position?: string }) {
  const photo = profilePhoto();
  return (
    <div className={`photo ${className}`} style={{ aspectRatio: aspect }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export: no optimiser, so we pre-size and use srcSet
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={sizes}
          alt={alt}
          width={800}
          height={1067}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
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
