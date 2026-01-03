#!/usr/bin/env node

// Load .env file before anything else - MUST be first
import { config } from "dotenv";
import { resolve as resolvePath, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (go up from apps/cli/dist or apps/cli/src)
const projectRoot = resolvePath(__dirname, "..", "..", "..");

// Try to load .env from multiple locations
const envPaths = [
  resolvePath(projectRoot, ".env"),           // Root .env
  resolvePath(projectRoot, "packages", "llm", ".env"), // packages/llm/.env
  resolvePath(process.cwd(), ".env"),         // Current dir .env
  resolvePath(__dirname, "..", ".env"),       // apps/cli/.env
];

// Load all .env files that exist (later ones override earlier ones)
// IMPORTANT: Load in reverse order so later files override earlier ones
for (let i = envPaths.length - 1; i >= 0; i--) {
  const envPath = envPaths[i];
  if (existsSync(envPath as any)) {
    try {
      const result = config({ path: envPath, override: true });
      if (!result.error && result.parsed) {
        // Successfully loaded
        if (process.env.OPENAI_API_KEY) {
          // Key is now available
        }
      }
    } catch (error) {
      // Continue to next file
    }
  }
}

// Also try default location (current working directory) - this will override
try {
  config({ override: true });
} catch (error) {
  // Ignore
}

import { program } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import type { Resume } from "@jrm/core";
import { createOpenAIProvider } from "@jrm/llm";
import { generateResume } from "@jrm/generator";
import { parseMarkdownToResume } from "@jrm/parser";

program
  .name("jrm")
  .description("Job Resume Matcher - Generate ATS-friendly resumes from job postings")
  .version("0.0.0")
  .requiredOption("--input <file>", "Path to job posting markdown file (post.md)")
  .option("--resume <file>", "Path to resume file (JSON or Markdown)", "resume.json")
  .option("-o, --output <file>", "Output HTML file path", "output.html")
  .option("--check-ai", "Check if OpenAI API is configured")
  .action(async (options) => {
    try {
      // Check AI configuration if requested
      if (options.checkAi) {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log(`Project root: ${projectRoot}`);
        console.log(`Current working directory: ${process.cwd()}`);
        console.log(`\nChecked .env files:`);
        for (const envPath of envPaths) {
          const exists = existsSync(envPath);
          console.log(`  ${exists ? '✓' : '✗'} ${envPath}`);
        }
        
        if (apiKey) {
          console.log(`\n✅ OPENAI_API_KEY is configured!`);
          console.log(`   Key starts with: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
          console.log(`   Key length: ${apiKey.length} characters`);
          console.log("   AI will be used for job extraction and bullet rewriting.");
        } else {
          console.log(`\n❌ OPENAI_API_KEY is NOT configured!`);
          console.log("   The tool will use MOCK provider (low quality).");
          console.log("\n   To configure:");
          console.log("   1. export OPENAI_API_KEY='sk-your-key-here'");
          console.log(`   2. Or add OPENAI_API_KEY=sk-your-key-here to ${resolvePath(projectRoot, ".env")}`);
          console.log(`   3. Or add to ${resolvePath(projectRoot, "packages", "llm", ".env")}`);
        }
        process.exit(0);
      }
      
      const inputPath = resolve(options.input);
      const resumePath = resolve(options.resume);
      const outputPath = resolve(options.output);

      console.log("Reading job posting from:", inputPath);
      let jobPosting: string;
      try {
        jobPosting = await readFile(inputPath, "utf-8");
      } catch (error) {
        throw new Error(`Failed to read job posting file: ${inputPath}\n${error instanceof Error ? error.message : String(error)}`);
      }

      console.log("Reading resume from:", resumePath);
      let resumeContent: string;
      try {
        resumeContent = await readFile(resumePath, "utf-8");
      } catch (error) {
        throw new Error(`Failed to read resume file: ${resumePath}\n${error instanceof Error ? error.message : String(error)}`);
      }

      let resume: Resume;
      const ext = extname(resumePath).toLowerCase();
      
      if (ext === ".md" || ext === ".markdown") {
        // Parse markdown to Resume
        console.log("Parsing markdown resume...");
        try {
          resume = parseMarkdownToResume(resumeContent);
        } catch (error) {
          throw new Error(`Failed to parse markdown resume: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Parse JSON
        try {
          resume = JSON.parse(resumeContent);
        } catch (error) {
          throw new Error(`Failed to parse resume JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      console.log("Initializing LLM provider...");
      
      // Debug: Check API key before creating provider
      const apiKeyBefore = process.env.OPENAI_API_KEY;
      if (apiKeyBefore) {
        console.log(`   [DEBUG] OPENAI_API_KEY found in process.env: ${apiKeyBefore.substring(0, 7)}...`);
      } else {
        console.log("   [DEBUG] OPENAI_API_KEY NOT found in process.env");
        console.log(`   [DEBUG] All env vars: ${Object.keys(process.env).filter(k => k.includes('OPENAI')).join(', ') || 'none'}`);
      }
      
      const provider = createOpenAIProvider();
      
      // Check if using mock provider
      if (provider.isMock) {
        console.warn("⚠️  WARNING: OPENAI_API_KEY not found! Using MOCK provider (low quality).");
        console.warn("   Set OPENAI_API_KEY environment variable for real AI processing.");
        console.warn("   Example: export OPENAI_API_KEY='sk-...'");
        console.warn(`   Or add to .env file at: ${resolvePath(projectRoot, ".env")}`);
        console.warn(`   Or add to: ${resolvePath(projectRoot, "packages", "llm", ".env")}`);
      } else {
        console.log("✅ Using OpenAI API (GPT-4o-mini)");
      }

      console.log("Extracting job information...");
      const job = await provider.extractJob(jobPosting);

      console.log(`Job: ${job.role} (${job.seniority})`);
      console.log(`Required skills: ${job.requiredSkills.length}`);
      console.log(`Keywords: ${job.keywords.length}`);
      
      if (provider.isMock) {
        console.warn("⚠️  Using MOCK provider - bullets will be minimally rewritten!");
      }

      console.log("Generating optimized resume...");
      if (!provider.isMock) {
        console.log("   Rewriting bullets with AI...");
      }
      
      const html = await generateResume({
        resume,
        job,
        provider,
        rewriteBullets: true
      });

      console.log("Writing HTML to:", outputPath);
      await writeFile(outputPath, html, "utf-8");

      console.log("✅ Resume generated successfully!");
    } catch (error) {
      console.error("❌ Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();

