import type { Resume } from "@jrm/core";
import { getPrintCSS } from "./css.js";
import { renderResumeContent } from "./template.js";

export function buildHtml(resume: Resume): string {
  const css = getPrintCSS();
  const content = renderResumeContent(resume);
  const title = resume.name ? `CV - ${resume.name}` : "Resume";
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${css}
</head>
<body>
  ${content}
</body>
</html>`;
}

