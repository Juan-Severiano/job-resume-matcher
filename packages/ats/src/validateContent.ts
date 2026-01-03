import type { Resume } from "@jrm/core";
import { sectionOrder, type SectionName } from "./rules/sectionOrder.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  score: number;
}

function getSectionOrder(resume: Resume): SectionName[] {
  const order: SectionName[] = [];
  
  if (resume.summary) order.push("summary");
  if (resume.skills.length > 0) order.push("skills");
  if (resume.experiences.length > 0) order.push("experience");
  if (resume.projects && resume.projects.length > 0) order.push("projects");
  if (resume.education && resume.education.length > 0) order.push("education");
  
  return order;
}

function validateRequiredSections(resume: Resume): string[] {
  const errors: string[] = [];
  
  if (!resume.summary || resume.summary.trim().length === 0) {
    errors.push("Missing required section: summary");
  }
  
  if (resume.experiences.length === 0) {
    errors.push("Missing required section: experience");
  }
  
  if (!resume.education || resume.education.length === 0) {
    errors.push("Missing required section: education");
  }
  
  return errors;
}

function validateSectionOrder(resume: Resume): string[] {
  const errors: string[] = [];
  const actualOrder = getSectionOrder(resume);
  const expectedOrder = sectionOrder.filter(section => actualOrder.includes(section));
  
  // Check if order matches expected order
  for (let i = 0; i < actualOrder.length; i++) {
    if (actualOrder[i] !== expectedOrder[i]) {
      errors.push(`Section order violation: expected "${expectedOrder[i]}" but found "${actualOrder[i]}"`);
      break;
    }
  }
  
  return errors;
}

export function validateContent(resume: Resume): ValidationResult {
  const errors: string[] = [];
  
  // Validate required sections
  errors.push(...validateRequiredSections(resume));
  
  // Validate section order
  errors.push(...validateSectionOrder(resume));
  
  // Calculate score (0-100)
  let score = 100;
  
  // Penalties
  const requiredSectionPenalty = 30;
  const orderPenalty = 20;
  
  const requiredErrors = validateRequiredSections(resume);
  const orderErrors = validateSectionOrder(resume);
  
  score -= requiredErrors.length * requiredSectionPenalty;
  score -= orderErrors.length * orderPenalty;
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    valid: errors.length === 0,
    errors,
    score
  };
}

