import axios from 'axios';
import { z } from 'zod';
const { convert } = require('html-to-text');

// Zod schema to validate extracted event data
const EventSchema = z.object({
    eventName: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    price: z.string().optional(),
});

const EventArraySchema = z.object({
    events: z.array(EventSchema), // Array of event objects
});

// Main entry point for scraping a website based on strategy
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

// Scrape basic HTML and use Deepseek to extract event data
async function handleGenericHTML(url) {
    const html = await fetchHTML(url);
    const deepseekResponse = await callDeepSeekTextEvents(convert(html));

    // Validate the entire response object
    const result = EventArraySchema.safeParse(deepseekResponse);

    if (!result.success) {
        console.error('Validation errors:', result.error.errors); // Log detailed validation errors
        throw new Error('Invalid event structure returned by Deepseek');
    }

    return {
        message: `Parsed ${result.data.events.length} events`,
        events: result.data.events,
    };
}

// Fetch HTML from target URL
async function fetchHTML(url) {
    const res = await axios.get(url);
    return res.data;
}

// Call Deepseek AI with a specific prompt for extracting track day events
async function callDeepSeekTextEvents(text) {
    try {
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",  // Use the latest available model
                messages: [
                    { role: "system", content: "You are an AI that extracts motorsport event listings from a provided text." },
                    {
                        role: "user", content: `${text}
                        Return JSON of structured events in the format:
                        {
                        events: [
                            {
                                "eventName": string,
                                "startDate": string,
                                "endDate": string,
                                "location": string,
                                "price": string (optional)
                            }
                        ]}`
                    }
                ],
                // max_tokens: 1500,
                temperature: 1.0,
                response_format: {
                    'type': 'json_object'
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Parse the response content if it's a string
        const data = JSON.parse(response.data.choices[0].message.content);
        console.log('Parsed Deepseek Response:', data); // Log the parsed response
        return data;
    } catch (error) {
        console.error("Error calling DeepSeek:", error.response?.data || error.message);
        return {}; // Return an empty object to avoid undefined errors
    }
}

// Placeholders for other strategies
async function handlePDF(url) {
    throw new Error('PDF scraping not implemented yet.');
}

async function handleImage(url) {
    throw new Error('Image scraping not implemented yet.');
}

async function handleCSSCalendar(url) {
    throw new Error('CSS calendar scraping not implemented yet.');
}
