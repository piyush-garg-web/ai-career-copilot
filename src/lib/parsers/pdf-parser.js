import pdfParse from "pdf-parse";

/**
 * Extract plain text from a PDF document buffer.
 * @param {Buffer} buffer - The PDF file binary buffer.
 * @returns {Promise<string>} - The extracted plain text content.
 */
export async function parsePdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty or null document buffer.");
  }

  try {
    const data = await pdfParse(buffer);
    
    if (!data || typeof data.text !== "string") {
      throw new Error("Extracted PDF data is empty or invalid.");
    }

    const trimmedText = data.text.trim();
    if (!trimmedText) {
      throw new Error("No readable text content could be extracted from this PDF.");
    }

    return trimmedText;
  } catch (error) {
    throw new Error(`PDF Parser Error: ${error.message}`);
  }
}
