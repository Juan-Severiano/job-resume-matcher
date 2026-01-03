export function createExtractJobPrompt(markdown: string): string {
  return `You are a job description parser. Extract structured information from the following job posting.

CRITICAL RULES:
1. Extract ONLY information that is explicitly stated in the text
2. DO NOT invent or infer skills that are not mentioned
3. DO NOT add skills based on assumptions
4. Return valid JSON only, no additional text

Job Posting:
${markdown}

Extract and return a JSON object with this exact structure:
{
  "role": "string - job title/role",
  "seniority": "junior" | "pleno" | "senior" - based on explicit mentions or requirements",
  "requiredSkills": [
    {
      "name": "string - skill name exactly as mentioned",
      "weight": number - importance (1-10, higher = more important)
    }
  ],
  "keywords": [
    {
      "term": "string - important keyword or phrase",
      "weight": number - importance (1-10, higher = more important)
    }
  ]
}

Return ONLY the JSON object, no markdown formatting, no code blocks.`;
}

