```markdown
# 🏁 GridSniffer

**AI-powered event scraper for track days, races, and motorsport meetups**

GridSniffer is an intelligent web scraping and ingestion system built to collect motorsport event data from even the messiest corners of the web. It’s designed for track day aggregators, race calendars, and driving enthusiast platforms that want structured event data from inconsistent, SEO-poor sources.

## 🚦 Features

- 📍 **Multi-source scraping** – Handles HTML, PDFs, images, and CSS-based calendars
- 🤖 **AI-Powered Interpretation** – Uses Deepseek to extract event info from raw content
- ✅ **Zod Validation** – Ensures structured output with clean JSON formats
- 🧠 **OCR Support** – Screenshots and scanned image text parsing using Tesseract.js
- 🌐 **Headless Browser Rendering** – Screenshots complex or JavaScript-heavy pages
- 🛠️ **Admin Dashboard** – Easily manage sources and trigger scraping jobs
- 💾 **MongoDB Storage** – Cleanly stores event data for downstream use

## 📄 Output Format

```ts
{
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  price?: string;
  sourceURL: string;
  scrapedAt: string;
}
```

## 🧰 Tech Stack

- **Framework**: Next.js
- **Styling**: DaisyUI + TailwindCSS
- **Database**: MongoDB (via Mongoose)
- **AI**: Deepseek API
- **Validation**: Zod
- **OCR**: Tesseract.js
- **Headless Browser**: Puppeteer

## 🎯 Use Cases

- Track day aggregators
- Motorsport event calendars
- Driving community platforms
- AI-based calendar sync tools

## 📦 Installation

```bash
git clone https://github.com/yourusername/GridSniffer.git
cd GridSniffer
npm install
```

Create a `.env.local` file and add:

```env
MONGODB_URI=your_mongodb_connection_string
DEEPSEEK_API_KEY=your_deepseek_api_key
```

Then run the dev server:

```bash
npm run dev
```

## 🤝 Contributing

Pull requests and suggestions welcome! Feel free to fork the project and submit issues or improvements.

## 📄 License

MIT License
```

---

Let me know if you’d like to include badges (build status, license, etc.), a logo, or usage examples.
