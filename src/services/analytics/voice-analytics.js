// src/services/analytics/voice-analytics.js

/**
 * Voice Analytics Processing Service
 * Processes speech data to extract metrics like speaking speed, pauses, filler words, etc.
 */

/**
 * Calculate speaking speed in words per minute
 * @param {string} text - The spoken text
 * @param {number} durationSeconds - Duration of speech in seconds
 * @returns {number} - Words per minute
 */
export function calculateSpeakingSpeed(text, durationSeconds) {
  if (!text || durationSeconds <= 0) return 0;
  
  const wordCount = text.trim().split(/\s+/).length;
  const durationMinutes = durationSeconds / 60;
  
  if (durationMinutes <= 0) return 0;
  
  return Math.round(wordCount / durationMinutes);
}

/**
 * Calculate average pause duration
 * @param {Array<number>} pauseDurations - Array of pause durations in seconds
 * @returns {number} - Average pause in seconds
 */
export function calculateAveragePause(pauseDurations) {
  if (!pauseDurations || pauseDurations.length === 0) return 0;
  
  const sum = pauseDurations.reduce((acc, pause) => acc + pause, 0);
  return Math.round((sum / pauseDurations.length) * 100) / 100;
}

/**
 * Find longest pause
 * @param {Array<number>} pauseDurations - Array of pause durations in seconds
 * @returns {number} - Longest pause in seconds
 */
export function findLongestPause(pauseDurations) {
  if (!pauseDurations || pauseDurations.length === 0) return 0;
  
  return Math.max(...pauseDurations);
}

/**
 * Calculate response time (time from question end to answer start)
 * @param {number} questionEndTime - Timestamp when question ended
 * @param {number} answerStartTime - Timestamp when answer started
 * @returns {number} - Response time in seconds
 */
export function calculateResponseTime(questionEndTime, answerStartTime) {
  if (!questionEndTime || !answerStartTime) return 0;
  
  const responseTime = (answerStartTime - questionEndTime) / 1000; // Convert ms to seconds
  return Math.round(responseTime * 100) / 100;
}

/**
 * Detect filler words in speech
 * @param {string} text - The spoken text
 * @param {string} language - Language code (default: 'en')
 * @returns {Array<string>} - Array of filler words found
 */
export function detectFillerWords(text, language = 'en') {
  if (!text) return [];
  
  const fillerWordSets = {
    en: ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of', 'kind of'],
    es: ['eh', 'um', 'o sea', 'tipo', 'como', 'bueno'],
    fr: ['euh', 'ben', 'en fait', 'quoi', 'voilà'],
    de: ['äh', 'hm', 'also', 'eigentlich', 'sozusagen'],
    hi: [' matlab', 'ki', 'toh', 'bas', 'actually', 'like'],
  };
  
  const fillerWords = fillerWordSets[language] || fillerWordSets.en;
  const lowerText = text.toLowerCase();
  
  const foundFillers = [];
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      foundFillers.push(filler);
    }
  });
  
  return [...new Set(foundFillers)]; // Remove duplicates
}

/**
 * Calculate grammar score based on common errors
 * @param {string} text - The spoken text
 * @returns {number} - Grammar score (0-100)
 */
export function calculateGrammarScore(text) {
  if (!text) return 80; // Default score
  
  let score = 100;
  const lowerText = text.toLowerCase();
  
  // Common grammar issues (simplified)
  const grammarIssues = [
    { pattern: /\bme and\b/gi, penalty: 5 },
    { pattern: /\bain't\b/gi, penalty: 3 },
    { pattern: /\bdon't\b/gi, penalty: 2 },
    { pattern: /\bwon't\b/gi, penalty: 2 },
    { pattern: /\bcan't\b/gi, penalty: 2 },
    { pattern: /\bshould of\b/gi, penalty: 10 },
    { pattern: /\bwould of\b/gi, penalty: 10 },
    { pattern: /\bcould of\b/gi, penalty: 10 },
    { pattern: /\btheir\b.*?\bthere\b/gi, penalty: 5 },
    { pattern: /\bits\b.*?\bit's\b/gi, penalty: 5 },
  ];
  
  grammarIssues.forEach(issue => {
    const matches = lowerText.match(issue.pattern);
    if (matches) {
      score -= (matches.length * issue.penalty);
    }
  });
  
  // Check for sentence structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    const avgSentenceLength = text.length / sentences.length;
    if (avgSentenceLength < 10) score -= 10; // Too short
    if (avgSentenceLength > 100) score -= 5; // Too long
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate vocabulary diversity score
 * @param {string} text - The spoken text
 * @returns {number} - Vocabulary score (0-100)
 */
export function calculateVocabularyScore(text) {
  if (!text) return 80;
  
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  if (words.length === 0) return 50;
  
  const uniqueWords = new Set(words);
  const diversityRatio = uniqueWords.size / words.length;
  
  // Base score from diversity
  let score = Math.round(diversityRatio * 100);
  
  // Bonus for longer words
  const longWords = words.filter(w => w.length > 6).length;
  const longWordRatio = longWords / words.length;
  score += Math.round(longWordRatio * 20);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate confidence score based on speech patterns
 * @param {string} text - The spoken text
 * @param {number} fillerWordCount - Number of filler words
 * @param {number} pauseCount - Number of pauses
 * @returns {number} - Confidence score (0-100)
 */
export function calculateConfidenceScore(text, fillerWordCount, pauseCount) {
  if (!text) return 70;
  
  let score = 100;
  
  // Penalty for filler words
  const wordCount = text.split(/\s+/).length;
  const fillerRatio = fillerWordCount / Math.max(1, wordCount);
  score -= Math.round(fillerRatio * 30);
  
  // Penalty for excessive pauses
  const pauseRatio = pauseCount / Math.max(1, wordCount);
  score -= Math.round(pauseRatio * 20);
  
  // Penalty for hesitation markers
  const hesitationMarkers = (text.match(/\b(i think|i guess|i suppose|maybe|perhaps)\b/gi) || []).length;
  score -= hesitationMarkers * 3;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate fluencyscore
 * @param {number} speakingSpeed - Words per minute
 * @param {number} averagePause - Average pause in seconds
 * @param {number} fillerWordCount - Number of filler words
 * @param {number} totalWords - Total word count
 * @returns {number} - Fluency score (0-100)
 */
export function calculateFluencyScore(speakingSpeed, averagePause, fillerWordCount, totalWords) {
  let score = 100;
  
  // Ideal speaking speed: 120-150 WPM
  if (speakingSpeed < 100) score -= 15;
  else if (speakingSpeed < 120) score -= 5;
  else if (speakingSpeed > 180) score -= 10;
  
  // Ideal average pause: 0.5-1.5 seconds
  if (averagePause > 2) score -= 15;
  else if (averagePause > 1.5) score -= 5;
  
  // Penalty for filler words
  const fillerRatio = fillerWordCount / Math.max(1, totalWords);
  score -= Math.round(fillerRatio * 25);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate communication score
 * @param {string} text - The spoken text
 * @param {number} grammarScore - Grammar score
 * @param {number} vocabularyScore - Vocabulary score
 * @param {number} fluencyScore - Fluency score
 * @returns {number} - Communication score (0-100)
 */
export function calculateCommunicationScore(text, grammarScore, vocabularyScore, fluencyScore) {
  // Weighted average
  const weights = {
    grammar: 0.25,
    vocabulary: 0.25,
    fluency: 0.30,
    structure: 0.20,
  };
  
  // Structure score based on sentence organization
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let structureScore = 80;
  if (sentences.length > 0) {
    const avgLength = text.length / sentences.length;
    if (avgLength > 20 && avgLength < 80) structureScore = 95;
    else if (avgLength > 10 && avgLength < 100) structureScore = 85;
  }
  
  const communicationScore = Math.round(
    (grammarScore * weights.grammar) +
    (vocabularyScore * weights.vocabulary) +
    (fluencyScore * weights.fluency) +
    (structureScore * weights.structure)
  );
  
  return Math.max(0, Math.min(100, communicationScore));
}

/**
 * Calculate technical accuracy score (placeholder - would need domain-specific analysis)
 * @param {string} text - The spoken text
 * @param {Array<string>} technicalKeywords - Expected technical keywords
 * @returns {number} - Technical score (0-100)
 */
export function calculateTechnicalScore(text, technicalKeywords = []) {
  if (!text) return 70;
  
  if (technicalKeywords.length === 0) return 80; // Default if no keywords provided
  
  const lowerText = text.toLowerCase();
  let matchedKeywords = 0;
  
  technicalKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedKeywords++;
    }
  });
  
  const matchRatio = matchedKeywords / technicalKeywords.length;
  return Math.round(matchRatio * 100);
}

/**
 * Calculate completeness score
 * @param {string} text - The spoken text
 * @param {number} expectedLength - Expected minimum word count
 * @returns {number} - Completeness score (0-100)
 */
export function calculateCompletenessScore(text, expectedLength = 20) {
  if (!text) return 0;
  
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount >= expectedLength) return 100;
  
  return Math.round((wordCount / expectedLength) * 100);
}

/**
 * Calculate professionalism score
 * @param {string} text - The spoken text
 * @returns {number} - Professionalism score (0-100)
 */
export function calculateProfessionalismScore(text) {
  if (!text) return 70;
  
  let score = 100;
  const lowerText = text.toLowerCase();
  
  // Unprofessional phrases
  const unprofessionalPhrases = [
    'whatever', 'cool', 'awesome', 'like totally',
    'no way', 'seriously', 'honestly', 'literally'
  ];
  
  unprofessionalPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      score -= 5;
    }
  });
  
  // Professional indicators
  const professionalIndicators = [
    'experience', 'developed', 'implemented', 'achieved',
    'managed', 'led', 'created', 'designed'
  ];
  
  professionalIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      score += 3;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Process complete voice analytics from speech data
 * @param {Object} data - Speech data including text, duration, pauses, etc.
 * @param {string} language - Language code
 * @param {Array<string>} technicalKeywords - Expected technical keywords
 * @returns {Object} - Complete analytics object
 */
export function processVoiceAnalytics(data, language = 'en', technicalKeywords = []) {
  const {
    text,
    durationSeconds,
    pauseDurations = [],
    questionEndTime,
    answerStartTime,
  } = data;
  
  const fillerWords = detectFillerWords(text, language);
  const wordCount = text.split(/\s+/).length;
  
  const analytics = {
    speakingSpeed: calculateSpeakingSpeed(text, durationSeconds),
    wordsPerMinute: calculateSpeakingSpeed(text, durationSeconds),
    avgPause: calculateAveragePause(pauseDurations),
    longestPause: findLongestPause(pauseDurations),
    responseTime: calculateResponseTime(questionEndTime, answerStartTime),
    thinkingTime: calculateResponseTime(questionEndTime, answerStartTime),
    fillerWords: fillerWords,
    grammarScore: calculateGrammarScore(text),
    vocabularyScore: calculateVocabularyScore(text),
    communicationScore: 0, // Will be calculated after other scores
    technicalScore: calculateTechnicalScore(text, technicalKeywords),
    confidenceScore: calculateConfidenceScore(text, fillerWords.length, pauseDurations.length),
    speechAccuracy: 0.9, // Placeholder - would come from STT confidence
    fluency: calculateFluencyScore(
      calculateSpeakingSpeed(text, durationSeconds),
      calculateAveragePause(pauseDurations),
      fillerWords.length,
      wordCount
    ),
    completeness: calculateCompletenessScore(text),
    professionalism: calculateProfessionalismScore(text),
  };
  
  // Calculate communication score after other scores are available
  analytics.communicationScore = calculateCommunicationScore(
    text,
    analytics.grammarScore,
    analytics.vocabularyScore,
    analytics.fluency
  );
  
  return analytics;
}
