import type { Experience } from "./Experience.js";
import type { Project } from "./Project.js";

export interface Education {
  institution: string;
  degree: string;
  period: string;
  details?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface Resume {
  name?: string;
  subtitle?: string;
  contact?: ContactInfo;
  summary?: string;
  skills: string[];
  experiences: Experience[];
  projects?: Project[];
  education?: Education[];
}

export type { Experience } from "./Experience.js";
export type { Project } from "./Project.js";

