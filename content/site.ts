/** Site-wide facts. Placeholders are resolved by lib/links.ts. */
export const contact = {
  email: "nelbin@growthclub.org",
  linkedin: "https://www.linkedin.com/in/nelbin-xav/",
  booking: "https://calendly.com/nelbin/xav",
  github: "https://github.com/nelbinxav",
} as const;

export const site = {
  name: "Nelbin Joseph",
  title: "AI Automation & Systems Engineer",
  currentRole: "AI and Automation Engineer",
  org: "GrowthClub.org",
  positioning:
    "I build systems that turn repetitive business operations into automated, connected infrastructure.",
  /** Growth-first framing shown under the hero headline. */
  growthLine:
    "Growth marketing at the core. I build the automation, integrations and code that growth work needs.",
  description:
    "Nelbin Joseph is an AI automation and systems engineer with a growth marketing background. He builds connected systems for webinars, outreach, lead data, infrastructure and internal operations.",
  /** Public URL on GitHub Pages. Change this if you later add a custom domain. */
  url: "https://nelbinxav.github.io/nelbin-portfolio",
  location: "Bengaluru, India",
  links: contact,
  /** Items with enabled:false are hidden until their page exists. */
  nav: [
    { label: "Work", href: "/#work", enabled: true },
    { label: "What I do", href: "/#services", enabled: true },
    { label: "Process", href: "/#process", enabled: true },
    { label: "Journey", href: "/#journey", enabled: true },
    { label: "Contact", href: "#contact", enabled: true },
  ],
} as const;
