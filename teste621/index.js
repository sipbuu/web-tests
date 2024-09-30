document.getElementById('fetchBtn').addEventListener('click', fetchMedia);
const timer = ms => new Promise(res => setTimeout(res, ms))

let lastScrollPosition = 0; // Variable to hold the last scroll position

const dropdown = document.querySelector('.custom-dropdown');
const selected = document.querySelector('.selected');
const options = document.querySelectorAll('.dropdown-options li');

document.getElementById('openSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'flex';
});

document.getElementById('saveSettings').addEventListener('click', () => {
    const blurExplicit = document.getElementById('blurExplicitCheckbox').checked;
    const blurQuestionable = document.getElementById('blurQuestionableCheckbox').checked;
    const selectedTheme = selected.textContent;

    // Store preferences in localStorage
    localStorage.setItem('blurExplicit', blurExplicit);
    localStorage.setItem('blurQuestionable', blurQuestionable);
    localStorage.setItem('selectedTheme', selectedTheme);

    // Apply the theme immediately
    applyTheme(selected.textContent);

    // Close the modal
    document.getElementById('settingsModal').style.display = 'none';
});

function applyTheme(theme) {
    console.log(theme)
    if (theme === 'Light Mode') {
        document.body.classList.add('light-theme');
    } else if (theme === 'REALLY DARK Mode') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('REALLYDARK-theme');
    } else {
        document.body.classList.remove('REALLYDARK-theme');
        document.body.classList.remove('light-theme');
    } 
}

function applyPreferences() {
    const blurExplicit = localStorage.getItem('blurExplicit') === 'true';
    const theme = localStorage.getItem('theme') || 'dark';

    // Apply blur if needed
    document.querySelectorAll('.post-preview img, .post-preview video').forEach(media => {
        if (blurExplicit) {
            media.classList.add('blurred');
        } else {
            media.classList.remove('blurred');
        }
    });

    // Apply theme
    document.body.className = theme;
}

// Load preferences when the page loads
window.addEventListener('DOMContentLoaded', applyPreferences);

// Function to fetch media
async function fetchMedia() {
    const loadingCircle = document.getElementById('loadingCircle');
    loadingCircle.style.display = 'block'; // Show loading circle
    await timer(500)

    const tags = document.getElementById('tagInput').value;
    const explicitWarning = document.getElementById('explicitWarning');
    const numberOfPosts = parseInt(document.getElementById('numberInput').value) || 10; // Get number of posts
    const apiKey = document.getElementById('apiKey').value
    const username = document.getElementById('username').value
    explicitWarning.style.display = 'none';

    if (!tags) {
        alert('Please enter at least one tag.');
        return;
    }

    try {
        let data;
        let response;

        response = await fetch(`http://localhost:3000/search?tags=${encodeURIComponent(tags)}&limit=${numberOfPosts}&token=${encodeURIComponent(apiKey)}&username=${encodeURIComponent(username)}`); // Pass limit to API
        data = await response.json();

        /*
        if (apiKey > 1 && username > 1) {
            response = await fetch(`http://localhost:3000/search?tags=${encodeURIComponent(tags)}&limit=${numberOfPosts}&token=${encodeURIComponent(apiKey)}&username=${encodeURIComponent(username)}`); // Pass limit to API
            data = await response.json();
        } else {
            response = await fetch(`http://localhost:3000/search?tags=${encodeURIComponent(tags)}&limit=${numberOfPosts}`); // Pass limit to API
            data = await response.json();
        }
        */
        if (data.posts.length === 0) {
            document.getElementById('mediaDisplay').innerHTML = '<p class="no-media">No media found for the given tags.</p>';
            return;
        }

        document.getElementById('info').innerHTML = ''; // Clear infoContainer when loading new posts
        loadingCircle.style.display = 'none'
        displayPosts(data.posts); // Directly display all fetched posts
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
    }
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

// Function to reveal the posts when they enter the viewport
function revealPostsOnScroll() {
    const posts = document.querySelectorAll('.post-preview');
    posts.forEach(post => {
        if (isInViewport(post)) {
            post.classList.add('visible');
        }
    });
}

// Add scroll event listener to reveal posts
window.addEventListener('scroll', revealPostsOnScroll);

// Function to display posts
function displayPosts(posts) {
    const mediaDisplay = document.getElementById('mediaDisplay');
    mediaDisplay.innerHTML = ''; 

    const previewContainer = document.createElement('div');
    previewContainer.classList.add('preview-container');
    console.log(posts)
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post-preview');
        const fileUrl = post.file.url;
        const isExplicit = post.rating === 'e';
        const isQuestionable = post.rating === 'q';
        const isSafe = post.rating === 's';
        let tagList = '';
        const previewImage = document.createElement('img');
       
        if (isExplicit) {
            console.log(localStorage.getItem('blurExplicit'))
            if (localStorage.getItem('blurExplicit') == 'true') { 
                previewImage.classList.add('blurred'); 
            }
            const warningTag = `<span class="tag warning-tag" style="color: red; onclick="addTagToInput('rating:explicit')">⚠️ EXPLICIT</span>`;
            tagList += warningTag;
        } else if (isQuestionable) {
            console.log(localStorage.getItem('blurQuestionable'))
            if (localStorage.getItem('blurQuestionable') == 'true') { 
                previewImage.classList.add('blurred'); 
            }
            const warningTag = `<span class="tag warning-tag" style="color: orange; onclick="addTagToInput('rating:questionable')"">❓ Questionable</span>`;
            tagList += warningTag;
        } else if (isSafe) {
            const warningTag = `<span class="tag safe-tag" style="color: #66FF99; onclick="addTagToInput('rating:safe')"">🌸 Safe</span>`;
            tagList += warningTag;
        }

        postDiv.appendChild(previewImage);
        let text2;
        console.log(fileUrl)
        if (fileUrl != null) {
            if (fileUrl.endsWith('.webm')) {
                // Capture first frame for .webm or .gif
                previewImage.src = post.sample.url || post.preview.url
            } else if (fileUrl.endsWith('.gif')){
              previewImage.src = post.preview.url
            } else {
                previewImage.src = fileUrl;
            }
        } else if (post.file.ext == "swf") {
            console.log('ends with swf')
            text2 = document.createElement('h2')
            text2.innerHTML = "Flash file, cannot preview."
            postDiv.appendChild(text2);
            text2.onclick = () => handlePostClick(post);
            
        } else {
            previewImage.innerHTML = "could not load :c"
            text2 = document.createElement('h2')
            text2.innerHTML = "could not load (likely a blacklisted tag error, authenicate with your own api token.)"
            postDiv.appendChild(text2);
            text2.onclick = () => handlePostClick(post);
        }

        // Show full post details on click
        previewImage.onclick = () => handlePostClick(post);

        // Display the first 10 tags below the preview
        let mainArtist;
        let mainCharacter = "unknown character";

        if (post.tags.character[1]) {
            mainCharacter = post.tags.character[1]
        } else if (post.tags.character[0]) {
            mainCharacter = post.tags.character[0]
        } else {
            mainCharacter = "unknown character"
        }
        if (post.tags.artist[1]) {
            mainArtist = post.tags.artist[1]
            if (post.tags.artist[1] == "sound_warning") { mainArtist = post.tags.artist[0]}
        } else {
            mainArtist = post.tags.artist[0]
        }

        if (post.tags.general.includes("young")){
            tagList += `<span class="tag blacklisted-tag">🟡 young</span>` 
        } 
        if (post.tags.general.includes("gore")) {
            tagList += `<span class="tag blacklisted-tag">🟡 gore</span>`; 
        } 
        if (post.tags.general.includes("scat")) {
            tagList += `<span class="tag blacklisted-tag">🟡 scat</span>`; 
        } 
        if (post.tags.general.includes("watersports")) {
            tagList += `<span class="tag blacklisted-tag">🟡 watersports</span>`; 
        } 
        if (post.tags.general.includes("loli")) {
            tagList += `<span class="tag blacklisted-tag">🟡 loli</span>`; 
        }  
        if (post.tags.general.includes("shota")) {
            tagList += `<span class="tag blacklisted-tag">🟡 shota</span>`; 
        }

        //okay i know the above is the MOST inefficient way to do that, but, still.

        tagList += `<span class="tag" style="color: #129f4f"; onclick="addTagToInput('${mainArtist}')">Artist: ${mainArtist}</span>`
        tagList += `<span class="tag" style="color: #129f4f"; onclick="addTagToInput('${mainCharacter}')">Character: ${mainCharacter}</span>`
        tagList += `<span class="tag" style="color: #129f4f"; onclick="addTagToInput('score:${post.score.total}')">Score: ${post.score.total}</span>`


        tagList += post.tags.general.slice(0, 10).map(tag => `<span class="tag" onclick="addTagToInput('${tag}')">${tag}</span>`).join('');
        const tagsDiv = document.createElement('div');
        tagsDiv.innerHTML = tagList;
        postDiv.appendChild(tagsDiv);

        previewContainer.appendChild(postDiv);

    });
    mediaDisplay.appendChild(previewContainer);

    window.scrollTo({
        top: lastScrollPosition,
        behavior: 'smooth' // Smooth scrolling back to the position
    });
    const posts2 = document.querySelectorAll('.post-preview');
    posts2[0].classList.add('visible');
}

// Function to handle clicks on a post
async function handlePostClick(post) {
    lastScrollPosition = window.scrollY;
    const mediaContainer = document.getElementById('mediaDisplay');
    const infoContainer = document.getElementById('info');
    const fileUrl = post.file.url;

    mediaContainer.innerHTML = ''; // Clear previous media
    infoContainer.innerHTML = '';  // Clear previous info

    if (post.rating === 'e' || post.rating === 'q') {
        const explicitWarning = document.getElementById('explicitWarning');
        explicitWarning.style.display = 'flex'; // Show warning modal
        const agreeBtn = document.getElementById('agreeBtn');

        agreeBtn.onclick = async function () {
            explicitWarning.style.display = 'none';
            await showMediaDetails(post);
        };
    } else {
        await showMediaDetails(post);
    }
}

// Function to show media details
async function showMediaDetails(post) {
    let rating;

    switch (post.rating) {
        case "s":
            rating = "Safe";
            break;
        case "e":
            rating = "Explicit";
            break;
        case "q":
            rating = "Questionable";
            break;
        default:
            rating = "Unknown"; // Fallback for unexpected ratings
            break;
    }
    const mediaContainer = document.getElementById('mediaDisplay');
    const infoContainer = document.getElementById('info');
    const fileUrl = post.file.url;
    const postId = post.id; // e621 post ID
    mediaContainer.innerHTML = ''; // Clear previous media
    infoContainer.innerHTML = '';  // Clear previous info

    // Display post info and Back to Posts button only for individual view
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Posts';
    backButton.setAttribute('onclick', 'fetchMedia()'); // Attach back to posts onclick
    infoContainer.appendChild(backButton);

    const originalLink = document.createElement('a');
    originalLink.href = `https://e621.net/posts/${postId}`;
    originalLink.target = '_blank'; // Open link in new tab
    originalLink.textContent = 'View on e621';
    originalLink.classList.add('original-link'); // Add a class for potential styling
    infoContainer.appendChild(originalLink); // Append the link to the info container

    const isExplicit = post.rating === 'e';
    const isQuestionable = post.rating === 'q';
    const isSafe = post.rating === 's';
    let allTags = '';
    
    if (isExplicit) {
        const warningTag = '<span class="tag warning-tag" style="color: red;">⚠️ EXPLICIT</span>';
        allTags += warningTag;
    } else if (isQuestionable) {
        const warningTag = '<span class="tag warning-tag" style="color: orange;">❓ Questionable</span>';
        allTags += warningTag;
    } else if (isSafe) {
        const warningTag = '<span class="tag safe-tag" style="color: #66FF99;">🌸 Safe</span>';
        allTags += warningTag;
    }

    allTags = post.tags.general.map(tag => `<span class="tag" onclick="addTagToInput('${tag}')">${tag}</span>`).join('');
    infoContainer.innerHTML += `
        <p class="rating">Rating: ${rating}</p>
        <p class="score">Score: ${post.score.total}</p>
        <div class="tags">${allTags}</div>
    `;

    // Handle media display

    if (fileUrl != null) {
        if (fileUrl.endsWith('.webm')) {
            // Show video player for webm/gif
            showVideoPlayer(fileUrl, mediaContainer);
        } else {
            const img = document.createElement('img');
            img.src = fileUrl;
            mediaContainer.appendChild(img);
        }
    } else {
        let text = document.createElement('h2')
        text.innerHTML = "could not load ;c (try viewing the original link on e6, or if it's a blacklisted term, use your api key.)"
        mediaContainer.appendChild(text)
    }

    revealPostsOnScroll();
}

// Function to show video player
function showVideoPlayer(fileUrl, mediaContainer) {
    const videoPlayer = document.createElement('video');
    videoPlayer.src = fileUrl;
    videoPlayer.controls = true;
    mediaContainer.innerHTML = ''; // Clear previous media
    mediaContainer.appendChild(videoPlayer); // Add video player
    videoPlayer.play();
}

// Function to capture the first frame from a video or gif
// Function to capture the first frame from a video or gif
// Function to capture the first frame from a video or gif

// Function to add clicked tag to input bar
function addTagToInput(tag) {
    const tagInput = document.getElementById('tagInput');
    if (!tagInput.value.includes(tag)) {
        tagInput.value = tagInput.value ? `${tagInput.value} ${tag}` : tag;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('onOpenexplicitWarning');
    const closeBtn = document.getElementById('closeWarningBtn');

    // Show the modal on page load
    modal.style.display = 'flex';

    // Hide modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
    const blurExplicit = localStorage.getItem('blurExplicit') === 'true';
    const blurQuestionable = localStorage.getItem('blurQuestionable') === 'true';

    // Apply stored preferences
    applyTheme(savedTheme);
    document.getElementById('blurExplicitCheckbox').checked = blurExplicit;
    document.getElementById('blurQuestionableCheckbox').checked = blurQuestionable;
    document.getElementById('themeSelect').value = savedTheme;
});

selected.addEventListener('click', () => {
    dropdown.classList.toggle('active'); // Toggle dropdown visibility
});

// Loop through each option
options.forEach(option => {
    option.addEventListener('click', () => {
        selected.textContent = option.textContent; // Update selected text
        const selectedValue = option.getAttribute('data-value');
        // You can set the theme or apply any other action here
        if (selectedValue === 'light') {
            document.body.classList.add('light-theme');
        } else if (selectedValue === 'reallydark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('REALLYDARK-theme');
        } else {
            document.body.classList.remove('REALLYDARK-theme');
            document.body.classList.remove('light-theme');
        } 
        dropdown.classList.remove('active'); // Close dropdown
    });
});
// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
