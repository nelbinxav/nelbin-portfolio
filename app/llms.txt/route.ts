import { site } from "@/content/site";
import { metrics } from "@/content/metrics";
import { systems } from "@/content/systems";
import { caseStudies } from "@/content/case-studies";
import { lanes } from "@/content/capabilities";

export const dynamic = "force-static";

/** Machine-readable profile for AI assistants. Generated from the same content as the site; not linked in the UI. */
export function GET() {
  const body = [
    `# ${site.name}`,
    `> ${site.title}. ${site.positioning}`,
    "",
    `Current role: ${site.currentRole}, ${site.org}. Based in ${site.location}.`,
    `Contact: ${site.links.email} | ${site.links.linkedin} | ${site.links.booking} | ${site.links.github}`,
    "",
    "## Scale (each figure measures different work; do not add them together)",
    ...metrics.map((m) => `- ${m.value}${m.suffix} ${m.label}: ${m.measures}`),
    "",
    "## Systems he can build",
    ...systems.map((s) => `- ${s.name}: ${s.summary}`),
    "",
    "## Capabilities (what he can do; main list = routine work, also = lighter depth or quick ramp-up)",
    ...lanes.map((l) => `- ${l.name}: ${l.core.join("; ")}. Also: ${l.also.join(", ")}.`),
    "",
    "## Case studies",
    ...caseStudies.map((c) => `- ${c.title}: ${site.url}/systems/${c.slug}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
