export interface JobSkill {
  name: string;
  weight: number;
}

export interface JobKeyword {
  term: string;
  weight: number;
}

export interface Job {
  role: string;
  seniority: "junior" | "pleno" | "senior";
  requiredSkills: JobSkill[];
  keywords: JobKeyword[];
}

