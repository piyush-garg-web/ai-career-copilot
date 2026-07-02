import mammoth from "mammoth";

/**
 * Extract plain text from a DOCX document buffer.
 * @param {Buffer} buffer - The DOCX file binary buffer.
 * @returns {Promise<string>} - The extracted plain text content.
 */
export async function parseDocx(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty or null document buffer.");
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || typeof result.value !== "string") {
      throw new Error("Extracted DOCX data is empty or invalid.");
    }

    const trimmedText = result.value.trim();
    if (!trimmedText) {
      throw new Error("No readable text content could be extracted from this Word document.");
    }

    return trimmedText;
  } catch (error) {
    throw new Error(`DOCX Parser Error: ${error.message}`);
  }
}
