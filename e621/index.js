document.getElementById('fetchBtn').addEventListener('click', fetchMedia);

async function fetchMedia() {
  const tags = document.getElementById('tagInput').value;
  const explicitWarning = document.getElementById('explicitWarning');
  const agreeBtn = document.getElementById('agreeBtn');
  explicitWarning.style.display = 'none'; // Hide the warning by default

  if (!tags) {
    alert('Please enter at least one tag.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/search?tags=${encodeURIComponent(tags)}`);
    const data = await response.json();

    if (data.posts.length === 0) {
      document.getElementById('mediaDisplay').innerHTML = '<p class="no-media">No media found for the given tags.</p>';
      return;
    }

    // Select a random post from the top 10
    const randomPost = data.posts[Math.floor(Math.random() * data.posts.length)];

    const mediaDisplay = document.getElementById('mediaDisplay');
    const info = document.getElementById('info');

    // Check if the post is a video or image
    const fileUrl = randomPost.file.url;
    const isExplicit = randomPost.rating === 'e';

    // If explicit content, show the warning modal, otherwise show the media directly
    if (isExplicit) {
      explicitWarning.style.display = 'flex';  // Show warning modal

      agreeBtn.onclick = function () {
        showMedia(fileUrl);
        explicitWarning.style.display = 'none';  // Hide the modal after agreement
      };
    } else {
      showMedia(fileUrl);
    }

    // Display additional information including score and link to the post
    const rating = randomPost.rating.toUpperCase();
    const score = randomPost.score.total; // Get the score
    const postUrl = `https://e621.net/posts/${randomPost.id}`; // Create link to post
    const tagList = randomPost.tags.general.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');

    info.innerHTML = `
      <p class="rating">Rating: ${rating}</p>
      <p class="score">Score: ${score}</p>
      <p><a href="${postUrl}" target="_blank" class="post-link">View Post</a></p>
      <div class="tags">${tagList}</div>
    `;

    // Add click event to each tag to add it to the input bar
    document.querySelectorAll('.tag').forEach(tagElement => {
      tagElement.addEventListener('click', function () {
        const clickedTag = this.getAttribute('data-tag');
        addTagToInput(clickedTag);
      });
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    alert('An error occurred while fetching data.');
  }
}

// Function to display the media (either video or image)
function showMedia(fileUrl) {
  const mediaDisplay = document.getElementById('mediaDisplay');
  if (fileUrl.endsWith('.webm') || fileUrl.endsWith('.mp4')) {
    mediaDisplay.innerHTML = `<video controls autoplay loop muted>
                                <source src="${fileUrl}" type="video/webm">
                              </video>`;
  } else {
    mediaDisplay.innerHTML = `<img src="${fileUrl}" alt="Image">`;
  }
}

// Function to add clicked tag to input bar
function addTagToInput(tag) {
  const tagInput = document.getElementById('tagInput');
  if (!tagInput.value.includes(tag)) {
    tagInput.value = tagInput.value ? `${tagInput.value}, ${tag}` : tag;
  }
}