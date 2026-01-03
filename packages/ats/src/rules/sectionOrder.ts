export const sectionOrder = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education"
] as const;

export type SectionName = typeof sectionOrder[number];

