/**
 * Data for the hero "Systems Universe". The animation never hard-codes a label: add an item here (and,
 * if it connects to anything, list its relatedItems) and it joins the pool, the relationships and the
 * hover lines automatically. Relationships are symmetric: listing B under A also lights A when B is active.
 *
 * Only facts that already appear elsewhere on the site are used as hover facts. Do not add numbers here
 * that are not in content/metrics.ts or the case studies.
 */
export type UniverseCategory = "system" | "tool" | "concept" | "process" | "capability";

export interface HoverContent {
  /** An ordered flow, rendered as "A → B → C". */
  flow?: string[];
  /** Small plain tags. */
  tags?: string[];
  /** Short factual lines (counts, scale). Keep each one scoped, never summed. */
  facts?: string[];
}

export interface UniverseItem {
  id: string;
  label: string;
  category: UniverseCategory;
  description?: string;
  relatedItems: string[];
  /** 1 = background, 2 = notable, 3 = a system. Weights how often an item is rotated into view. */
  importance: 1 | 2 | 3;
  /** 0 = far (small, soft, slow), 1 = near (larger, sharp). */
  depth: number;
  /** Optional seed for the layout, in -1..1 of the hero (0,0 = centre). The layout nudges it clear of overlaps. */
  initialPosition?: { x: number; y: number };
  hoverContent?: HoverContent;
}

/** Short authoring form: [id, label, importance, depth, related...] */
type Row = [id: string, label: string, importance: 1 | 2, depth: number, ...related: string[]];

const rows = (category: UniverseCategory, list: Row[]): UniverseItem[] =>
  list.map(([id, label, importance, depth, ...relatedItems]) => ({ id, label, category, importance, depth, relatedItems }));

/** Ordered by how much they should stay on screen: smaller screens show the first few. */
export const systems: UniverseItem[] = [
  {
    id: "webinar-automation", label: "Webinar Automation", category: "system", importance: 3, depth: 0.95, initialPosition: { x: -0.74, y: -0.5 },
    description: "Lead sourcing, outreach, registration, reminders and CRM follow-up as one running system.",
    relatedItems: ["apollo", "linkedin", "make", "n8n", "webinargeek", "gohighlevel", "google-calendar", "nurture", "crm"],
    hoverContent: { flow: ["Lead Sources", "Outreach", "WebinarGeek", "GoHighLevel", "Calendar", "Nurture", "CRM"], facts: ["9+ client systems"] },
  },
  {
    id: "ai-content-engine", label: "AI Content Engine", category: "system", importance: 3, depth: 0.9, initialPosition: { x: 0.72, y: -0.55 },
    description: "Researches topics, drafts three versions and schedules the one a person approves.",
    relatedItems: ["openai", "llm-workflows", "research", "content-generation", "human-review", "scheduling", "publishing", "cernio"],
    hoverContent: { flow: ["Research", "Topic Selection", "Generation", "3 Variations", "Human Review", "Scheduling", "Publishing"] },
  },
  {
    id: "lead-processing", label: "Lead Processing", category: "system", importance: 3, depth: 0.92, initialPosition: { x: -0.86, y: 0.12 },
    description: "Turns a raw lead list into a qualified, campaign-ready dataset.",
    relatedItems: ["python", "csv", "apollo", "lead-cleaning", "lead-validation", "icp-qualification", "segmentation"],
    hoverContent: {
      facts: ["5M+ records worked, across all lead work", "500K+ records processed in minutes, one workflow"],
      tags: ["Python", "CSV", "ICP", "Validation", "Segmentation"],
    },
  },
  {
    id: "cloudflare-infrastructure", label: "Cloudflare Infrastructure", category: "system", importance: 3, depth: 0.9, initialPosition: { x: 0.58, y: -0.82 },
    description: "DNS and email authentication across hundreds of domains, driven from a spreadsheet with a dry run first.",
    relatedItems: ["cloudflare", "python", "dns", "spf", "dkim", "dmarc", "mx", "cloudflare-api", "email-infrastructure"],
    hoverContent: { facts: ["300+ domains", "14 Python scripts"], tags: ["DNS", "SPF", "DKIM", "DMARC", "MX"] },
  },
  {
    id: "outreach-engine", label: "Outreach Engine", category: "system", importance: 3, depth: 0.88, initialPosition: { x: 0.86, y: 0.1 },
    description: "One campaign across LinkedIn, WhatsApp and email from a single prospect list.",
    relatedItems: ["unipile", "linkedin", "whatsapp", "outreach"],
    hoverContent: { flow: ["Prospect list", "LinkedIn", "WhatsApp", "Email"], tags: ["Unipile", "In testing"] },
  },
  {
    id: "ai-sdr", label: "AI SDR", category: "system", importance: 3, depth: 0.85, initialPosition: { x: -0.22, y: 0.84 },
    description: "Qualifies LinkedIn replies with AI, drafts the next message and alerts the team.",
    relatedItems: ["make", "unipile", "openai", "linkedin", "outreach"],
    hoverContent: { flow: ["Reply", "AI qualification", "Draft", "Team alert"], tags: ["Make.com", "Unipile", "OpenAI"] },
  },
  {
    id: "calendar-automation", label: "Google Calendar Automation", category: "system", importance: 3, depth: 0.8, initialPosition: { x: -0.64, y: 0.7 },
    description: "Sends invitations from a spreadsheet and moves events between domains without double-booking.",
    relatedItems: ["google-calendar", "python", "apps-script", "service-accounts", "scheduling"],
    hoverContent: { tags: ["Python", "Apps Script", "Service accounts", "Dry run"] },
  },
  {
    id: "lifecycle-nurture", label: "Lifecycle Nurture", category: "system", importance: 3, depth: 0.8, initialPosition: { x: 0.24, y: 0.82 },
    description: "Educational and customer-story journeys over 3, 5 and 7 days, with attendees enrolled automatically.",
    relatedItems: ["gohighlevel", "nurture", "crm", "follow-up"],
    hoverContent: { facts: ["60-email program"], tags: ["GoHighLevel", "3 / 5 / 7-day journeys"] },
  },
  {
    id: "denchclaw-hr-crm", label: "DenchClaw HR CRM", category: "system", importance: 3, depth: 0.78, initialPosition: { x: 0.74, y: 0.64 },
    description: "A desktop app for attendance, leave, payroll calculations and HR letters.",
    relatedItems: ["hr-automation", "payroll", "attendance", "leave-management"],
    hoverContent: { tags: ["Electron", "Attendance", "Leave", "Payroll", "HR letters"] },
  },
  {
    id: "internal-tools", label: "Internal Business Tools", category: "system", importance: 3, depth: 0.74, initialPosition: { x: -0.9, y: -0.22 },
    description: "Dashboards, desktop apps and scripts that remove repeated manual work inside a company.",
    relatedItems: ["python", "nextjs", "apps-script", "hr-automation"],
    hoverContent: { tags: ["Python", "Electron", "Dashboards", "Apps Script"] },
  },
];

export const tools: UniverseItem[] = [
  ...rows("tool", [
    ["claude-code", "Claude Code", 2, 0.85, "ai-assisted-development", "system-architecture", "debugging", "automation", "ai-agents"],
    ["openai", "OpenAI", 2, 0.8, "llm-workflows", "prompt-engineering", "ai-agents", "ai-sdr", "ai-content-engine"],
    ["python", "Python", 2, 0.85, "lead-processing", "csv", "cloudflare", "dns", "calendar-automation"],
    ["javascript", "JavaScript", 1, 0.45, "nextjs", "apis"],
    ["nextjs", "Next.js", 2, 0.6, "javascript", "product-engineering", "ai-product-engineering"],
    ["sql", "SQL", 1, 0.5, "data-pipelines", "reporting", "analytics", "data-operations"],
    ["make", "Make.com", 2, 0.9, "webinar-automation", "crm", "ai-content-engine", "outreach", "ai-sdr", "webhooks"],
    ["n8n", "n8n", 1, 0.5, "webinar-automation", "automation", "webhooks", "workflow-automation"],
    ["gohighlevel", "GoHighLevel", 2, 0.9, "crm", "webinar-automation", "nurture", "campaign-management", "google-calendar", "lifecycle-nurture"],
    ["zapier", "Zapier", 1, 0.4, "workflow-automation", "api-integration", "webhooks"],
    ["cloudflare", "Cloudflare", 2, 0.9, "dns", "spf", "dkim", "dmarc", "mx", "email-infrastructure", "cloudflare-api"],
    ["google-workspace", "Google Workspace", 2, 0.75, "apps-script", "google-workspace-apis", "service-accounts", "google-calendar", "email-infrastructure"],
    ["apps-script", "Apps Script", 2, 0.65, "google-workspace", "calendar-automation", "scheduling", "google-workspace-apis"],
    ["apollo", "Apollo", 2, 0.75, "lead-sourcing", "icp-qualification", "lead-processing"],
    ["sales-navigator", "LinkedIn Sales Navigator", 1, 0.55, "lead-sourcing", "linkedin", "icp-qualification"],
    ["unipile", "Unipile", 2, 0.7, "linkedin", "whatsapp", "outreach-engine", "ai-sdr"],
    ["webinargeek", "WebinarGeek", 2, 0.7, "webinar-registration", "webinar-automation", "attendance", "crm"],
    ["instantly", "Instantly", 1, 0.45, "outreach", "email-infrastructure", "campaign-management"],
    ["smartlead", "Smartlead", 1, 0.4, "outreach", "email-infrastructure", "campaign-management"],
    ["expandi", "Expandi", 1, 0.4, "linkedin", "outreach", "campaign-management"],
    ["cernio", "Cernio", 1, 0.5, "ai-content-engine", "publishing", "scheduling"],
    ["descript", "Descript", 1, 0.35, "riverside", "premiere"],
    ["riverside", "Riverside", 1, 0.35, "descript", "premiere"],
    ["premiere", "Adobe Premiere Pro", 1, 0.35, "descript", "riverside"],
    ["linkedin", "LinkedIn", 1, 0.6, "unipile", "outreach", "sales-navigator", "expandi"],
    ["whatsapp", "WhatsApp", 1, 0.5, "unipile", "outreach-engine"],
    ["google-calendar", "Google Calendar", 1, 0.55, "calendar-automation", "scheduling", "gohighlevel", "service-accounts"],
  ]),
].map((t) =>
  t.id === "cloudflare"
    ? { ...t, hoverContent: { facts: ["300+ domains", "14 Python scripts"], tags: ["DNS", "SPF", "DKIM", "DMARC", "MX"] } }
    : t,
);

export const concepts: UniverseItem[] = rows("concept", [
  ["apis", "APIs", 2, 0.6, "rest", "webhooks", "oauth", "api-integration", "authentication"],
  ["rest", "REST", 1, 0.4, "apis"],
  ["webhooks", "Webhooks", 2, 0.5, "apis", "make", "n8n"],
  ["oauth", "OAuth", 1, 0.4, "authentication", "service-accounts", "apis"],
  ["service-accounts", "Service Accounts", 1, 0.45, "oauth", "google-workspace-apis", "calendar-automation"],
  ["dns", "DNS", 2, 0.55, "cloudflare", "spf", "dkim", "dmarc", "mx"],
  ["spf", "SPF", 1, 0.4, "dns", "email-infrastructure", "cloudflare"],
  ["dkim", "DKIM", 1, 0.4, "dns", "email-infrastructure", "cloudflare"],
  ["dmarc", "DMARC", 1, 0.4, "dns", "email-infrastructure", "cloudflare"],
  ["mx", "MX", 1, 0.35, "dns", "email-infrastructure", "cloudflare"],
  ["csv", "CSV", 1, 0.4, "python", "lead-processing", "data-pipelines"],
  ["data-pipelines", "Data Pipelines", 1, 0.5, "csv", "lead-processing", "data-operations"],
  ["automation", "Automation", 2, 0.55, "workflow-automation", "ai-agents"],
  ["ai-agents", "AI Agents", 2, 0.6, "llm-workflows", "claude-code", "automation"],
  ["llm-workflows", "LLM Workflows", 2, 0.55, "openai", "prompt-engineering", "ai-agents", "human-review"],
  ["prompt-engineering", "Prompt Engineering", 1, 0.45, "llm-workflows", "openai"],
  ["authentication", "Authentication", 1, 0.35, "oauth", "apis"],
  ["cloudflare-api", "Cloudflare API", 1, 0.45, "cloudflare", "apis", "python"],
  ["google-workspace-apis", "Google Workspace APIs", 1, 0.45, "google-workspace", "service-accounts", "apps-script"],
  ["ai-assisted-development", "AI-assisted development", 1, 0.5, "claude-code"],
  ["debugging", "Debugging", 1, 0.4, "claude-code"],
]);

export const processes: UniverseItem[] = rows("process", [
  ["lead-sourcing", "Lead Sourcing", 2, 0.6, "apollo", "sales-navigator", "lead-cleaning", "lead-processing"],
  ["lead-cleaning", "Lead Cleaning", 1, 0.5, "lead-validation", "lead-processing", "csv"],
  ["lead-validation", "Lead Validation", 1, 0.45, "lead-cleaning", "icp-qualification"],
  ["icp-qualification", "ICP Qualification", 1, 0.5, "segmentation", "lead-processing", "apollo"],
  ["segmentation", "Segmentation", 1, 0.4, "icp-qualification", "outreach"],
  ["outreach", "Outreach", 2, 0.65, "outreach-engine", "campaign-management", "follow-up", "instantly"],
  ["campaign-management", "Campaign Management", 1, 0.5, "outreach", "analytics"],
  ["webinar-registration", "Webinar Registration", 1, 0.5, "webinargeek", "webinar-automation", "crm"],
  ["crm", "CRM", 2, 0.65, "gohighlevel", "nurture", "follow-up", "webinar-automation", "crm-automation"],
  ["nurture", "Nurture", 2, 0.55, "lifecycle-nurture", "crm", "gohighlevel", "follow-up"],
  ["reporting", "Reporting", 1, 0.4, "analytics", "sql"],
  ["analytics", "Analytics", 1, 0.45, "reporting", "campaign-management"],
  ["content-generation", "Content Generation", 1, 0.5, "ai-content-engine", "llm-workflows", "research"],
  ["research", "Research", 1, 0.4, "content-generation", "ai-content-engine"],
  ["human-review", "Human Review", 1, 0.5, "ai-content-engine", "llm-workflows", "publishing"],
  ["publishing", "Publishing", 1, 0.4, "cernio", "ai-content-engine", "scheduling", "human-review"],
  ["scheduling", "Scheduling", 1, 0.5, "calendar-automation", "google-calendar"],
  ["follow-up", "Follow-up", 1, 0.45, "nurture", "crm", "outreach"],
  ["hr-automation", "HR Automation", 1, 0.5, "denchclaw-hr-crm", "payroll", "attendance", "leave-management"],
  ["payroll", "Payroll", 1, 0.4, "hr-automation", "denchclaw-hr-crm"],
  ["attendance", "Attendance", 1, 0.4, "hr-automation", "denchclaw-hr-crm", "webinargeek"],
  ["leave-management", "Leave Management", 1, 0.4, "hr-automation", "denchclaw-hr-crm"],
]);

export const capabilities: UniverseItem[] = rows("capability", [
  ["ai-automation", "AI Automation", 2, 0.7, "ai-agents", "llm-workflows", "automation"],
  ["gtm-systems", "GTM Systems", 2, 0.7, "webinar-automation", "outreach-engine", "crm-automation"],
  ["revenue-systems", "Revenue Systems", 1, 0.5, "gtm-systems", "crm"],
  ["workflow-automation", "Workflow Automation", 2, 0.6, "make", "n8n", "zapier"],
  ["api-integration", "API Integration", 2, 0.6, "apis", "webhooks", "make"],
  ["data-operations", "Data Operations", 1, 0.5, "lead-processing", "csv", "data-pipelines"],
  ["email-infrastructure", "Email Infrastructure", 2, 0.6, "cloudflare", "dns", "spf", "dkim", "dmarc", "mx"],
  ["crm-automation", "CRM Automation", 1, 0.55, "gohighlevel", "crm", "nurture"],
  ["internal-tools-capability", "Internal Tools", 1, 0.5, "internal-tools", "denchclaw-hr-crm"],
  ["process-design", "Process Design", 1, 0.5, "system-architecture"],
  ["system-architecture", "System Architecture", 1, 0.55, "claude-code", "process-design"],
  ["automation-engineering", "Automation Engineering", 1, 0.55, "python", "make", "automation"],
  ["ai-product-engineering", "AI Product Engineering", 1, 0.45, "nextjs", "openai", "claude-code"],
  ["product-engineering", "Product Engineering", 1, 0.45, "nextjs", "javascript"],
  ["solutions-engineering", "Solutions Engineering", 1, 0.45, "api-integration", "process-design"],
]);

/** Short technical fragments that drift in the far background (canvas text, no DOM). */
export const fragments = [
  "GET /dns_records", "200 OK", "v=spf1", "{ }", "POST /webhook", "Bearer ••••", "dry_run=true", "lead_id",
  "batch_01", "CNAME", "TXT", "oauth2", "-> route", "cron 0 9 * * *", "202 Accepted", "retry x3",
];

/**
 * Sequences the universe occasionally assembles on its own: the systems underneath the floating objects.
 * Every id must exist above. Each is a left-to-right chain.
 */
export const flows: { id: string; ids: string[] }[] = [
  { id: "gtm-pipeline", ids: ["apollo", "lead-processing", "outreach", "webinargeek", "gohighlevel", "crm", "nurture"] },
  { id: "email-infrastructure", ids: ["cloudflare", "dns", "email-infrastructure", "outreach"] },
  { id: "content-engine", ids: ["llm-workflows", "research", "content-generation", "human-review", "publishing"] },
];

export const universe: UniverseItem[] = [...systems, ...tools, ...concepts, ...processes, ...capabilities];

/** Symmetric adjacency: if A lists B, B also knows A. Unknown ids are ignored in dev, never thrown. */
export function buildAdjacency(items: UniverseItem[]): Map<string, string[]> {
  const known = new Set(items.map((i) => i.id));
  const adj = new Map<string, Set<string>>(items.map((i) => [i.id, new Set<string>()]));
  for (const it of items)
    for (const r of it.relatedItems) {
      if (!known.has(r) || r === it.id) continue;
      adj.get(it.id)!.add(r);
      adj.get(r)!.add(it.id);
    }
  return new Map([...adj].map(([k, v]) => [k, [...v]]));
}
