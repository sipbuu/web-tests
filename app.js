const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cheerio = require("cheerio")
const app = express();
const port = 3000;
const axios = require('axios');

async function fetchLyrics(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Select the elements within '#lyrics-root' that start with class 'Lyrics__Container'
        const lyricsContainers = $('#lyrics-root').find('[class^="Lyrics__Container"]');

        let lyricsArray = [];

        // Iterate over each lyrics container
        lyricsContainers.each((index, element) => {
            const $element = $(element);

            // Initialize an array to hold lines from this container
            let containerLines = [];

            // Iterate over the child nodes of the element
            $element.contents().each((i, el) => {
                if (el.type === 'text') {
                    // If it's a text node, add the text
                    const text = $(el).text().trim();
                    if (text) {
                        containerLines.push({ line: text });
                    }
                } else if (el.name === 'br') {
                    // If it's a <br> tag, it represents a line break
                    // We can optionally add an empty line or skip
                } else if (el.type === 'tag') {
                    // If it's an element node (e.g., <a>, <span>, etc.)
                    const text = $(el).text().trim();
                    if (text) {
                        containerLines.push({ line: text });
                    }
                }
            });

            // Add the lines from this container to the main lyrics array
            lyricsArray = lyricsArray.concat(containerLines);
        });

        // Filter out any empty lines
        lyricsArray = lyricsArray.filter(item => item.line.trim() !== '');

        console.log(lyricsArray);  // For debugging
        return lyricsArray;
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return [];
    }
}



/*
app.get('/api/lyrics', async (req, res) => {
    const { url } = req.query;

    // Ensure a URL is provided
    if (!url) {
        return res.status(400).send('Error: URL is required');
    }

    // Fetch the lyrics from the provided URL
    const lyrics = await fetchLyrics(url);

    // If lyrics are fetched successfully, send them as the response
    if (lyrics) {
        res.json({ lyrics });
    } else {
        res.status(500).send('Error: Could not fetch lyrics');
    }
});
*/
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/search', async (req, res) => {
    const { tags, limit, token, username } = req.query;
    if (!tags) {
      return res.status(400).json({ error: 'Tags are required' });
    }
  
    try {
      let response;
      if (token && username) {
        console.log(username)
        console.log(`${username}:${token}`)
        response = await fetch(`https://e621.net/posts.json?tags=${encodeURIComponent(tags)}&limit=${encodeURIComponent(limit)}&login=${encodeURIComponent(username)}&api_key=${encodeURIComponent(token)}`, {
            headers: {
              'User-Agent': 'fetch/1.0 (by dyonxia on e621)',
              'Accept': 'application/json',
            },
        });
      } else {
        response = await fetch(`https://e621.net/posts.json?tags=${encodeURIComponent(tags)}&limit=${encodeURIComponent(limit)}`, {
            headers: {
            'User-Agent': 'fetch/1.0 (by dyonxia on e621)',
            'Accept': 'application/json',
            },
        });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data from e621' });
    }
  });

  
app.get('/api/lyrics', async (req, res) => {
    const { path } = req.query; // Get the 'path' parameter from the request query

    if (!path) {
        return res.status(400).send('Error: Genius path is required'); // Send error if no path is provided
    }

    const url = `https://genius.com${path}`; // Construct the full Genius URL

    const lyrics = await fetchLyrics(url); // Fetch the lyrics using the function

    if (lyrics) {
        res.json({ lyrics }); // Return the lyrics in JSON format
    } else {
        res.status(500).send('Error: Could not fetch lyrics'); // Handle errors
    }
});

/*
app.get('/api/lyrics', async (req, res) => {
    try {
        const geniusLyricPath = req.query.path; // Pass the path as a query parameter
        const response = await axios.get(`https://genius.com${geniusLyricPath}`);
        res.send(response.data); // Forward the response from Genius to your client
    } catch (error) {
        res.status(500).send('Error fetching lyrics');
    }
});
*/
app.use(express.static(path.join(__dirname)));

// Helper functions

// Define a route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});