let currentUser = null;

// Fetch posts from server
const loadPosts = () => {
    fetch('/posts')
        .then(res => res.json())
        .then(posts => {
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = '';
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <img src="https://i.pravatar.cc/60" alt="Profile Picture">
                    <div class="post-content">
                        <p>${post.content}</p>
                        <small>Posted by ${post.username} on ${new Date(post.timestamp).toLocaleString()}</small>
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });
        });
};

// Fetch user's profile and posts
const loadProfile = (username) => {
    fetch(`/profile/${username}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('User not found');
            }
            return res.json();
        })
        .then(user => {
            currentUser = user;
            document.getElementById('profile-username').innerText = user.username;
            document.getElementById('profile-pic').src = user.profilePic || 'https://i.pravatar.cc/100';
            document.getElementById('profile-bio').innerText = user.bio;
            document.getElementById('user-posts-container').innerHTML = user.posts.map(post => `
                <div class="post">
                    <p>${post.content}</p>
                </div>
            `).join('');
            document.getElementById('profile-section').style.display = 'block';
        })
        .catch(err => {
            console.error(err);
            alert('User not found');
        });
};

// Login functionality
document.getElementById('login-btn').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`/profile/${username}`)
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('User not found');
        })
        .then(user => {
            if (user.password === password) {
                localStorage.setItem('username', username);
                alert("Login successful!");
                document.getElementById('login-modal').style.display = 'none';
                loadPosts();
                loadProfile(username); // Load profile after login
            } else {
                alert("Invalid credentials.");
            }
        })
        .catch(err => {
            alert(err.message);
        });
});

// Save settings
document.getElementById('save-settings-btn').addEventListener('click', function () {
    const username = localStorage.getItem('username');
    const newBio = document.getElementById('new-bio').value;
    const newProfilePic = document.getElementById('new-profile-pic').value;
    const newUsername = document.getElementById('new-username').value;

    fetch(`/profile/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bio: newBio,
            profilePic: newProfilePic,
            username: newUsername || username // Update username if provided
        })
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        throw new Error('Update failed');
    })
    .then(updatedUser => {
        alert("Profile updated successfully!");
        loadProfile(updatedUser.username); // Refresh profile data
        document.getElementById('settings-modal').style.display = 'none'; // Close modal
    })
    .catch(err => {
        alert(err.message);
    });
});

// Show settings modal
document.getElementById('edit-profile-btn').addEventListener('click', function () {
    if (currentUser) {
        document.getElementById('new-bio').value = currentUser.bio || '';
        document.getElementById('new-profile-pic').value = currentUser.profilePic || '';
        document.getElementById('new-username').value = currentUser.username || '';
        document.getElementById('settings-modal').style.display = 'flex'; // Show settings modal
    }
});

// Show login modal on load if not logged in
window.onload = function () {
    const username = localStorage.getItem('username');
    if (!username) {
        document.getElementById('login-modal').style.display = 'flex';
    } else {
        loadPosts();
        loadProfile(username); // Load profile if already logged in
    }
};

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('username');
    currentUser = null; // Clear current user
    document.getElementById('profile-section').style.display = 'none'; // Hide profile section
    loadPosts(); // Refresh posts
    location.reload(); // Reload the page to reset state
});

// Toggle profile dropdown
document.getElementById('profile-menu').addEventListener('click', function () {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Search functionality
document.getElementById('search-btn').addEventListener('click', function () {
    const searchTerm = document.getElementById('search-input').value;
    fetch(`/profile/${searchTerm}`)
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('User not found');
        })
        .then(user => {
            loadProfile(user.username);
            alert(`Profile for ${user.username} loaded.`);
        })
        .catch(err => {
            alert(err.message);
        });
});
