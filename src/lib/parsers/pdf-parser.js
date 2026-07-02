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
    // Load pdf-parse using CommonJS require inside execution scope to avoid Webpack compilation warnings
    const pdf = require("pdf-parse");
    const PDFParse = pdf.PDFParse;
    
    if (typeof PDFParse !== "function") {
      throw new Error("Could not locate the PDFParse class constructor in the pdf-parse package exports.");
    }

    // Instantiate and extract text using pdf-parse v2 API
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    
    if (!result || typeof result.text !== "string") {
      throw new Error("Extracted PDF data is empty or invalid.");
    }

    const trimmedText = result.text.trim();
    if (!trimmedText) {
      throw new Error("No readable text content could be extracted from this PDF.");
    }

    return trimmedText;
  } catch (error) {
    throw new Error(`PDF Parser Error: ${error.message}`);
  }
}
