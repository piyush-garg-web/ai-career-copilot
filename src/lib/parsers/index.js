import { parsePdf } from "./pdf-parser";
import { parseDocx } from "./docx-parser";
export { parseStructuredResume } from "./structured-parser";

/**
 * Extract plain text from a resume document buffer based on file format.
 * @param {Buffer} buffer - The file binary buffer.
 * @param {string} fileType - The format type, either 'PDF' or 'DOCX'.
 * @returns {Promise<string>} - The extracted plain text content.
 */
export async function parseResumeText(buffer, fileType) {
  const type = fileType.toUpperCase();
  if (type === "PDF") {
    return await parsePdf(buffer);
  } else if (type === "DOCX") {
    return await parseDocx(buffer);
  } else {
    throw new Error(`Unsupported document format: ${fileType}. Only PDF and DOCX formats are supported.`);
  }
}
