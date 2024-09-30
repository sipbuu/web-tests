/*
const CLIENT_ID = 'e0b6c49d7f49401593932b51dc4cbe6b';
const REDIRECT_URI = ''; // e.g., 'http://localhost:3000/callback'
const SCOPE = 'user-read-currently-playing';

// Function to initiate the authorization process
function authorize() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
    window.location.href = authUrl;
}

// Function to get access token from the authorization code
async function getAccessToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${YOUR_CLIENT_SECRET}`) // Add your client secret here
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    });

    const data = await response.json();
    return data.access_token;
}

// Function to get currently playing track
async function getCurrentTrack(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data.item; // Return track info
    } else if (response.status === 204) {
        console.log("No track is currently playing.");
        return null;
    } else {
        console.error('Error fetching current track:', response.status);
        return null;
    }
}

// Main function to handle authentication and fetching track info
async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        const accessToken = await getAccessToken(code);
        const track = await getCurrentTrack(accessToken);

        if (track) {
            console.log('Currently Playing:', track.name, 'by', track.artists[0].name);
        }
    } else {
        authorize(); // Start the authorization process if no code is present
    }
}

// Run the main function on page load
main();