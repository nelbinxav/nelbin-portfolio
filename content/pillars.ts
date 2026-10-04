/** "What I do" in three plain pillars. The full list lives in capabilities.ts, behind an expander. */
export type PillarIcon = "growth" | "automation" | "build";
export const pillars: { icon: PillarIcon; name: string; promise: string; points: string[] }[] = [
  {
    icon: "growth",
    name: "Growth & GTM systems",
    promise: "Turn a target audience into booked conversations.",
    points: [
      "Lead sourcing, cleaning and segmentation",
      "Email and LinkedIn outreach",
      "Webinar funnels, from registration to follow-up",
      "Nurture sequences in GoHighLevel",
      "Campaign analytics and conversion analysis",
    ],
  },
  {
    icon: "automation",
    name: "Automation & AI",
    promise: "Replace repeated manual work with connected workflows.",
    points: [
      "Make.com, GoHighLevel and Apps Script workflows",
      "API, webhook and OAuth integrations",
      "LLM workflows where a person approves the result",
      "AI-assisted building with Claude Code",
      "Debugging and hardening automations",
    ],
  },
  {
    icon: "build",
    name: "Build & infrastructure",
    promise: "Write the code, and keep the foundations healthy.",
    points: [
      "Python toolkits and internal tools",
      "Electron desktop apps",
      "Cloudflare DNS, SPF, DKIM and DMARC at scale",
      "Google Workspace administration",
      "Documentation and training so others can run it",
    ],
  },
];
