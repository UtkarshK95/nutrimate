/**
 * Splits text into overlapping chunks.
 *
 * Token approximation: 1 token ≈ 4 characters (conservative estimate).
 * Target: ~400 tokens per chunk, 50-token overlap.
 */

const CHUNK_SIZE_CHARS = 400 * 4; // 1600 chars ≈ 400 tokens
const OVERLAP_CHARS = 50 * 4; // 200 chars ≈ 50 tokens

export function chunkText(text: string): string[] {
  // Normalise whitespace
  const normalised = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (normalised.length === 0) return [];
  if (normalised.length <= CHUNK_SIZE_CHARS) return [normalised];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalised.length) {
    let end = start + CHUNK_SIZE_CHARS;

    if (end < normalised.length) {
      // Try to break at a paragraph boundary first
      const paraBreak = normalised.lastIndexOf("\n\n", end);
      if (paraBreak > start + CHUNK_SIZE_CHARS / 2) {
        end = paraBreak;
      } else {
        // Fall back to sentence boundary (period/exclamation/question + space)
        const sentenceBreak = normalised.search(
          new RegExp(`[.!?]\\s`, "g") // rough search from `end` backwards
        );
        // Simple backwards scan for sentence end
        let s = end;
        while (s > start + CHUNK_SIZE_CHARS / 2) {
          if (/[.!?]/.test(normalised[s]) && /\s/.test(normalised[s + 1] ?? " ")) {
            end = s + 1;
            break;
          }
          s--;
        }
        void sentenceBreak; // unused — kept for clarity of intent
      }
    }

    chunks.push(normalised.slice(start, end).trim());
    start = end - OVERLAP_CHARS;
    if (start < 0) start = 0;
  }

  return chunks.filter((c) => c.length > 0);
}
