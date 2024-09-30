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

function getAccessToken() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    return params.get('access_token');
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

        if (response.status === 204) {
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
            }

            const recentData = await recentResponse.json();
            if (recentData.items && recentData.items.length > 0) {
                displayTrack(recentData.items[0].track, "Most Recent Song");
            } else {
                displayNoTrack(); // No recent tracks found
            }
        } else if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching the current track: ${response.status} ${errorText}`);
        } else {
            const data = await response.json();
            if (data && data.is_playing) {
                currentProgress = data.progress_ms; // Update current progress
                durationMs = data.item.duration_ms; // Update duration
                currentTrack = data.item; // Store current track

                status = "Currently Playing"
                displayTrack(currentTrack, "Currently Playing", currentProgress, durationMs);
            } else {
                status = "Most Recent Song"
                    // If it's not playing, show the most recent track label
                if (currentTrack && currentTrack.name) {
                    displayTrack(currentTrack, "Most Recent Song", currentProgress, durationMs);
                    const trackContainer = document.getElementById('track-container');
                    trackContainer.innerHTML = `
                        <h2>${status}</h2>
                        <p><strong>Title:</strong> ${track.name}</p>
                        <p><strong>Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
                        <p><strong>Album:</strong> ${track.album.name}</p>
                        <img src="${track.album.images[0].url}" alt="${track.name}">
                    `;
                } else {
                    displayNoTrack(); // No recent tracks found
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        displayError(error);
    }
}


function displayTrack(track, status, progressMs, durationMs) {
    const trackContainer = document.getElementById('track-container');
    if (status == "Currently Playing") {
        trackContainer.innerHTML = `
            <h2>${status}</h2>
            <p><strong>Title:</strong> ${track.name}</p>
            <p><strong>Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
            <p><strong>Album:</strong> ${track.album.name}</p>
            <img src="${track.album.images[0].url}" alt="${track.name}">
            <p>${formatTime(progressMs)} / ${formatTime(durationMs)}</p>
        `;
    } else if (status == "Most Recent Song") {
        trackContainer.innerHTML = `
            <h2>${status}</h2>
            <p><strong>Title:</strong> ${track.name}</p>
            <p><strong>Artist:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
            <p><strong>Album:</strong> ${track.album.name}</p>
            <img src="${track.album.images[0].url}" alt="${track.name}">
        `;
    }
    var trackimgurl = track.album.images[0].url

    /*
    function setBackgroundImage(url) {
        const background = document.getElementById('background');
        background.style.backgroundImage = `url(${url})`;
    }
    */
    console.log("hai")
    console.log(trackimgurl)


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
    if (durationMs > 0 && currentTrack && status == "Currently Playing") {
        currentProgress += 1000; // Increase by 1000ms (1 second)
        if (currentProgress > durationMs) {
            currentProgress = durationMs; // Cap at the track duration
        }
        displayTrack(currentTrack, "Currently Playing", currentProgress, durationMs);
    }
}

// Start checking every 30 seconds and update progress every second
if (!accessToken) {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state user-read-currently-playing user-read-recently-played`;
} else {
    fetchCurrentTrack();
    intervalId = setInterval(fetchCurrentTrack, 30000); // Recheck every 30 seconds
    progressIntervalId = setInterval(updateProgress, 1000); // Update progress every second
}