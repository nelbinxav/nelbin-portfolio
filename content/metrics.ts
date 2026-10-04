/** Each metric describes different work. They are never summed or merged. */
export interface Metric {
  id: string;
  value: number;
  suffix: string;
  label: string;
  measures: string;
  scope: string;
}

export const metrics: Metric[] = [
  {
    id: "lead-records",
    value: 5,
    suffix: "M+",
    label: "Lead records worked",
    measures:
      "Records handled across sourcing, cleaning, validation, segmentation, qualification and outreach, counted across all of my lead work.",
    scope: "Career total · many projects",
  },
  {
    id: "records-in-minutes",
    value: 500,
    suffix: "K+",
    label: "Records processed in minutes",
    measures:
      "What one automated cleaning workflow can process in minutes, under defined criteria. It describes capacity, not a client result.",
    scope: "One workflow · capacity",
  },
  {
    id: "domains",
    value: 300,
    suffix: "+",
    label: "Business domains managed",
    measures:
      "Domains whose DNS and email authentication I manage through Cloudflare, with scripts rather than by hand.",
    scope: "Infrastructure",
  },
  {
    id: "webinar-systems",
    value: 9,
    suffix: "+",
    label: "Client webinar systems",
    measures:
      "Client webinar programs I have set up systems for, from registration through to CRM follow-up.",
    scope: "Across clients",
  },
  {
    id: "paid-customers",
    value: 40,
    suffix: "+",
    label: "Paid customers through webinar-led programs",
    measures:
      "Paid customers generated for a UK fintech education and executive network client through webinar-led programs, with most of them coming through webinars.",
    scope: "One client · UK fintech network",
  },
];

/** Smaller facts shown under the headline numbers. Each is its own scope. */
export interface MiniStat {
  value: string;
  label: string;
  scope: string;
}
export const miniStats: MiniStat[] = [
  { value: "1,000+", label: "Business email accounts created, organised or managed", scope: "Infrastructure" },
  { value: "14", label: "Python scripts in one Cloudflare and DNS toolkit", scope: "Cloudflare toolkit" },
  { value: "~60", label: "Emails in a lifecycle nurture program", scope: "Nurture system" },
  { value: "40+", label: "Training videos re-edited for picture, sound and subtitles", scope: "Course migration" },
  { value: "30–60 min → 30 s", label: "Setting up a lead-sourcing search, before and after automating it", scope: "One workflow" },
];
