import type { Resume } from "../models/Resume.js";
import type { Job } from "../models/Job.js";
import { scoreResume, type ScoredExperience, type ScoredProject } from "../scoring/scoreResume.js";

export function rankItems(resume: Resume, job: Job): Resume {
  const scores = scoreResume(resume, job);

  // Filter and sort experiences
  const rankedExperiences = scores.scoreExperiences
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.experience);

  // Filter and sort projects
  const rankedProjects = scores.scoreProjects
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.project);

  // Filter and sort skills (keep only relevant ones)
  const rankedSkills = scores.scoreSkills
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.skill);

  return {
    ...resume,
    skills: rankedSkills.length > 0 ? rankedSkills : resume.skills,
    experiences: rankedExperiences,
    projects: rankedProjects.length > 0 ? rankedProjects : resume.projects
  };
}

