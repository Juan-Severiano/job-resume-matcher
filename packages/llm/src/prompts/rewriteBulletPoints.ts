import type { Job } from "@jrm/core";

export function createRewriteBulletPrompt(bullet: string, job: Job): string {
  return `You are a resume optimizer. Rewrite the following bullet point to be more ATS-friendly and aligned with the job requirements.

CRITICAL RULES:
1. DO NOT invent technologies, tools, or achievements not mentioned in the original bullet
2. DO NOT inflate seniority or responsibilities
3. Use action verbs appropriate for ${job.seniority} level
4. Keep the same factual content, just make it more impactful
5. Return ONLY the rewritten bullet point, no explanations, no markdown

Job Context:
- Role: ${job.role}
- Seniority: ${job.seniority}
- Key Skills: ${job.requiredSkills.map(s => s.name).join(", ")}

Original Bullet Point:
${bullet}

Rewritten Bullet Point:`;
}

