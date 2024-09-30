/*
const CLIENT_ID = 'e0b6c49d7f49401593932b51dc4cbe6b';
const CLIENT_SECRET = '166956a3c46849639ee97eb5bed5b67b';
username = "31zt2v5jh34rs3wxnmacbsl5xasa"
scope = "user-read-currently-playing"

// Function to get access token
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    console.log(data.access_token);
    return data.access_token;
}

// Function to get currently playing or recently played track
async function getCurrentTrack(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });

        if (response.status === 204) {
            // No track currently playing, get most recently played
            const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });
            const recentData = await recentResponse.json();
            return recentData.items[0].track;
        } else {
            const data = await response.json();
            return data.item;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Main function to get and display track info
async function getAndDisplayTrackInfo() {
    const accessToken = await getAccessToken();
    const track = await getCurrentTrack(accessToken);

    if (track) {
        console.log('Track Info:');
        console.log('Name:', track.name);
        console.log('Artist:', track.artists[0].name);
        console.log('Album:', track.album.name);
        console.log('Release Date:', track.album.release_date);
        console.log('Popularity:', track.popularity);
        console.log('Preview URL:', track.preview_url);
        console.log('Spotify URL:', track.external_urls.spotify);
    } else {
        console.log('No track information available');
    }
}

// Run the script
getAndDisplayTrackInfo();