import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF file
 * @param {string} filePath
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    // Read file
    const buffer = await fs.readFile(filePath);

    // Convert Buffer → Uint8Array (IMPORTANT)
    const uint8Array = new Uint8Array(buffer);

    // Parse PDF
    const data = new PDFParse(uint8Array);

    const textResult = await data.getText();
    const pageCount = await data.getInfo({ parsePageInfo: true });

    return {
      text: textResult.text || "",
      numPages: pageCount.total || 0,
      info: pageCount,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
