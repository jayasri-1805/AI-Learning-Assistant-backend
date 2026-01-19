import fs from "fs/promises";
import * as pdfParse from "pdf-parse";


/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new pdfParse(new Uint8Array(dataBuffer));

        const data = await parser.getText();;

        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};


