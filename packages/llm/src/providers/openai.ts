import OpenAI from "openai";
import type { Job } from "@jrm/core";
import { createExtractJobPrompt } from "../prompts/extractJobFromMarkdown.js";
import { createRewriteBulletPrompt } from "../prompts/rewriteBulletPoints.js";
import { createMockProvider as createMockLLMProvider } from "./mock.js";

export interface LLMProvider {
  extractJob(description: string): Promise<Job>;
  rewriteBullet(bullet: string, job: Job): Promise<string>;
  isMock?: boolean;
}

function parseJSON<T>(text: string): T {
  // Remove markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function createOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  return new OpenAI({ apiKey });
}

export function createOpenAIProvider(): LLMProvider {
  const client = createOpenAIClient();
  
  // Fallback to mock if no API key
  if (!client) {
    return createMockLLMProvider();
  }
  
  // At this point, client is guaranteed to be non-null
  const openaiClient = client;
  
  return {
    isMock: false,
    async extractJob(description: string): Promise<Job> {
      const prompt = createExtractJobPrompt(description);
      
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a job description parser. Always return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }
      
      const parsed = parseJSON<Job>(content);
      
      // Validate structure
      if (!parsed.role || !parsed.seniority || !Array.isArray(parsed.requiredSkills) || !Array.isArray(parsed.keywords)) {
        throw new Error("Invalid job structure returned from OpenAI");
      }
      
      return parsed;
    },
    
    async rewriteBullet(bullet: string, job: Job): Promise<string> {
      const prompt = createRewriteBulletPrompt(bullet, job);
      
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a resume optimizer. Return only the rewritten bullet point, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 150
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }
      
      return content.trim();
    }
  };
}

// Re-export mock provider for convenience
export { createMockProvider } from "./mock.js";

