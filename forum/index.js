let originalImage = '';

function openForum(message, date, imageUrl) {
  // Display the modal
  document.getElementById("forumModal").style.display = "block";

  // Set forum title, message, and date
  document.getElementById("forumTitle").innerText = "Forum Topic";
  document.getElementById("forumMessage").innerText = message;
  document.getElementById("forumDate").innerText = `Posted on: ${date}`;

  // Set the image if available
  const forumImage = document.getElementById("forumImage");
  if (imageUrl) {
    forumImage.src = imageUrl;
    forumImage.style.display = "block"; // Show the image if it exists
  } else {
    forumImage.style.display = "none"; // Hide the image if no image URL is provided
  }
}

function closeForum() {
  document.getElementById("forumModal").style.display = "none";
}
