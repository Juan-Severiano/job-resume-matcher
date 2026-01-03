import type { Job } from "@jrm/core";
import type { LLMProvider } from "./openai.js";

export function createMockProvider(): LLMProvider {
  return {
    isMock: true,
    async extractJob(description: string): Promise<Job> {
      // Simple mock that extracts basic info
      const roleMatch = description.match(/(?:role|position|title)[:\s]+([^\n]+)/i);
      const role = roleMatch?.[1]?.trim() || "Software Developer";
      
      let seniority: "junior" | "pleno" | "senior" = "pleno";
      if (description.toLowerCase().includes("senior")) seniority = "senior";
      if (description.toLowerCase().includes("junior")) seniority = "junior";
      
      // Extract skills (simple word matching)
      const skillKeywords = ["javascript", "typescript", "react", "node", "python", "java", "sql"];
      const requiredSkills = skillKeywords
        .filter(skill => description.toLowerCase().includes(skill))
        .map(skill => ({ name: skill, weight: 5 }));
      
      // Extract keywords (common tech terms)
      const keywords = skillKeywords
        .filter(keyword => description.toLowerCase().includes(keyword))
        .map(keyword => ({ term: keyword, weight: 3 }));
      
      return {
        role,
        seniority,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : [{ name: "general", weight: 1 }],
        keywords: keywords.length > 0 ? keywords : [{ term: "software", weight: 1 }]
      };
    },
    
    async rewriteBullet(bullet: string, job: Job): Promise<string> {
      // Simple mock that just capitalizes and adds action verb if missing
      let rewritten = bullet.trim();
      
      if (!rewritten.match(/^(developed|built|created|implemented|designed|managed|led|improved|optimized|reduced|increased)/i)) {
        rewritten = `Developed ${rewritten.toLowerCase()}`;
      }
      
      // Capitalize first letter
      rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
      
      return rewritten;
    }
  };
}

