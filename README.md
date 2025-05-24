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

## 📃 Upcoming Features

  Organization Management Improvements

  1. Organization Categories/Tags: Implement a tagging system for organizations to group them by type (e.g., race tracks, racing clubs, event promoters).
  2. Organization Activity Dashboard: Create a dashboard showing each organization's recent scrapes, event counts, and update frequency.

  Event Management Improvements

  1. Bulk Event Actions: Allow bulk approval, rejection, or deletion of events to speed up the event management workflow.
  2. Calendar View: Add a calendar view for events to visualize the schedule and identify conflicts or gaps.
  3. Event Templates: Enable creation of event templates for recurring events to reduce manual data entry.
  4. Enhanced Event Details: Expand event data to include additional fields like:
    - Event type/category (track day, race, meetup)
    - Experience level requirements
    - Vehicle requirements
    - Registration deadline
    - Maximum participant count
    - Contact information
  5. Manual Event Creation: Add a clear way to manually create new events without running a scrape.
  6. Event Ownership Assignment: Allow assigning events to specific team members for review/management.
  7. Event History Log: Track all changes made to an event for audit purposes.
  8. Event Status Workflow: Implement a proper status workflow beyond just approved/pending (e.g., draft, pending review, approved, published, canceled).
  9. Event Duplicate Detection: Improve the fingerprinting system to better detect and handle duplicate events.
  10. Location Improvement: Implement proper geocoding for event locations instead of the current placeholder coordinates.

  Scraping Workflow Improvements

  1. Scheduled Scrapes: Allow scheduling recurring scrapes at specified intervals (daily, weekly, monthly).
  2. Scrape Progress Indicators: Add more detailed progress indicators during the scraping process.
  3. Scrape Templates: Create templates for different types of websites to improve scraping accuracy.
  4. Custom Selectors UI: Implement a visual UI for defining custom selectors for each source.
  5. AI Model Selection: Allow choosing different AI models for different sources based on content complexity.
  6. Failed Scrape Diagnostics: Enhance error reporting for failed scrapes with specific troubleshooting recommendations.
  7. Test Mode for Scrapes: Add a test mode to validate scrape settings without saving events.
  8. Batch Scraping: Enable running scrapes on multiple sources simultaneously.
  9. Scrape History Visualization: Create charts and graphs to visualize scrape performance over time.
  10. Fallback Strategies: Implement automatic fallback to different scrape strategies if the primary method fails.
  11. Intelligent Retry: Automatically retry failed scrapes with adjusted parameters.
  12. Selective Scraping: Allow targeting specific sections of a website for more accurate scraping.

  General User Experience Improvements

  1. User Roles and Permissions: Implement proper user roles to control access to different features.
  2. Customizable Dashboards: Allow users to customize their dashboard views based on their priorities.
  3. Email Notifications: Send notifications for important events (scrape completions, event changes).
  4. Export Capabilities: Add more export options for events (CSV, iCal, JSON, API).
  5. Activity Log: Implement a system-wide activity log for tracking changes.
  6. Guided Walkthroughs: Create interactive guided walkthroughs for new users.
  7. Search Enhancements: Improve search capabilities with filters for all entity types.
  8. Mobile Responsiveness: Enhance mobile experience for on-the-go management.
  9. Dark Mode: Implement a dark mode option for user preference.
  10. Keyboard Shortcuts: Add keyboard shortcuts for power users.
  11. Batch Operations: Allow batch operations throughout the system for efficiency.
  12. Onboarding Checklist: Create a checklist for new customers to guide them through setup.

  Integration and Data Improvements

  1. API Access: Create a dedicated API for third-party integrations.
  2. Calendar Integration: Add direct integration with Google Calendar, Outlook, etc.
  3. Social Media Publishing: Enable direct publishing of events to social media platforms.
  4. Webhook Support: Implement webhooks for real-time updates to external systems.

  6. Advanced Analytics: Add analytics on event trends, popular venues, etc.
  7. Event Enrichment: Automatically enrich event data with additional information from other sources.
  8. Image Processing: Enhance image processing capabilities for better logo and event image handling.
  9. Data Validation Rules: Allow setting custom validation rules for event data.
  10. Customer-Facing Widgets: Create embeddable widgets customers can add to their websites.

## 🤝 Contributing

Pull requests and suggestions welcome! Feel free to fork the project and submit issues or improvements.

## 📄 License

MIT License
```

---

Let me know if you’d like to include badges (build status, license, etc.), a logo, or usage examples.
