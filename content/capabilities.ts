/**
 * What I can do (capabilities, not claims about past results).
 * "core" = routine, defensible work. "also" = also able to: lighter depth, or adjacent work I can pick up fast.
 * Sourced from the career knowledge base and the owner's own stack list.
 */
export interface Lane {
  id: string;
  name: string;
  tagline: string;
  core: string[];
  also: string[];
}

export const lanes: Lane[] = [
  {
    id: "growth",
    name: "Growth & GTM",
    tagline: "From a first lead list to a booked conversation.",
    core: [
      "Client onboarding, questionnaires and requirements gathering",
      "Buyer personas and ideal-customer (ICP) definition",
      "Lead sourcing with Apollo and LinkedIn Sales Navigator",
      "Working with lead vendors, and checking their data before use",
      "Deduplication, validation, enrichment and segmentation of lead lists",
      "Daily campaign batch preparation and scheduling",
      "Email and LinkedIn outreach campaigns",
      "Webinar funnels: registration, reminders, calendar invites, attendance and follow-up",
      "Lifecycle and nurture sequences in GoHighLevel",
      "Post-webinar remarketing and conversion analysis",
      "Campaign testing, analytics and optimization",
      "Sending-domain setup, landing pages and calendar booking flows",
    ],
    also: ["WhatsApp and SMS outreach", "Instantly", "Smartlead", "Expandi", "LinkedHelper", "Founder LinkedIn content", "AI-personalised video and voice outreach", "Clay enrichment", "HubSpot setups"],
  },
  {
    id: "automation",
    name: "Automation & Integration",
    tagline: "Connecting the tools so people stop copying data between them.",
    core: [
      "Make.com scenarios and multi-step workflows",
      "GoHighLevel workflows, pipelines, branching and A/B tests",
      "Google Apps Script and Google Workspace automation",
      "REST API and webhook integrations",
      "OAuth, service accounts and domain-wide delegation",
      "Spreadsheet-driven batch operations with dry-run safety",
      "Quota-aware, duplicate-safe automation for Google Calendar at scale",
      "Debugging failing automations and making them more reliable",
    ],
    also: ["n8n", "Zapier", "Unipile (LinkedIn and WhatsApp)", "Slack alerts", "Scheduled and queue-based job runners"],
  },
  {
    id: "development",
    name: "Development",
    tagline: "Writing the code the marketing and operations work needs.",
    core: [
      "Python scripts and command-line toolkits",
      "Internal tools, dashboards and lightweight apps",
      "Electron desktop applications",
      "Data processing across CSV, Excel and Google Sheets",
      "Next.js product work, including front-end and QA, on a team",
      "Reviewing, testing and debugging AI-written code before it ships",
    ],
    also: ["JavaScript and TypeScript services", "Full-stack Next.js apps", "SQL-backed tools", "Docker", "HTML and CSS", "Git and GitHub", "Degree foundations: C, C++, Java, PHP"],
  },
  {
    id: "ai",
    name: "AI & Agents",
    tagline: "AI where it does the first draft and a person keeps the final say.",
    core: [
      "LLM workflows with OpenAI and Claude as working components",
      "Prompt engineering for production automations",
      "AI research, drafting and review loops with human approval",
      "Turning a plain-English request into a working search or workflow",
      "AI-assisted development with Claude Code",
      "AI agent orchestration",
      "AI for architecture, debugging, code review, refactoring and documentation",
    ],
    also: ["Cursor", "Gemini", "Perplexity", "HeyGen", "Proposal and document generators", "Assistants over company documents", "Monitoring LLM workflows"],
  },
  {
    id: "data",
    name: "Data & Analytics",
    tagline: "Making a messy list or a flat report tell you what to do next.",
    core: [
      "Scoring leads against an ICP and sorting them into persona tiers",
      "Attendee-to-sales conversion analysis for webinar programs",
      "Post-webinar performance reporting",
      "Large-scale list processing in Python: split, deduplicate, validate",
      "Google Sheets as a lightweight database and back end",
      "Reporting dashboards and internal utilities",
    ],
    also: ["SQL reporting layers", "Excel", "BI dashboards"],
  },
  {
    id: "infra",
    name: "Infrastructure & Deliverability",
    tagline: "The domains and inboxes everything else depends on.",
    core: [
      "Cloudflare DNS at scale, through the API",
      "SPF, DKIM, DMARC and MX configuration",
      "Blacklist and deliverability audits, repeated after deployment",
      "Google Workspace administration and mailbox setup",
      "Domain migration from Namecheap to Cloudflare",
      "Landing-page DNS and Cloudflare Pages",
    ],
    also: ["Namecheap", "Proxies", "Inbox warm-up and rotation design", "Basic cloud hosting"],
  },
  {
    id: "delivery",
    name: "Product, Delivery & Leadership",
    tagline: "Getting a system understood, tested and adopted.",
    core: [
      "Process mapping and requirements gathering",
      "Documentation: READMEs, SOPs and operating playbooks",
      "Training team members on systems and workflows",
      "Assigning and coordinating work across people and tasks",
      "Cross-functional coordination across marketing, automation and infrastructure",
      "Product testing: campaigns, sign-in, payments and APIs",
      "Structured product feedback and gap analysis",
      "Course migration and video production (Premiere Pro, GoHighLevel)",
      "Explaining systems to clients on calls, and troubleshooting with them",
      "HR operations automation: attendance, leave, payroll and HR letters",
    ],
    also: ["Figma-to-implementation", "Canva", "WordPress", "Pre-sales demos"],
  },
];
