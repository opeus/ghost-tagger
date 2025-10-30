/**
 * Capitalize the first letter of each word in a tag
 * @param tag - The tag string to capitalize
 * @returns Capitalized tag string
 */
export function capitalizeTag(tag: string): string {
  return tag
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      // Keep acronyms and special cases like "MAT", "CEO", "SENCO" all caps
      if (word === word.toUpperCase() && word.length <= 5) {
        return word;
      }
      // Capitalize first letter, keep rest as-is for mixed case words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Capitalize an array of tags
 * @param tags - Array of tag strings
 * @returns Array of capitalized tags
 */
export function capitalizeTags(tags: string[]): string[] {
  return tags.map(capitalizeTag);
}
