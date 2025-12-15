import { StatementTemplate, Transaction } from "../domain/statement.entity.js";

export class TemplateExtractorService {
  extract(pdfData: any): StatementTemplate {
    // This is a heuristic-based extraction.
    // Real implementation would be much more complex involving identifying tables.
    // For now, we will just return a mock or try to find some text.

    // We need to traverse the Texts in the Pages
    const pages = pdfData.formImage.Pages;
    const texts: any[] = [];

    pages.forEach((page: any) => {
      if (page.Texts) {
        page.Texts.forEach((text: any) => {
          // Decode URI component because pdf2json encodes text
          const decoded = decodeURIComponent(text.R[0].T);
          texts.push({
            x: text.x,
            y: text.y,
            text: decoded,
            style: text.R[0].S,
          });
        });
      }
    });

    // TODO: Implement actual logic to finding 'Date', 'Description', 'Amount' headers
    // and parsing rows below them.

    console.log("Extracted texts:", texts.slice(0, 10)); // Debug log

    return {
      transactions: [],
      initialBalance: 0,
    };
  }
}
