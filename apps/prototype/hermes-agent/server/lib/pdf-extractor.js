import { readFileSync, writeFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

export async function extractPdfText(filePath) {
  try {
    const dataBuffer = readFileSync(filePath);
    const pdf = new PDFParse(dataBuffer);
    const text = await pdf.text();
    const pages = pdf.numPages;
    return {
      success: true,
      text,
      pages,
      info: {}
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
