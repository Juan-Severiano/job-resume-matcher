import type { Resume, Experience, Project, Education, ContactInfo } from "@jrm/core";

interface Section {
  title: string;
  level: number;
  content: string;
  lines: string[];
}

function parseSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: headerMatch?.[2]?.trim() || "",
        level: headerMatch?.[1]?.length || 0,
        content: "",
        lines: []
      };
    } else if (currentSection) {
      currentSection.lines.push(line);
      currentSection.content += (currentSection.content ? "\n" : "") + line;
    }
  }
  
  // Save last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function normalizeSectionTitle(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function findSection(sections: Section[], ...possibleTitles: string[]): Section | null {
  const normalizedTitles = possibleTitles.map(t => normalizeSectionTitle(t));
  
  for (const section of sections) {
    const normalized = normalizeSectionTitle(section.title);
    if (normalizedTitles.some(title => normalized.includes(title) || title.includes(normalized))) {
      return section;
    }
  }
  
  return null;
}

function parseSummary(sections: Section[]): string | undefined {
  const section = findSection(sections, "summary", "resumo", "about", "sobre", "profile", "perfil");
  if (!section) return undefined;
  
  return section.content.trim() || undefined;
}

function parseSkills(sections: Section[]): string[] {
  const section = findSection(sections, "skills", "habilidades", "technologies", "tecnologias");
  if (!section) return [];
  
  const skills: string[] = [];
  
  for (const line of section.lines) {
    // Check for list items (-, *, •)
    const listMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
    if (listMatch) {
      skills.push(listMatch?.[1]?.trim() || "");
    } else {
      // Check for comma-separated skills
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const commaSkills = trimmed.split(",").map(s => s.trim()).filter(Boolean);
        skills.push(...commaSkills);
      }
    }
  }
  
  return skills.filter(Boolean);
}

function parseExperience(sections: Section[]): Experience[] {
  const section = findSection(sections, "experience", "experiência", "work", "trabalho", "employment", "emprego");
  if (!section) return [];
  
  const experiences: Experience[] = [];
  let currentExp: Partial<Experience> | null = null;
  let currentBullets: string[] = [];
  
  for (const line of section.lines) {
    const trimmed = line.trim();
    
    // Check for company/role line (usually bold or header-like)
    const roleMatch = trimmed.match(/^\*\*(.+?)\*\*\s*[-–—]\s*(.+)$/);
    const simpleRoleMatch = trimmed.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    
    if (roleMatch || simpleRoleMatch) {
      // Save previous experience
      if (currentExp && currentExp.company && currentExp.role) {
        experiences.push({
          company: currentExp.company,
          role: currentExp.role,
          period: currentExp.period || "",
          bullets: currentBullets
        });
      }
      
      const match = roleMatch || simpleRoleMatch;
      if (match) {
        currentExp = {
          role: match?.[1]?.trim() || "",
          company: match?.[2]?.trim() || "",
          period: ""
        };
        currentBullets = [];
      }
    } else if (trimmed.match(/^\d{4}/) || trimmed.match(/\d{4}\s*[-–—]\s*\d{4}/) || trimmed.match(/\d{4}\s*[-–—]\s*(present|atual|current)/i)) {
      // Period line
      if (currentExp) {
        currentExp.period = trimmed;
      }
    } else if (trimmed.match(/^[-*•]\s+/)) {
      // Bullet point
      const bullet = trimmed.replace(/^[-*•]\s+/, "").trim();
      if (bullet) {
        currentBullets.push(bullet);
      }
    } else if (trimmed && !trimmed.startsWith("#")) {
      // Might be a continuation or description
      if (currentExp && !currentExp.period) {
        // If no period set yet, this might be the period
        if (trimmed.match(/\d{4}/)) {
          currentExp.period = trimmed;
        }
      }
    }
  }
  
  // Save last experience
  if (currentExp && currentExp.company && currentExp.role) {
    experiences.push({
      company: currentExp.company,
      role: currentExp.role,
      period: currentExp.period || "",
      bullets: currentBullets
    });
  }
  
  return experiences;
}

function parseProjects(sections: Section[]): Project[] {
  const section = findSection(sections, "projects", "projetos", "portfolio");
  if (!section) return [];
  
  const projects: Project[] = [];
  let currentProject: Partial<Project> | null = null;
  let currentBullets: string[] = [];
  
  for (const line of section.lines) {
    const trimmed = line.trim();
    
    // Check for project name (usually bold or header-like)
    const nameMatch = trimmed.match(/^\*\*(.+?)\*\*/);
    const headerMatch = trimmed.match(/^###\s+(.+)$/);
    
    if (nameMatch || headerMatch) {
      // Save previous project
      if (currentProject && currentProject.name) {
        projects.push({
          name: currentProject.name,
          description: currentProject.description,
          bullets: currentBullets,
          technologies: currentProject.technologies
        });
      }
      
      const name = nameMatch?.[1] || headerMatch?.[1] || "";
      currentProject = { name: name.trim() };
      currentBullets = [];
    } else if (trimmed.match(/^[-*•]\s+/)) {
      // Bullet point
      const bullet = trimmed.replace(/^[-*•]\s+/, "").trim();
      if (bullet) {
        currentBullets.push(bullet);
      }
    } else if (trimmed && !trimmed.startsWith("#")) {
      // Description or technology line
      if (currentProject) {
        if (trimmed.toLowerCase().includes("tech") || trimmed.toLowerCase().includes("stack")) {
          const techMatch = trimmed.match(/(?:tech|stack)[:\s]+(.+)/i);
          if (techMatch) {
            currentProject.technologies = techMatch?.[1]?.split(",").map(t => t.trim()).filter(Boolean) || [];
          }
        } else if (!currentProject.description) {
          currentProject.description = trimmed;
        }
      }
    }
  }
  
  // Save last project
  if (currentProject && currentProject.name) {
    projects.push({
      name: currentProject.name,
      description: currentProject.description,
      bullets: currentBullets,
      technologies: currentProject.technologies
    });
  }
  
  return projects;
}

function parseEducation(sections: Section[]): Education[] {
  const section = findSection(sections, "education", "educação", "academic", "acadêmico");
  if (!section) return [];
  
  const educations: Education[] = [];
  let currentEdu: Partial<Education> | null = null;
  
  for (const line of section.lines) {
    const trimmed = line.trim();
    
    // Check for institution/degree line
    const degreeMatch = trimmed.match(/^\*\*(.+?)\*\*\s*[-–—]\s*(.+)$/);
    const simpleMatch = trimmed.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    
    if (degreeMatch || simpleMatch) {
      // Save previous education
      if (currentEdu && currentEdu.institution && currentEdu.degree) {
        educations.push({
          institution: currentEdu.institution,
          degree: currentEdu.degree,
          period: currentEdu.period || "",
          details: currentEdu.details
        });
      }
      
      const match = degreeMatch || simpleMatch;
      if (match) {
        currentEdu = {
          institution: match?.[1]?.trim() || "",
          degree: match?.[2]?.trim() ?? "",
          period: ""
        };
      }
    } else if (trimmed.match(/^\d{4}/) || trimmed.match(/\d{4}\s*[-–—]\s*\d{4}/) || trimmed.match(/\d{4}\s*[-–—]\s*(present|atual|current)/i)) {
      // Period line
      if (currentEdu) {
        currentEdu.period = trimmed;
      }
    } else if (trimmed && !trimmed.startsWith("#")) {
      // Details
      if (currentEdu) {
        if (!currentEdu.details) {
          currentEdu.details = trimmed;
        } else {
          currentEdu.details += " " + trimmed;
        }
      }
    }
  }
  
  // Save last education
  if (currentEdu && currentEdu.institution && currentEdu.degree) {
    educations.push({
      institution: currentEdu.institution,
      degree: currentEdu.degree,
      period: currentEdu.period || "",
      details: currentEdu.details
    });
  }
  
  return educations;
}

function parseName(markdown: string): string | undefined {
  // Try to find name in first line or header
  const lines = markdown.split("\n");
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Check if it's a standalone name (no markdown, just text)
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith("*") && trimmed.length < 50) {
      const headerMatch = trimmed.match(/^#+\s*(.+)$/);
      if (headerMatch && headerMatch[1]) {
        return headerMatch[1].trim();
      }
      // If it looks like a name (capitalized, 2-3 words)
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,2}$/.test(trimmed)) {
        return trimmed;
      }
    }
  }
  return undefined;
}

function parseContact(sections: Section[]): ContactInfo | undefined {
  const section = findSection(sections, "contact", "contato", "contact info", "informações de contato");
  if (!section) return undefined;
  
  const contact: ContactInfo = {};
  
  for (const line of section.lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.includes("email") || trimmed.includes("@")) {
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) contact.email = emailMatch[1];
    }
    if (trimmed.includes("phone") || trimmed.includes("telefone") || /\+?\d/.test(trimmed)) {
      const phoneMatch = line.match(/(\+?\d[\d\s\-\(\)]+)/);
      if (phoneMatch && phoneMatch[1]) contact.phone = phoneMatch[1].trim();
    }
    if (trimmed.includes("linkedin")) {
      const linkedinMatch = line.match(/(linkedin\.com\/[^\s]+|linkedin\.com\/in\/[^\s]+)/i);
      if (linkedinMatch) contact.linkedin = linkedinMatch[1];
    }
    if (trimmed.includes("github")) {
      const githubMatch = line.match(/(github\.com\/[^\s]+)/i);
      if (githubMatch) contact.github = githubMatch[1];
    }
    if (trimmed.includes("website") || trimmed.includes("site") || trimmed.includes("portfolio")) {
      const websiteMatch = line.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (websiteMatch && websiteMatch[1] && !websiteMatch[1].includes("linkedin") && !websiteMatch[1].includes("github")) {
        contact.website = websiteMatch[1];
      }
    }
  }
  
  return Object.keys(contact).length > 0 ? contact : undefined;
}

export function parseMarkdownToResume(markdown: string): Resume {
  const sections = parseSections(markdown);
  
  const name = parseName(markdown);
  const contact = parseContact(sections);
  const summary = parseSummary(sections);
  const skills = parseSkills(sections);
  const experiences = parseExperience(sections);
  const projects = parseProjects(sections);
  const education = parseEducation(sections);
  
  return {
    name,
    contact,
    summary,
    skills,
    experiences,
    projects: projects.length > 0 ? projects : undefined,
    education: education.length > 0 ? education : undefined
  };
}

