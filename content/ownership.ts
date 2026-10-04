/** One shared vocabulary for how much of something was mine. */
export const ownershipLevels = ["Built", "Led", "Implemented", "Contributed", "Worked with"] as const;
export type OwnershipLevel = (typeof ownershipLevels)[number];

export const ownershipDefinitions: Record<OwnershipLevel, string> = {
  Built: "I designed it and built it myself.",
  Led: "I directed the work and coordinated the people building it.",
  Implemented: "I did most of the hands-on build, against a direction set by others.",
  Contributed: "I built or tested part of it alongside other people.",
  "Worked with": "I used or operated it as part of my work.",
};
