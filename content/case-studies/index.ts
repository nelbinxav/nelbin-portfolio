import type { CaseStudy } from "./types";
import { webinarAutomation } from "./webinar-automation";

/** Add a case study by writing one data file and listing it here. */
export const caseStudies: CaseStudy[] = [webinarAutomation];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
