// src/lib/validators.js

/**
 * Standard URL validator
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/**
 * Validator for usernames / handles
 * GitHub: alphanumeric, single hyphens, max 39 chars
 * LeetCode / HackerRank / Codeforces: alphanumeric, underscores, hyphens
 */
export function isValidHandle(handle) {
  if (!handle) return false;
  // Handle should be alphanumeric with occasional hyphens or underscores
  const regex = /^[a-zA-Z0-9_-]{1,50}$/;
  return regex.test(handle);
}

/**
 * Validator for international phone numbers
 */
export function isValidPhone(phone) {
  if (!phone) return true; // optional
  const regex = /^\+?[0-9\s\-()]{7,20}$/;
  return regex.test(phone);
}

/**
 * Validates a profile update payload.
 * Returns { isValid: boolean, errors: string[] }
 */
export function validateProfileData(data) {
  const errors = [];

  // 1. Required fields checks (if they are provided)
  if (data.phone !== undefined && data.phone !== null && data.phone !== "") {
    if (!isValidPhone(data.phone)) {
      errors.push("Invalid phone number format. Use standard international formatting (e.g. +1 555-0199).");
    }
  }

  // 2. Validate URLs and handles
  const socialConfigs = [
    { key: "linkedinUrl", label: "LinkedIn", requiredDomain: "linkedin.com" },
    { key: "githubUrl", label: "GitHub", requiredDomain: "github.com" },
    { key: "portfolioUrl", label: "Portfolio", requiredDomain: null },
    { key: "leetcodeUrl", label: "LeetCode", requiredDomain: "leetcode.com" },
    { key: "hackerrankUrl", label: "HackerRank", requiredDomain: "hackerrank.com" },
    { key: "codeforcesUrl", label: "Codeforces", requiredDomain: "codeforces.com" },
    { key: "twitterUrl", label: "Twitter", requiredDomain: "x.com" },
    { key: "mediumUrl", label: "Medium", requiredDomain: "medium.com" },
  ];

  socialConfigs.forEach(({ key, label, requiredDomain }) => {
    const val = data[key];
    if (val !== undefined && val !== null && val !== "") {
      if (isValidUrl(val)) {
        if (requiredDomain && !val.toLowerCase().includes(requiredDomain)) {
          errors.push(`${label} link must be a valid URL pointing to ${requiredDomain}.`);
        }
      } else {
        // If not a URL, it must be a valid handle
        const handle = val.replace(/^@/, ""); // strip leading @ if any
        if (!isValidHandle(handle)) {
          errors.push(`Invalid ${label} profile handle or URL format.`);
        }
      }
    }
  });

  // 3. Timezone check
  if (data.timezone !== undefined && data.timezone !== null && data.timezone !== "") {
    const validTimezones = ["UTC", "EST", "PST", "IST", "CET"];
    if (!validTimezones.includes(data.timezone)) {
      errors.push("Invalid timezone selection. Must be one of: UTC, EST, PST, IST, CET.");
    }
  }

  // 4. Duplicate skills check
  if (data.skills && typeof data.skills === "object") {
    Object.entries(data.skills).forEach(([category, list]) => {
      if (Array.isArray(list)) {
        const normalized = list.map(s => String(s).trim().toLowerCase());
        const duplicates = normalized.filter((item, index) => normalized.indexOf(item) !== index);
        if (duplicates.length > 0) {
          errors.push(`Duplicate skills detected in category '${category}': ${[...new Set(duplicates)].join(", ")}`);
        }
      }
    });
  }

  // 5. Duplicate projects check
  if (data.projects && Array.isArray(data.projects)) {
    const names = data.projects.map(p => String(p.name || "").trim().toLowerCase()).filter(Boolean);
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate project names detected: ${[...new Set(duplicates)].join(", ")}`);
    }
  }

  // 6. Dates check
  if (data.dob !== undefined && data.dob !== null && data.dob !== "") {
    if (isNaN(Date.parse(data.dob))) {
      errors.push("Invalid Date of Birth format.");
    }
  }

  if (data.experience && Array.isArray(data.experience)) {
    data.experience.forEach((exp, idx) => {
      if (!exp.company || !exp.role) {
        errors.push(`Work experience item #${idx + 1} is missing company or role.`);
      }
      if (exp.startDate && isNaN(Date.parse(exp.startDate))) {
        errors.push(`Invalid start date format for work experience at ${exp.company || "item " + (idx + 1)}.`);
      }
      if (exp.endDate && !exp.currentJob && isNaN(Date.parse(exp.endDate))) {
        errors.push(`Invalid end date format for work experience at ${exp.company || "item " + (idx + 1)}.`);
      }
    });
  }

  if (data.education && Array.isArray(data.education)) {
    data.education.forEach((edu, idx) => {
      if (!edu.college || !edu.degree) {
        errors.push(`Education item #${idx + 1} is missing college or degree.`);
      }
      if (edu.startYear && isNaN(parseInt(edu.startYear, 10))) {
        errors.push(`Invalid start year format for education at ${edu.college || "item " + (idx + 1)}.`);
      }
      if (edu.endYear && isNaN(parseInt(edu.endYear, 10))) {
        errors.push(`Invalid end year format for education at ${edu.college || "item " + (idx + 1)}.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
