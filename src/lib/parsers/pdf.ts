import { getDocumentProxy, extractText } from "unpdf";

/**
 * Extract plain text from a PDF buffer.
 * Returns the full text with pages merged.
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}
