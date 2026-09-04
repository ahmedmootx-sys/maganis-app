/**
 * Sanitizes user input strings by trimming whitespace and stripping
 * non-printable ASCII/Unicode control characters (except standard newlines/tabs).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  let cleaned = ''
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    // Keep tab (9), newline (10), carriage return (13) and printable characters
    const isControl =
      (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      (code >= 127 && code <= 159)
    if (!isControl) {
      cleaned += input[i]
    }
  }
  return cleaned.trim()
}
