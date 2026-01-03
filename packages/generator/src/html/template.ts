import type { Resume } from "@jrm/core";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, m => map[m] ?? m);
}

function renderHeader(resume: Resume): string {
  const name = resume.name || "Resume";
  const subtitle = resume.subtitle ? `<div class="subtitle">${escapeHtml(resume.subtitle)}</div>` : "";
  
  let contactInfo = "";
  if (resume.contact) {
    const contactParts: string[] = [];
    if (resume.contact.email) contactParts.push(`<span>${escapeHtml(resume.contact.email)}</span>`);
    if (resume.contact.linkedin) contactParts.push(`<span>${escapeHtml(resume.contact.linkedin)}</span>`);
    if (resume.contact.github) contactParts.push(`<span>${escapeHtml(resume.contact.github)}</span>`);
    if (resume.contact.website) contactParts.push(`<span>${escapeHtml(resume.contact.website)}</span>`);
    if (resume.contact.phone) contactParts.push(`<span>${escapeHtml(resume.contact.phone)}</span>`);
    
    if (contactParts.length > 0) {
      contactInfo = `<div class="contact-info">${contactParts.join(" | ")}</div>`;
    }
  }
  
  return `<header>
    <h1>${escapeHtml(name)}</h1>
    ${subtitle}
    ${contactInfo}
  </header>`;
}

function processMarkdown(text: string): string {
  // Process markdown bold before escaping
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderSummary(summary: string): string {
  // Preserve line breaks and format
  const formatted = summary
    .split("\n\n")
    .map(para => `<p class="summary">${processMarkdown(para)}</p>`)
    .join("<br><br>");
  
  return `<section>
    <h2>Resumo Profissional</h2>
    ${formatted}
  </section>`;
}

function renderSkills(skills: string[]): string {
  if (skills.length === 0) return "";
  
  // Try to detect if skills are categorized (e.g., "Category: item1, item2")
  const categorized: Array<{ category: string; items: string[] }> = [];
  const uncategorized: string[] = [];
  
  for (const skill of skills) {
    const categoryMatch = skill.match(/^(.+?):\s*(.+)$/);
    if (categoryMatch) {
      categorized.push({
        category: categoryMatch?.[1]?.trim() ?? "",
        items: categoryMatch?.[2]?.split(",").map(s => s.trim()).filter(Boolean) ?? []
      });
    } else {
      uncategorized.push(skill);
    }
  }
  
  let skillsContent = "";
  
  if (categorized.length > 0) {
    skillsContent = categorized.map(cat => {
      const items = cat.items.join(", ");
      return `<div class="skills-category"><strong>${escapeHtml(cat.category)}:</strong> ${escapeHtml(items)}</div>`;
    }).join("\n        ");
  }
  
  if (uncategorized.length > 0) {
    const items = uncategorized.join(", ");
    if (categorized.length > 0) {
      skillsContent += `\n        <div class="skills-category">${escapeHtml(items)}</div>`;
    } else {
      skillsContent = `<div class="skills-category">${escapeHtml(items)}</div>`;
    }
  }
  
  return `<section>
    <h2>Habilidades Técnicas</h2>
    ${skillsContent}
  </section>`;
}

function renderExperience(experience: Resume["experiences"][0]): string {
  const bullets = experience.bullets
    .map(bullet => `<li>${processMarkdown(bullet)}</li>`)
    .join("");
  
  return `<div class="job">
    <div class="job-header">
      <div class="job-company">${escapeHtml(experience.company)}</div>
      <div class="job-date">${escapeHtml(experience.period)}</div>
    </div>
    <div class="job-position">${escapeHtml(experience.role)}</div>
    <ul>
      ${bullets}
    </ul>
  </div>`;
}

function renderExperiences(experiences: Resume["experiences"]): string {
  if (experiences.length === 0) return "";
  
  const items = experiences.map(renderExperience).join("\n        ");
  
  return `<section>
    <h2>Experiência Profissional</h2>
    ${items}
  </section>`;
}

function renderProject(project: NonNullable<Resume["projects"]>[0]): string {
  const bullets = project.bullets
    .map(bullet => `<li>${processMarkdown(bullet)}</li>`)
    .join("");
  
  const description = project.description 
    ? `<div class="project-description">${escapeHtml(project.description)}</div>`
    : "";
  
  const technologies = project.technologies && project.technologies.length > 0
    ? `<div class="project-technologies"><strong>Tech:</strong> ${project.technologies.map(t => escapeHtml(t)).join(", ")}</div>`
    : "";
  
  return `<div class="project-item">
    <div class="project-name">${escapeHtml(project.name)}</div>
    ${description}
    ${technologies}
    <ul>
      ${bullets}
    </ul>
  </div>`;
}

function renderProjects(projects: Resume["projects"]): string {
  if (!projects || projects.length === 0) return "";
  
  const items = projects.map(renderProject).join("\n        ");
  
  return `<section>
    <h2>Portfólio de Apps Publicados & Projetos Notáveis</h2>
    ${items}
  </section>`;
}

function renderEducation(education: NonNullable<Resume["education"]>[0]): string {
  return `<div class="education-item">
    <div class="education-header">
      <span class="education-degree">${escapeHtml(education.degree)}</span>
      <span class="education-date">${escapeHtml(education.period)}</span>
    </div>
    <div class="education-school">${escapeHtml(education.institution)}</div>
  </div>`;
}

function renderEducations(educations: Resume["education"]): string {
  if (!educations || educations.length === 0) return "";
  
  const items = educations.map(renderEducation).join("\n        ");
  
  return `<section>
    <h2>Formação & Certificações</h2>
    ${items}
  </section>`;
}

export function renderResumeContent(resume: Resume): string {
  const sections: string[] = [];
  
  // Header first
  sections.push(renderHeader(resume));
  
  if (resume.summary) {
    sections.push(renderSummary(resume.summary));
  }
  
  if (resume.skills.length > 0) {
    sections.push(renderSkills(resume.skills));
  }
  
  if (resume.experiences.length > 0) {
    sections.push(renderExperiences(resume.experiences));
  }
  
  if (resume.projects && resume.projects.length > 0) {
    sections.push(renderProjects(resume.projects));
  }
  
  if (resume.education && resume.education.length > 0) {
    sections.push(renderEducations(resume.education));
  }
  
  return sections.join("\n    ");
}
