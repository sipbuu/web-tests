const SPOTIFY_API_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const CLIENT_ID = 'e0b6c49d7f49401593932b51dc4cbe6b'; // Replace with your actual Client ID
const REDIRECT_URI = 'http://localhost:3000/lastfm'; // Ensure this includes http://

let accessToken = getAccessToken();
let intervalId; // To fetch track information every 30 seconds
let progressIntervalId; // To update the progress every second
let currentProgress = 0; // Progress in milliseconds
let durationMs = 0; // Duration of the current track
let currentTrack = {}; // To store current track details
let status;
let curtrack;
let currentARTIST;
let currentSONG;

function getAccessToken() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    return params.get('access_token');; // Return the access token
}

async function fetchCurrentTrack() {
    try {
        const response = await fetch(SPOTIFY_API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response)
        if (response.status === 204) {
            // If no track is currently playing, fetch the most recent track
            const recentResponse = await fetch(RECENTLY_PLAYED_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!recentResponse.ok && !response.status === 502 && !response.status == 500) {
                const errorText = await recentResponse.text();
                throw new Error(`Error fetching recently played track: ${recentResponse.status} ${errorText}`);
            } else if (response.status === 502 || response.status == 500) {
                displayError("Spotify servers are likely down or still recovering from an outage, try and come back once it's stable.");
                clearIntervals()
            }

            const recentData = await recentResponse.json();
            if (recentData.items && recentData.items.length > 0) {
                const recentTrack = recentData.items[0].track;
                const playedAt = new Date(recentData.items[0].played_at);
                displayTrack(recentTrack, "Most Recent Song", playedAt);
                onupdate(recentTrack)
            } else {
                if (recentData.status == 500) {
                    displayError("Spotify servers are likely down or still recovering from an outage, try and come back once it's stable.");
                    clearIntervals()
                } else if (!recentData.status == 502){
                    displayNoTrack(); // No recent tracks found
                    clearIntervals()
                }
            }
        } else if (response.status === 401) {
            window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state user-read-currently-playing user-read-recently-played`;
        } else if (response.status === 502 || response.status == 500) {
            displayError("Spotify servers are likely down or still recovering from an outage, try and come back once it's stable.");
            clearIntervals()
        } else if (!response.ok && response.status != 502 && response.status != 500) {
            const errorText = await response.text();
            throw new Error(`Error fetching the current track: ${response.status} ${errorText}`);
        } else {
            const data = await response.json();
            if (data && data.is_playing) {
                currentProgress = data.progress_ms; // Update current progress
                durationMs = data.item.duration_ms; // Update duration
                currentTrack = data.item; // Store current track
                displayTrack(currentTrack, "Currently Playing", null, durationMs);
                status = true;
                onupdate()
            } else {
                status = false;
                // If not playing, fetch and show the most recent track
                const recentResponse = await fetch(RECENTLY_PLAYED_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!recentResponse.ok) {
                    const errorText = await recentResponse.text();
                    throw new Error(`Error fetching recently played track: ${recentResponse.status} ${errorText}`);
                } else if (recentResponse.status == 502) {
                    displayError("Spotify servers are likely down, check their website status. Come back when it's not down.");
                    clearIntervals()
                }

                const recentData = await recentResponse.json();
                console.log(recentData)
                if (recentData.items && recentData.items.length > 0) {
                    const recentTrack = recentData.items[0].track;
                    console.log(recentTrack)
                    const playedAt = new Date(recentData.items[0].played_at);
                    displayTrack(recentTrack, "Most Recent Song", playedAt);
                    onupdate(recentData)
                } else if (recentData.status == 502) {
                    displayError("Spotify servers are likely down or still recovering from an outage, try and come back once it's stable.");
                    clearIntervals()
                } else if (!recentData.status == 502) {
                    displayNoTrack(); // No recent tracks found
                    clearIntervals()
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        displayError(error);
        clearIntervals()
    }
}

/*
function displayTrack(track, status, playedAt = null, durationMs = 0) {
    const trackContainer = document.getElementById('track-container');
    const progressBarHtml = durationMs > 0 ? `
        <div class="progress-bar">
            <div class="progress" style="width: ${(currentProgress / durationMs) * 100}%"></div>
        </div>
        <p>${formatTime(currentProgress)} / ${formatTime(durationMs)}</p>
    ` : '';

    trackContainer.innerHTML = `
        <h2>${status}</h2>
        <p><strong>Title:</strong> ${track.name}</p>
        <p><strong>Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p><strong>Album:</strong> ${track.album.name}</p>
        <img src="${track.album.images[0].url}" alt="${track.name}">
        ${progressBarHtml}
        ${playedAt ? `<p><strong>Last Played:</strong> ${playedAt.toLocaleString()}</p>` : ''}
    `;

    var trackimgurl = track.album.images[0].url

    
    function setBackgroundImage(url) {
        const background = document.getElementById('background');
        background.style.backgroundImage = `url(${url})`;
    }
    
    setBackgroundImage(trackimgurl)

    fetchLyrics(track)
}
*/

/*
function displayTrack(track, status, playedAt = null, durationMs = 0) {
    const trackContainer = document.getElementById('track-container');

    // Create track info HTML
    const trackInfoHtml = `
        <h2>${status}</h2>
        <p><strong>Title:</strong> ${track.name}</p>
        <p><strong>Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p><strong>Album:</strong> ${track.album.name}</p>
        <img src="${track.album.images[0].url}" alt="${track.name}">
    `;

    // Update track info without overwriting lyrics
    trackContainer.innerHTML = trackInfoHtml;

    // Ensure lyrics div exists
    let lyricsElement = document.getElementById('lyrics');
    if (!lyricsElement) {
        lyricsElement = document.createElement('div');
        lyricsElement.className = 'lyrics';
        lyricsElement.id = 'lyrics';
        trackContainer.appendChild(lyricsElement);
    }

    // Add progress bar if track has duration
    if (durationMs > 0) {
        const progressBarHtml = `
            <div class="progress-bar">
                <div class="progress" style="width: ${(currentProgress / durationMs) * 100}%"></div>
            </div>
            <p>${formatTime(currentProgress)} / ${formatTime(durationMs)}</p>
        `;
        trackContainer.insertAdjacentHTML('beforeend', progressBarHtml);
    }

    // Last played time
    if (playedAt) {
        trackContainer.insertAdjacentHTML('beforeend', `<p><strong>Last Played:</strong> ${playedAt.toLocaleString()}</p>`);
    }

    // Set background image

    function setBackgroundImage(url) {
        const background = document.getElementById('background');
        background.style.backgroundImage = `url(${url})`;
    }

    setBackgroundImage(track.album.images[0].url);

    curtrack = track;

}
*/
function displayTrack(track, status, playedAt = null, durationMs = 0) {
    const trackContainer = document.getElementById('track-container'); 

    let trackInfoHtml;
    if (status == "Currently Playing") {
        trackInfoHtml = `
        <h2>${status}</h2>
        <p><strong id="track-title">Title:</strong> ${track.name}</p>
        <p><strong id="track-artist">Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p><strong id="album-name">Album:</strong> ${track.album.name}</p>
        <img src="${track.album.images[0].url}" alt="${track.name}">
        <div class="progress-bar">
            <div class="progress" style="width: ${(currentProgress / durationMs) * 100}%"></div>
        </div>
        <p>${formatTime(currentProgress)} / ${formatTime(durationMs)}</p>
    `;
    } else {
        trackInfoHtml = `
        <h2>${status}</h2>
        <p><strong id="track-title">Title:</strong> ${track.name}</p>
        <p><strong id="track-artist">Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p><strong>Album:</strong> ${track.album.name}</p>
        <img src="${track.album.images[0].url}" alt="${track.name}">
        <p><strong>Last Played:</strong> ${playedAt.toLocaleString()}</p>
    `;
    }

    currentARTIST = track.artists[0].name
    currentSONG = track.name

    // Update track info without overwriting the lyrics
    trackContainer.querySelector('.track-info').innerHTML = trackInfoHtml;

    // Ensure lyrics div exists
    let lyricsElement = document.getElementById('lyrics');
    if (!lyricsElement) {
        lyricsElement = document.createElement('div');
        lyricsElement.className = 'lyrics';
        lyricsElement.id = 'lyrics';
        trackContainer.appendChild(lyricsElement);
    }

    // Add progress bar if track has duration
    if (durationMs > 0) {
        
    }

    // Last played time
    if (playedAt) {
        //trackContainer.insertAdjacentHTML('beforeend', `<p><strong>Last Played:</strong> ${playedAt.toLocaleString()}</p>`);
    }

    // Set background image
    function setBackgroundImage(url) {
        const background = document.getElementById('background');
        background.style.backgroundImage = `url(${url})`;
    }

    let releaseDate = track.release_date || 'Unknown Release Date';
    let genre = track.genre || 'Unknown Genre';

    setBackgroundImage(track.album.images[0].url);
    curtrack = track;
}



function displayNoTrack() {
    const trackContainer = document.getElementById('track-container');
    trackContainer.innerHTML = `<h2 class="no-track">No track is currently playing or found.</h2>`;
}

function displayError(error) {
    const trackContainer = document.getElementById('track-container');
    trackContainer.innerHTML = `<h2 class="no-track">Error</h2><p>${error.message}</p>`;
}

function formatTime(ms) {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Update progress every second
function updateProgress() {
    if (durationMs > 0 && currentTrack && status) {
        currentProgress += 1000; // Increase by 1000ms (1 second)
        if (currentProgress > durationMs) {
            currentProgress = durationMs; // Cap at the track duration
        }
        displayTrack(currentTrack, "Currently Playing", null, durationMs);
        highlightLyrics(currentProgress);
    }
    
}

function clearIntervals() {
    clearInterval(intervalId); // Stop track fetch interval
    clearInterval(progressIntervalId); // Stop progress update interval
}

async function getAccessTokenWeb() {
    /*
    try {
        let accessTokenResponse = await fetch(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state user-read-currently-playing user-read-recently-played`);
        
        if (accessTokenResponse.status == 502) {
            displayError("Spotify servers are likely down, check their website status. Come back when it's not down.");
            clearIntervals()
        }

        if (accessTokenResponse > 1 || accessTokenResponse.body == null) {
            displayError("Spotify servers are likely down, check their website status. Come back when it's not down.");
            clearIntervals()
        }
    } catch (error) {
        console.log(error)
        displayError("Spotify servers are likely down, check their website status. Come back when it's not down.");
        if (error == "TypeError: NetworkError when attempting to fetch resource." || "Uncaught (in promise) TypeError: NetworkError when attempting to fetch resource.") {
            displayError("Spotify servers are likely down, check their website status. Come back when it's not down.");
            clearIntervals()
            console.log("error detected.")
        }
    */
    console.log("getting window.")
    window.open(
        `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state user-read-currently-playing user-read-recently-played`,
        '_blank',
        'noopener,noreferrer' 
    );
    /*
        );
    }
    */
}
// Start checking every 30 seconds and update progress every second
if (!accessToken) {
   window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state user-read-currently-playing user-read-recently-played`;
} else {
    const newUrl = window.location.origin + window.location.pathname; // Keep the origin and pathname only
    window.history.replaceState({}, document.title, newUrl); // Update the URL without reloading
    fetchCurrentTrack();
    intervalId = setInterval(fetchCurrentTrack, 15000); // Recheck every 30 seconds
    progressIntervalId = setInterval(updateProgress, 1000); // Update progress every second
    onupdate()
    fetchCurrentTrack();
}