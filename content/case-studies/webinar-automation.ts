import type { CaseStudy } from "./types";

export const webinarAutomation: CaseStudy = {
  slug: "webinar-automation",
  title: "Webinar Automation System",
  eyebrow: "Case study 01 · GTM / Revenue Systems",
  statement: "Turning fragmented webinar operations into one connected acquisition system.",
  seoDescription:
    "How fragmented webinar operations became one connected system: lead cleaning, outreach, registration, reminders, attendance and CRM follow-up, across 9+ client webinar programs.",
  facts: [
    { label: "Context", value: "Client webinar programs, with client identities kept anonymous where needed" },
    { label: "Scale", value: "9+ client webinar systems" },
    { label: "Role", value: "End to end: the automation, the integrations and the operations around them" },
    { label: "Stack", value: "11 tools, connected by APIs and webhooks" },
  ],
  problem: {
    lead:
      "Webinar campaigns ran across several disconnected systems. People moved data between them by hand, and every handoff was a place for something to go wrong.",
    points: [
      "Lead lists, registrations and attendance lived in different tools.",
      "Data moved between those tools manually.",
      "Registration, reminders and CRM updates each needed their own upkeep.",
      "Follow-up depended on someone remembering to do it, and in what order.",
    ],
  },
  approach: [
    { step: "Understand the client process", note: "How the client sells, who they invite and how webinars run today." },
    { step: "Map the workflow", note: "Every step and every handoff, written down before anything is built." },
    { step: "Identify bottlenecks", note: "Where manual work, delay or error is concentrated." },
    { step: "Design the automation", note: "Which steps become systems, and how they connect." },
    { step: "Implement integrations", note: "Build the connections between the tools." },
    { step: "Test", note: "Run it end to end before a real audience sees it." },
    { step: "Document", note: "So the system can be run and fixed by other people." },
    { step: "Improve", note: "Refine it after each webinar, using what actually happened." },
  ],
  architecture: {
    intro:
      "Eleven stages, one connected flow. Select a stage to see what it does and everything it feeds.",
    connectedWith:
      "Stages are connected with Make.com, n8n, webhooks, APIs, Google Sheets and Apps Script.",
    nodes: [
      { id: "sources", label: "Lead Sources", tool: "Apollo · LinkedIn", summary: "Prospect lists are sourced for the audience the webinar is meant to reach." },
      { id: "cleaning", label: "Lead Cleaning / Validation", summary: "Duplicates and invalid records are removed against defined criteria before anyone is contacted." },
      { id: "outreach", label: "Email + LinkedIn Outreach", summary: "Invitations go out to the cleaned list by email and on LinkedIn." },
      { id: "registration", label: "Webinar Registration", summary: "People who accept register, and their details move on automatically instead of being copied across." },
      { id: "webinargeek", label: "WebinarGeek", tool: "Webinar platform", summary: "Hosts the live session and records who registered and who joined." },
      { id: "ghl", label: "GoHighLevel", tool: "CRM + sequences", summary: "Holds each contact and runs the automated sequences around the event." },
      { id: "calendar", label: "Google Calendar", summary: "Registrants receive a calendar invitation for the session." },
      { id: "reminders", label: "Reminder Sequences", summary: "Automated reminders go out ahead of the session." },
      { id: "attendance", label: "Attendance", summary: "Attendance data comes back from the platform, so attendees and no-shows are known." },
      { id: "nurture", label: "Post-Webinar Nurture", summary: "Attendees and non-attendees get different follow-up, without anyone sending it by hand." },
      { id: "crm", label: "CRM / Sales Follow-up", summary: "Sales follow-up happens from the CRM, with the whole history of each contact in one place." },
    ],
  },
  ownership: {
    level: "Implemented",
    statement:
      "This is the kind of system I can design and build end to end: the automation and integrations between the tools, and the operational setup that keeps webinars running.",
    did: [
      "Design and build the automation and integrations between the tools",
      "Set up the operations that keep a monthly webinar running",
      "Test the whole flow and document how it works",
      "Train the team to run it and fix it themselves",
    ],
    didNot: [],
  },
  technologies: [
    { group: "Sourcing & outreach", items: ["Apollo", "LinkedIn"] },
    { group: "Automation", items: ["Make.com", "n8n", "APIs", "Webhooks"] },
    { group: "Webinar & CRM", items: ["WebinarGeek", "GoHighLevel"] },
    { group: "Google Workspace", items: ["Google Workspace", "Google Sheets", "Apps Script"] },
  ],
  results: {
    intro: "Three clients, three different outcomes.",
    caveat:
      "These are three separate engagements. They are not added together, and none of them caused another.",
    outcomes: [
      {
        client: "UK growth consultancy",
        value: "25+",
        claim: "qualified sales calls by the fourth webinar",
        attribution: "Directly attributed to the webinars",
      },
      {
        client: "Sales training / consulting client",
        value: "6",
        claim: "qualified sales calls from the first webinar",
      },
      {
        client: "UK fintech education network",
        value: "40+",
        claim: "paid customers through webinar-led programs, most of them via webinars",
      },
    ],
  },
};
