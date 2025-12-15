import fs from "fs";
import PDFParser from "pdf2json";

export class PdfParserService {
  async parse(filePath: string): Promise<any> {
    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(errData.parserError)
      );
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfData);
      });

      pdfParser.loadPDF(filePath);
    });
  }
}
