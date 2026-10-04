import type { OwnershipLevel } from "../ownership";

export interface FlowNode {
  id: string;
  label: string;
  tool?: string;
  summary: string;
}

export interface Outcome {
  client: string;
  value: string;
  claim: string;
  attribution?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  eyebrow: string;
  statement: string;
  seoDescription: string;
  facts: { label: string; value: string }[];
  problem: { lead: string; points: string[] };
  approach: { step: string; note: string }[];
  architecture: { intro: string; nodes: FlowNode[]; connectedWith: string };
  ownership: { level: OwnershipLevel; statement: string; did: string[]; didNot: string[] };
  technologies: { group: string; items: string[] }[];
  results: { intro: string; caveat: string; outcomes: Outcome[] };
}
