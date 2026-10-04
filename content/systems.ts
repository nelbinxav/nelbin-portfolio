import type { OwnershipLevel } from "./ownership";

export type CategoryId = "ai" | "gtm" | "infra" | "internal" | "product";

export const categories: { id: CategoryId; name: string; description: string }[] = [
  { id: "ai", name: "AI & Automation", description: "Workflows where AI does the first draft and people keep the final say." },
  { id: "gtm", name: "GTM / Revenue Systems", description: "Systems that move a prospect from first touch to a booked conversation." },
  { id: "infra", name: "Infrastructure & Data", description: "The domains, records and datasets everything else depends on." },
  { id: "internal", name: "Internal Business Systems", description: "Tools that remove repetitive work from inside a company." },
  { id: "product", name: "Product & Delivery", description: "Testing, shaping and shipping things other people use." },
];

export interface System {
  slug: string;
  name: string;
  category: CategoryId;
  /** Plain English first: no jargon in the lead sentence. */
  summary: string;
  context: string[];
  /** Kept for the Career OS vocabulary (resumes, interviews). Not shown on the public site. */
  ownership: OwnershipLevel;
  /** Layout tier on the home page: one large feature, a few cards, the rest in a list. */
  tier: "feature" | "card" | "list";
  /** Problem / what I did / result: used by feature and card tiers. */
  problem?: string;
  did?: string;
  result?: string;
  /** Present once a full case study exists. */
  caseStudy?: string;
}

export const systems: System[] = [
  {
    slug: "ai-content-engine",
    tier: "card",
    problem: "Producing social content means researching topics, drafting and scheduling posts by hand.",
    did: "I can build the engine: research, three drafts per topic, human review, scheduling and publishing.",
    result: "Three drafts per topic, and nothing goes live without a person approving it.",
    name: "AI Content Engine",
    category: "ai",
    summary:
      "I can build content engines that research topics, draft three versions of a post and schedule the one a person approves. Nothing goes live without a human sign-off.",
    context: ["LLM workflows", "News + RSS research", "Cernio publishing"],
    ownership: "Implemented",
  },
  {
    slug: "webinar-automation",
    tier: "feature",
    problem: "Webinar campaigns run across disconnected tools, and people move data between them by hand.",
    did: "I can connect the whole funnel: lead cleaning, outreach, registration, reminders, attendance and CRM follow-up.",
    result: "25+ qualified sales calls by the fourth webinar, for a UK growth consultancy.",
    name: "Webinar Automation System",
    category: "gtm",
    summary:
      "I can connect lead sourcing, registration, reminders and CRM follow-up, so a webinar runs as one system instead of a dozen manual steps.",
    context: ["Make.com · n8n", "GoHighLevel", "WebinarGeek"],
    ownership: "Implemented",
    caseStudy: "webinar-automation",
  },
  {
    slug: "multi-channel-outreach",
    tier: "list",
    name: "Multi-Channel Outreach Engine",
    category: "gtm",
    summary:
      "I can run one campaign across LinkedIn, WhatsApp and email from a single prospect list.",
    context: ["Unipile", "Email APIs", "In end-to-end testing"],
    ownership: "Led",
  },
  {
    slug: "lead-processing",
    tier: "card",
    problem: "Raw vendor lead lists are messy, duplicated and not yet qualified for a campaign.",
    did: "I can build the workflow that cleans, validates, segments and qualifies records against defined criteria.",
    result: "500K+ records cleaned in minutes, under defined criteria.",
    name: "Large-Scale Lead Processing",
    category: "infra",
    summary: "I can turn a raw lead list into a qualified, campaign-ready dataset.",
    context: ["Python", "CSV · Sheets", "ICP criteria"],
    ownership: "Implemented",
  },
  {
    slug: "cloudflare-toolkit",
    tier: "card",
    problem: "DNS and email authentication for hundreds of domains means slow, risky manual edits.",
    did: "I can build script toolkits, driven by a CSV, with a dry run before any change is applied.",
    result: "300+ domains managed with scripts instead of by hand.",
    name: "Cloudflare Infrastructure Toolkit",
    category: "infra",
    summary:
      "I can audit and update DNS and email-authentication records across hundreds of domains from a spreadsheet, with a dry run before anything changes.",
    context: ["Python · 14 scripts", "Cloudflare API", "SPF · DKIM · DMARC"],
    ownership: "Built",
  },
  {
    slug: "denchclaw-hr-crm",
    tier: "list",
    name: "DenchClaw HR CRM",
    category: "internal",
    summary:
      "I can build desktop apps that handle attendance, leave, payroll calculations and HR letters, so none of it is redone by hand each month.",
    context: ["Electron desktop app", "Payroll + leave", "HR documents"],
    ownership: "Built",
  },
  {
    slug: "calendar-automation",
    tier: "list",
    name: "Google Calendar Automation",
    category: "internal",
    summary:
      "I can send calendar invitations from a spreadsheet and move events between company domains, without double-booking anyone or hitting Google's limits.",
    context: ["Python · Apps Script", "Service accounts", "Dry-run audit"],
    ownership: "Built",
  },
  {
    slug: "lifecycle-nurture",
    tier: "list",
    name: "Lifecycle Nurture System",
    category: "gtm",
    summary:
      "I can build nurture programs in GoHighLevel: educational and customer-story journeys over 3, 5 and 7 days, with webinar attendees enrolled automatically. One program runs to 60 emails.",
    context: ["GoHighLevel", "3 / 5 / 7-day journeys", "Auto-enrollment"],
    ownership: "Implemented",
  },
  {
    slug: "lead-sourcing-filter",
    tier: "list",
    name: "Lead-Sourcing Filter Automation",
    category: "gtm",
    summary:
      "I can turn a plain-English description of an audience into a ready Apollo search in about 30 seconds, a step that usually takes 30 to 60 minutes.",
    context: ["Apollo", "Natural language", "Recurring workflow"],
    ownership: "Built",
  },
  {
    slug: "linkedin-ai-sdr",
    tier: "list",
    name: "LinkedIn AI SDR Automation",
    category: "ai",
    summary:
      "I can build AI that qualifies LinkedIn replies, drafts the next message and alerts the team, so a person steps in only when a conversation is worth having.",
    context: ["Make.com · 50+ modules", "Unipile", "OpenAI"],
    ownership: "Contributed",
  },
  {
    slug: "lead-analysis",
    tier: "list",
    name: "Lead & Conversion Analysis",
    category: "infra",
    summary:
      "I can score and tier lead lists against a buyer persona, and trace which webinar attendees became sales conversations, so a client can see where results came from.",
    context: ["ICP scoring", "Persona tiers", "Webinar conversion"],
    ownership: "Built",
  },
  {
    slug: "course-migration",
    tier: "list",
    name: "Training Course Migration",
    category: "product",
    summary:
      "I can move a full training course from WordPress to GoHighLevel and re-edit the videos for clearer picture, sound and subtitles. One course had 40+ videos.",
    context: ["GoHighLevel", "Premiere Pro", "Descript · Riverside"],
    ownership: "Implemented",
  },
  {
    slug: "tantra",
    tier: "list",
    name: "Tantra (GrowthClub product)",
    category: "product",
    summary:
      "I can run and test campaigns on a product, read the analytics, find gaps and write structured feedback, plus Figma-to-code, Next.js and QA of sign-in, payments and APIs.",
    context: ["Campaign testing", "Next.js · QA", "Product feedback"],
    ownership: "Contributed",
  },
];
