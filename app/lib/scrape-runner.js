import axios from 'axios';

// 🔧 Main dispatcher
export async function runScrape(website) {
  const { url, scrapeStrategy } = website;

  switch (scrapeStrategy) {
    case 'generic_ai':
      return await handleGenericHTML(url);
    case 'pdf':
      return await handlePDF(url);
    case 'image':
      return await handleImage(url);
    case 'css_calendar':
      return await handleCSSCalendar(url);
    default:
      throw new Error(`Unknown scrape strategy: ${scrapeStrategy}`);
  }
}
