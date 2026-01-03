import type { Resume, Job } from "@jrm/core";
import type { LLMProvider } from "@jrm/llm";
import { rankItems } from "@jrm/core";
import { validateContent } from "@jrm/ats";
import { buildHtml } from "./html/buildHtml.js";

export interface GenerateResumeOptions {
  resume: Resume;
  job: Job;
  provider: LLMProvider;
  rewriteBullets?: boolean;
}

async function rewriteBulletsInResume(
  resume: Resume,
  job: Job,
  provider: LLMProvider
): Promise<Resume> {
  const rewrittenResume: Resume = {
    ...resume,
    experiences: [],
    projects: resume.projects ? [] : undefined
  };

  // Rewrite experience bullets
  for (const experience of resume.experiences) {
    const rewrittenBullets = await Promise.all(
      experience.bullets.map(bullet => provider.rewriteBullet(bullet, job))
    );
    
    rewrittenResume.experiences.push({
      ...experience,
      bullets: rewrittenBullets
    });
  }

  // Rewrite project bullets if projects exist
  if (resume.projects) {
    rewrittenResume.projects = [];
    for (const project of resume.projects) {
      const rewrittenBullets = await Promise.all(
        project.bullets.map(bullet => provider.rewriteBullet(bullet, job))
      );
      
      rewrittenResume.projects.push({
        ...project,
        bullets: rewrittenBullets
      });
    }
  }

  return rewrittenResume;
}

export async function generateResume(options: GenerateResumeOptions): Promise<string> {
  const { resume, job, provider, rewriteBullets = true } = options;

  // Step 1: Apply ranking from core
  let rankedResume = rankItems(resume, job);

  // Step 2: Rewrite bullets via LLM if enabled
  if (rewriteBullets) {
    rankedResume = await rewriteBulletsInResume(rankedResume, job, provider);
  }

  // Step 3: Validate content via ATS
  const validation = validateContent(rankedResume);
  
  // Log validation errors if any (but don't block generation)
  if (!validation.valid && validation.errors.length > 0) {
    console.warn("ATS Validation warnings:", validation.errors);
  }

  // Step 4: Generate HTML
  const html = buildHtml(rankedResume);

  return html;
}

