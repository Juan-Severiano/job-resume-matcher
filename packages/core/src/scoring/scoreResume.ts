import type { Resume, Experience, Project } from "../models/Resume.js";
import type { Job } from "../models/Job.js";

export interface ScoredExperience {
  experience: Experience;
  score: number;
}

export interface ScoredProject {
  project: Project;
  score: number;
}

export interface ScoredSkill {
  skill: string;
  score: number;
}

export interface ResumeScores {
  scoreExperiences: ScoredExperience[];
  scoreProjects: ScoredProject[];
  scoreSkills: ScoredSkill[];
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

function matchSkill(resumeSkill: string, jobSkill: string): boolean {
  return normalizeString(resumeSkill) === normalizeString(jobSkill);
}

function matchKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeString(text);
  const normalizedKeyword = normalizeString(keyword);
  return normalizedText.includes(normalizedKeyword);
}

function scoreExperience(experience: Experience, job: Job): number {
  let score = 0;

  // Match skills in role/company
  const experienceText = `${experience.role} ${experience.company}`.toLowerCase();
  for (const jobSkill of job.requiredSkills) {
    if (matchSkill(experienceText, jobSkill.name) || matchKeyword(experienceText, jobSkill.name)) {
      score += jobSkill.weight;
    }
  }

  // Match keywords in bullets
  for (const bullet of experience.bullets) {
    for (const keyword of job.keywords) {
      if (matchKeyword(bullet, keyword.term)) {
        score += keyword.weight;
      }
    }
  }

  return score;
}

function scoreProject(project: Project, job: Job): number {
  let score = 0;

  // Match skills in name/description/technologies
  const projectText = [
    project.name,
    project.description,
    ...(project.technologies ?? [])
  ].filter(Boolean).join(" ").toLowerCase();

  for (const jobSkill of job.requiredSkills) {
    if (matchSkill(projectText, jobSkill.name) || matchKeyword(projectText, jobSkill.name)) {
      score += jobSkill.weight;
    }
  }

  // Match keywords in bullets
  for (const bullet of project.bullets) {
    for (const keyword of job.keywords) {
      if (matchKeyword(bullet, keyword.term)) {
        score += keyword.weight;
      }
    }
  }

  return score;
}

function scoreSkill(resumeSkill: string, job: Job): number {
  let score = 0;

  for (const jobSkill of job.requiredSkills) {
    if (matchSkill(resumeSkill, jobSkill.name)) {
      score += jobSkill.weight;
    }
  }

  return score;
}

export function scoreResume(resume: Resume, job: Job): ResumeScores {
  const scoreExperiences: ScoredExperience[] = resume.experiences.map(experience => ({
    experience,
    score: scoreExperience(experience, job)
  }));

  const scoreProjects: ScoredProject[] = (resume.projects ?? []).map(project => ({
    project,
    score: scoreProject(project, job)
  }));

  const scoreSkills: ScoredSkill[] = resume.skills.map(skill => ({
    skill,
    score: scoreSkill(skill, job)
  }));

  return {
    scoreExperiences,
    scoreProjects,
    scoreSkills
  };
}

