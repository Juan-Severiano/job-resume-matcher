// Minimum keyword density threshold (percentage)
export const MIN_KEYWORD_DENSITY = 1.0;

// Maximum keyword density threshold (percentage)
export const MAX_KEYWORD_DENSITY = 5.0;

export function calculateKeywordDensity(text: string, keyword: string): number {
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
  const matches = words.filter(word => word.includes(normalizedKeyword)).length;
  
  if (words.length === 0) return 0;
  
  return (matches / words.length) * 100;
}

