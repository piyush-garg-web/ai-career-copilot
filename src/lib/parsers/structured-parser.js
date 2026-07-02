/**
 * Reusable resume structured parser module (Deterministic / Regex-based).
 * Extracts personalInfo and splits text into summary, skills, experience, education, projects, certifications, and languages.
 */

// Section Header Regexes (Short lines matching these switch the parser state)
const SECTION_HEADERS = {
  summary: /^(?:professional\s+|career\s+|executive\s+)?summary|profile|about\s+me|objective|summary\s+of\s+qualifications/i,
  skills: /^(?:technical\s+|key\s+|professional\s+)?skills|technologies|expertise|core\s+competencies|tools|technological\s+skills|skills\s+&\s+expertise/i,
  experience: /^(?:work\s+|professional\s+|employment\s+|relevant\s+)?experience|work\s+history|employment\s+history|career\s+history/i,
  education: /^education|academic\s+background|academic\s+history|academic\s+credentials|academic\s+qualifications/i,
  projects: /^projects|personal\s+projects|key\s+projects|academic\s+projects|technical\s+projects|selected\s+projects/i,
  certifications: /^certifications|licenses|courses|awards|achievements|training|professional\s+certifications/i,
  languages: /^languages|language\s+proficiency|additional\s+languages/i,
};

// Regex patterns for Contact Info
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const REGEX_PHONE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const REGEX_LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+/i;
const REGEX_GITHUB = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-_]+/i;
// Common location format: City, ST or City, Country
const REGEX_LOCATION = /\b[A-Z][a-zA-Z\s.]+,\s*[A-Z][a-zA-Z\s.]+\b|\b[A-Z][a-zA-Z\s.]+,\s*[A-Z]{2}\b/;

/**
 * Clean up text lines (remove bullet points, trim whitespace).
 * @param {string} textLine 
 * @returns {string}
 */
function cleanLine(textLine) {
  return textLine
    .replace(/^[\s•\-\*\+▪\d\.\)]+/, "") // Remove bullet characters, numbering lists at the start
    .trim();
}

/**
 * Extract candidate's name based on top header heuristics.
 * @param {string[]} headerLines - First few lines of the resume.
 * @returns {string}
 */
function extractName(headerLines) {
  for (const line of headerLines) {
    const cleaned = line.trim();
    if (!cleaned) continue;

    // Ignore lines that contain contact details or links
    if (cleaned.includes("@") || REGEX_EMAIL.test(cleaned)) continue;
    if (REGEX_PHONE.test(cleaned)) continue;
    if (REGEX_LINKEDIN.test(cleaned) || REGEX_GITHUB.test(cleaned)) continue;
    
    // Ignore lines that look like page titles or dividers
    if (/resume|curriculum|vitae|portfolio|page\s*\d/i.test(cleaned)) continue;

    // Name should be relatively short (e.g. 2 to 30 characters) and consist mostly of letters/spaces
    if (cleaned.length >= 2 && cleaned.length <= 35 && /^[a-zA-Z\s\.\-\'\’]+$/.test(cleaned)) {
      return cleaned;
    }
  }
  return "Unknown Candidate";
}

/**
 * Parses raw text content into a structured resume JSON object.
 * @param {string} rawText 
 * @returns {object}
 */
export function parseStructuredResume(rawText) {
  console.log("[STRUCTURED PARSER]: Commencing parsing of raw text segment. Length:", rawText?.length || 0);

  // Initialize output structure
  const structuredData = {
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  if (!rawText || typeof rawText !== "string") {
    console.warn("[STRUCTURED PARSER]: Warning: Raw text segment is empty or invalid.");
    return structuredData;
  }

  // 1. Extract contact details from the ENTIRE text using global regex matches
  const emailMatch = rawText.match(REGEX_EMAIL);
  const phoneMatch = rawText.match(REGEX_PHONE);
  const linkedinMatch = rawText.match(REGEX_LINKEDIN);
  const githubMatch = rawText.match(REGEX_GITHUB);

  structuredData.personalInfo.email = emailMatch ? emailMatch[0].trim() : "";
  structuredData.personalInfo.phone = phoneMatch ? phoneMatch[0].trim() : "";
  
  // Clean up social urls if found
  if (linkedinMatch) {
    let li = linkedinMatch[0].trim();
    structuredData.personalInfo.linkedin = li.startsWith("http") ? li : `https://${li}`;
  }
  if (githubMatch) {
    let gh = githubMatch[0].trim();
    structuredData.personalInfo.github = gh.startsWith("http") ? gh : `https://${gh}`;
  }

  // Split raw text into individual lines
  const lines = rawText.split(/\r?\n/);
  
  // Accumulators for sections
  const sectionContent = {
    header: [],
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  let currentSection = "header";

  // 2. State Machine: Segment lines into their matching sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if the line matches any section headers
    let matchedSection = null;
    
    // We treat short lines (< 40 chars) as header boundaries
    if (line.length < 40) {
      for (const [key, pattern] of Object.entries(SECTION_HEADERS)) {
        if (pattern.test(line)) {
          matchedSection = key;
          break;
        }
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      console.log(`[STRUCTURED PARSER]: Section change triggered -> "${currentSection}" at line ${i}`);
    } else {
      sectionContent[currentSection].push(lines[i]);
    }
  }

  // 3. Extract Candidate Name from the header lines
  structuredData.personalInfo.name = extractName(sectionContent.header);

  // 4. Extract Location from the header lines (or fallback to top 15 lines of text)
  let locationMatch = null;
  const searchLines = sectionContent.header.concat(lines.slice(0, 15));
  for (const searchLine of searchLines) {
    const match = searchLine.match(REGEX_LOCATION);
    if (match && !match[0].toLowerCase().includes("linkedin") && !match[0].toLowerCase().includes("github")) {
      locationMatch = match[0].trim();
      break;
    }
  }
  structuredData.personalInfo.location = locationMatch || "";

  // 5. Structure: Summary
  structuredData.summary = sectionContent.summary
    .map(line => line.trim())
    .filter(Boolean)
    .join(" ");

  // 6. Structure: Skills (Split on commas, semicolons, pipes, or bullets)
  const rawSkillsText = sectionContent.skills.join(" ");
  if (rawSkillsText) {
    const rawSkillsArray = rawSkillsText.split(/[,;\|•\-\*\+▪]/);
    const parsedSkills = new Set();
    
    for (const skill of rawSkillsArray) {
      const cleaned = cleanLine(skill);
      // Ensure it's not a header title and has appropriate length
      if (cleaned && cleaned.length > 1 && cleaned.length < 35 && !/skills|technologies/i.test(cleaned)) {
        parsedSkills.add(cleaned);
      }
    }
    structuredData.skills = Array.from(parsedSkills);
  }

  // 7. Structure: Array sections (Experience, Education, Projects, Certifications, Languages)
  const arraySections = ["experience", "education", "projects", "certifications", "languages"];
  
  for (const secKey of arraySections) {
    const rawLines = sectionContent[secKey];
    const structuredItems = [];
    let currentBlock = "";

    for (const rawLine of rawLines) {
      const cleaned = cleanLine(rawLine);
      if (!cleaned) continue;

      const isBulletOrHeaderStart = 
        rawLine.trim().startsWith("•") || 
        rawLine.trim().startsWith("-") || 
        rawLine.trim().startsWith("*") || 
        rawLine.trim().startsWith("+") || 
        /^\d+\./.test(rawLine.trim());

      // If it starts with a bullet point, push previous block and start new one
      if (isBulletOrHeaderStart) {
        if (currentBlock) {
          structuredItems.push(currentBlock.trim());
        }
        currentBlock = cleaned;
      } else {
        // Append to current block or start new block if empty
        if (currentBlock) {
          currentBlock += " " + cleaned;
        } else {
          currentBlock = cleaned;
        }
      }
    }

    if (currentBlock) {
      structuredItems.push(currentBlock.trim());
    }

    structuredData[secKey] = structuredItems;
  }

  console.log("[STRUCTURED PARSER]: Parsing complete. Summary of detected components:");
  console.log(` - Name: "${structuredData.personalInfo.name}"`);
  console.log(` - Email: "${structuredData.personalInfo.email}"`);
  console.log(` - Phone: "${structuredData.personalInfo.phone}"`);
  console.log(` - Location: "${structuredData.personalInfo.location}"`);
  console.log(` - Skills: ${structuredData.skills.length} items`);
  console.log(` - Experience: ${structuredData.experience.length} entries`);
  console.log(` - Education: ${structuredData.education.length} entries`);
  console.log(` - Projects: ${structuredData.projects.length} entries`);
  console.log(` - Certifications: ${structuredData.certifications.length} entries`);
  console.log(` - Languages: ${structuredData.languages.length} entries`);

  return structuredData;
}
