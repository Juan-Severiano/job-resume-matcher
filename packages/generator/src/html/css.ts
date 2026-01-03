export function getPrintCSS(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 11pt;
        line-height: 1.4;
        color: #1a1a1a;
        background: white;
        max-width: 210mm;
        margin: 0 auto;
        padding: 15mm 20mm;
      }
      
      @media print {
        body {
          padding: 10mm 15mm;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      }
      
      header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #333;
        padding-bottom: 15px;
      }
      
      h1 {
        font-size: 28pt;
        font-weight: bold;
        letter-spacing: 2px;
        margin-bottom: 5px;
        text-transform: uppercase;
      }
      
      .subtitle {
        font-size: 12pt;
        font-style: italic;
        color: #333;
        margin-bottom: 8px;
      }
      
      .contact-info {
        font-size: 9pt;
        color: #444;
      }
      
      .contact-info a {
        color: #444;
        text-decoration: none;
      }
      
      .contact-info span {
        margin: 0 8px;
      }
      
      section {
        margin-bottom: 18px;
      }
      
      h2 {
        font-size: 11pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        border-bottom: 1px solid #333;
        padding-bottom: 3px;
        margin-bottom: 10px;
      }
      
      .summary {
        text-align: justify;
        font-size: 10.5pt;
      }
      
      .summary strong {
        font-weight: bold;
      }
      
      .skills-category {
        margin-bottom: 6px;
      }
      
      .skills-category strong {
        font-weight: bold;
      }
      
      .job {
        margin-bottom: 15px;
      }
      
      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 3px;
      }
      
      .job-company {
        font-weight: bold;
        font-size: 11pt;
      }
      
      .job-date {
        font-style: italic;
        font-size: 10pt;
        color: #333;
      }
      
      .job-position {
        font-style: italic;
        margin-bottom: 6px;
        font-size: 10.5pt;
      }
      
      ul {
        margin-left: 18px;
      }
      
      li {
        margin-bottom: 5px;
        text-align: justify;
        font-size: 10.5pt;
      }
      
      li strong {
        font-weight: bold;
      }
      
      .education-item {
        margin-bottom: 8px;
      }
      
      .education-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      
      .education-degree {
        font-weight: bold;
      }
      
      .education-date {
        font-style: italic;
        font-size: 10pt;
      }
      
      .education-school {
        font-style: italic;
        color: #333;
      }
      
      .project-item {
        margin-bottom: 15px;
      }
      
      .project-name {
        font-weight: bold;
        font-size: 11pt;
        margin-bottom: 6px;
      }
      
      .project-description {
        font-size: 10.5pt;
        margin-bottom: 6px;
      }
      
      .project-technologies {
        font-size: 10pt;
        color: #333;
        margin-bottom: 6px;
      }
    </style>
  `.trim();
}
