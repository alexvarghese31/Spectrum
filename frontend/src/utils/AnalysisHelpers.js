import { STOPWORDS, ACTION_VERBS, BUZZWORDS, ACTION_VERB_SYNONYMS } from './constants';

// --- Other functions (checkAtsFriendliness, etc.) remain the same ---

// Define standard section headers that ATS systems look for.
const STANDARD_SECTIONS = {
  experience: [/experience/i, /employment history/i, /work history/i, /professional background/i],
  education: [/education/i, /academic background/i],
  skills: [/skills/i, /proficiencies/i, /technical skills/i],
};

/**
 * Checks for a comprehensive set of ATS (Applicant Tracking System) friendliness signals.
 * @param {object} result - The full analysis result from the backend.
 * @returns {object} An object containing a detailed breakdown of ATS-friendly checks.
 */
export function checkAtsFriendliness(result) {
  const { parsed_data, filename, raw_text } = result;
  const lowerCaseText = raw_text.toLowerCase();

  const checks = {
    'Has Complete Contact Info': !!(parsed_data.name && parsed_data.email && parsed_data.mobile_number),
    // FINAL FIX: This regex is now more robust to handle PDF parsing errors.
    'Includes LinkedIn Profile': /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?|(^|\s|\|)linkedin(\s|\||$)/.test(lowerCaseText),
    'Uses Standard File Format': filename.toLowerCase().endsWith('.pdf') || filename.toLowerCase().endsWith('.docx'),
    'Has Experience Section': STANDARD_SECTIONS.experience.some(regex => regex.test(lowerCaseText)),
    'Has Education Section': STANDARD_SECTIONS.education.some(regex => regex.test(lowerCaseText)),
    'Has Skills Section': STANDARD_SECTIONS.skills.some(regex => regex.test(lowerCaseText)),
  };

  return checks;
}

/**
 * Extracts and ranks the most common keywords from the resume text, ignoring stopwords.
 * @param {string} rawText - The full raw text of the resume.
 * @param {number} count - The number of top keywords to return.
 * @returns {Array<[string, number]>} An array of [keyword, frequency] pairs.
 */
export function getTopKeywords(rawText, count = 5) {
  const words = rawText.toLowerCase().match(/\b(\w+)\b/g) || [];
  const wordFrequencies = {};

  for (const word of words) {
    if (!STOPWORDS.has(word) && isNaN(word)) {
      wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
    }
  }

  return Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
}


/**
 * Counts the number of strong action verbs and returns the count and the list of found verbs.
 * @param {string} rawText - The full raw text of the resume.
 * @returns {{count: number, found: string[]}} An object with the total count and an array of unique verbs found.
 */
export function countActionVerbs(rawText) {
  let count = 0;
  const foundVerbs = new Set();
  const text = rawText.toLowerCase();

  for (const verb of ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
      foundVerbs.add(verb);
    }
  }
  return { count, found: Array.from(foundVerbs) };
}

/**
 * Checks the word count of the resume.
 * @param {string} rawText - The full raw text of the resume.
 * @returns {number} The total word count.
 */
export function checkResumeLength(rawText) {
  return (rawText.match(/\b(\w+)\b/g) || []).length;
}

/**
 * Finds any overused buzzwords or clichés in the resume text.
 * @param {string} rawText - The full raw text of the resume.
 * @returns {Array<string>} A list of buzzwords that were found.
 */
export function detectBuzzwords(rawText) {
  const found = new Set();
  const text = rawText.toLowerCase();
  for (const buzzword of BUZZWORDS) {
    if (text.includes(buzzword)) {
      found.add(buzzword);
    }
  }
  return Array.from(found);
}

/**
 * Calculates an overall score for the resume based on various metrics.
 * @param {object} result - The full analysis result object.
 * @returns {number} A score out of 10.
 */
export function calculateOverallScore(result) {
  let score = 0;
  const maxScore = 10;

  const atsChecks = checkAtsFriendliness(result);
  const wordCount = checkResumeLength(result.raw_text);
  const { count: actionVerbCount } = countActionVerbs(result.raw_text);
  const buzzwordsFound = detectBuzzwords(result.raw_text);
  const skillCount = result.parsed_data.skills?.length || 0;

  // ATS Friendliness & Structure (4 points)
  if (atsChecks['Has Complete Contact Info']) score += 1;
  if (atsChecks['Uses Standard File Format']) score += 1;
  if (atsChecks['Has Experience Section'] && atsChecks['Has Education Section'] && atsChecks['Has Skills Section']) score += 2;

  // Content Quality (4 points)
  if (wordCount >= 400 && wordCount <= 600) score += 1;
  if (actionVerbCount > 10) score += 1;
  if (actionVerbCount > 20) score += 1;
  if (buzzwordsFound.length <= 1) score += 1;

  // Skills Quantity (2 points)
  if (skillCount > 10) score += 1;
  if (skillCount > 20) score += 1;

  return Math.min(score, maxScore);
}

/**
 * NEW: Finds overused action verbs and suggests synonyms.
 * @param {string} rawText - The full raw text of the resume.
 * @returns {Array<{verb: string, count: number, suggestions: string[]}>} A list of objects for overused verbs.
 */
export function getVerbSuggestions(rawText) {
  const suggestions = [];
  const text = rawText.toLowerCase();
  const verbCounts = {};

  // First, count all occurrences of each verb
  for (const verb of ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      verbCounts[verb] = matches.length;
    }
  }

  // Now, find verbs used more than once that have synonyms
  for (const verb in verbCounts) {
    if (verbCounts[verb] > 1 && ACTION_VERB_SYNONYMS[verb]) {
      suggestions.push({
        verb: verb,
        count: verbCounts[verb],
        suggestions: ACTION_VERB_SYNONYMS[verb],
      });
    }
  }

  return suggestions;
}
