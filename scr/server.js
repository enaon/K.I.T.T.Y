const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

const youtubeLinks = [];

// Regular expression to match YouTube links
const youtubeLinkRegex = /https:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v=)))([\w-]{11})(?:[\w-]+)?/g;

// Function to extract YouTube links from text content
function extractYoutubeLinks(text) {
  let match;
  while ((match = youtubeLinkRegex.exec(text)) !== null) {
    youtubeLinks.push({ link: match[0], username: getUsername(text) });
  }
}

// Function to get the username from the HTML content
function getUsername(html) {
  const usernameRegex = /<a href="[^"]*memberlist\.php\?mode=viewprofile[^"]*"[^>]*>([^<]*)</;
  const match = html.match(usernameRegex);
  return match ? match[1] : 'Unknown User';
}

// Function to scrape the current page
async function scrapePage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract text content from all text nodes
    $('body').contents().each((index, element) => {
      if (element.nodeType === 3) { // Node.TEXT_NODE
        extractYoutubeLinks($(element).text());
      }
    });

    // Extract YouTube links from iframes
    $('iframe').each((index, iframe) => {
      const src = $(iframe).attr('src');
      if (src && src.includes('youtube.com')) {
        const postBody = $(iframe).closest('.postbody');
        if (postBody.length) {
          youtubeLinks.push({ link: src, username: getUsername(postBody.html()) });
        } else {
          youtubeLinks.push({ link: src, username: 'Unknown User' });
        }
      }
    });

    console.log(`Finished scraping page: ${url}`);
    console.log(`Current YouTube links: ${youtubeLinks.map(link => link.link).join(', ')}`);
  } catch (error) {
    console.error(`Error scraping page: ${url}`, error);
  }
}

// Function to get the next page URL
function getNextPageUrl($) {
  const nextPageLink = $('.pagination .arrow.next a');
  return nextPageLink.length ? nextPageLink.attr('href') : null;
}

// Function to scrape all pages starting from a given URL
async function scrapeAllPages(startUrl) {
  let currentUrl = startUrl;
  while (currentUrl) {
    await scrapePage(currentUrl);
    const { data } = await axios.get(currentUrl);
    const $ = cheerio.load(data);
    currentUrl = getNextPageUrl($);
  }

  if (youtubeLinks.length > 0) {
    const playlistContent = youtubeLinks.map((item, index) => {
      const watchLink = item.link.replace('/embed/', '/watch?v=');
      return `${index + 1}. ${watchLink} (${item.username})`;
    }).join('\n');

    return playlistContent;
  } else {
    return 'No YouTube links found in the forum thread.';
  }
}

app.get('/scrape', async (req, res) => {
  const startUrl = req.query.url;
  if (!startUrl) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const playlistContent = await scrapeAllPages(startUrl);
    res.set('Content-Type', 'text/plain');
    res.send(playlistContent);
  } catch (error) {
    res.status(500).send('Error occurred while scraping');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});