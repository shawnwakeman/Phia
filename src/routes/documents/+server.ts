import fetch from 'node-fetch';
import cheerio from 'cheerio';

export async function GET({ request }) {
    // Extract URL from query params
    const urlParam = new URL(request.url).searchParams.get('url');
    
    if (!urlParam) {
      return new Response(JSON.stringify({ success: 0, error: 'No URL provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  
    try {
      // Here you would fetch the URL metadata. This example assumes a function `fetchLinkMetadata` that does this.
      const metadata = await fetchLinkMetadata(urlParam);
  
      // Respond with success, the fetched metadata, and optionally return a link to set the hyperlink URL
      return new Response(JSON.stringify({
        success: 1,
        link: urlParam, // Optionally return the original link or a modified version
        meta: metadata
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Respond with an error if something goes wrong
      return new Response(JSON.stringify({ success: 0, error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
// Mock function to represent fetching link metadata
// Replace this with your actual implementation
async function fetchLinkMetadata(url: string) {
    try {
      // Fetch the webpage content
      const response = await fetch(url);
      const html = await response.text();
  
      // Load the HTML into cheerio
      const $ = cheerio.load(html);
  
      // Extract metadata
      const title = $('title').first().text();
      const description = $('meta[name="description"]').attr('content');
      const image = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');
  
      return {
        title,
        description,
        image: { url: image }
      };
    } catch (error) {
      console.error(`Error fetching metadata for ${url}:`, error);
      throw new Error('Failed to fetch link metadata');
    }
  }
