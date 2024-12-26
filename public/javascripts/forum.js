/*****************************************************
 * 1. GLOBAL VARIABLES & DOM ELEMENT REFERENCES
 *****************************************************/

// Assume `loggedInUser` is already defined somewhere
// If not, you can define it here, e.g.:
// const loggedInUser = "myUserName";  

const postsContainer = document.getElementById("posts");
const newPostForm = document.getElementById("new-post-form");
const createPostButton = document.getElementById("create-post-button");
const newPostModal = document.getElementById("new-post-modal");

/*****************************************************
 * 2. FETCH DATA & INITIAL RENDER
 *****************************************************/

// Fetch posts when the page loads
fetchPosts();

/**
 * Fetch and display all forum posts
 */
async function fetchPosts() {
  try {
    const response = await fetch("/api/posts");
    const posts = await response.json();

    // Clear existing posts
    postsContainer.innerHTML = "";

    // Add each post to the DOM
    posts.forEach((post) => addPostToDOM(post));
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

/*****************************************************
 * 3. POST CREATION, DISPLAY, AND DELETION
 *****************************************************/

/**
 * Handle new post form submission
 */
newPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  // Create new post via API
  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      const newPost = await response.json();
      // Add new post to the top of the list
      addPostToDOM(newPost, true);
      closeModal();
      newPostForm.reset();
    }
  } catch (error) {
    console.error("Error creating a new post:", error);
  }
});

/**
 * Add a single post to the DOM
 * @param {Object} post - The post data
 * @param {Boolean} addToTop - Whether to prepend the post instead of appending
 */
function addPostToDOM(post, addToTop = false) {
  // Prevent duplicates if post already exists in the DOM
  if (document.getElementById(`post-${post._id}`)) return;

  // Determine if current user is post author
  const isAuthor = loggedInUser === post.author;
  const timePosted = new Date(post.timestamp).toLocaleString();

  // Create post card markup
  const postCard = `
    <div class="post-card" id="post-${post._id}">
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <div class="post-meta">
        Posted by <strong>${post.author}</strong> on ${timePosted}
      </div>
      <div class="post-actions">
        <div class="vote-controls">
          <i class="fas fa-arrow-up" onclick="vote('${post._id}', 'upvote')"></i>
          <span>${post.votes}</span>
          <i class="fas fa-arrow-down" onclick="vote('${post._id}', 'downvote')"></i>
        </div>
        ${
          isAuthor
            ? `<button class="delete-post" onclick="deletePost('${post._id}')">
                 <i class="fas fa-trash"></i> Delete
               </button>`
            : ""
        }
      </div>
      <div class="replies">
        <h4>Replies:</h4>
        <div id="replies-${post._id}">
          ${post.replies
            .map((reply) => createReplyHTML(reply, post._id))
            .join("")}
        </div>
        <form class="reply-form" onsubmit="addReply(event, '${post._id}')">
          <textarea placeholder="Write a reply..." required></textarea>
          <button type="submit">Reply</button>
        </form>
      </div>
    </div>
  `;

  // Insert the post into DOM
  if (addToTop) {
    postsContainer.insertAdjacentHTML("afterbegin", postCard);
  } else {
    postsContainer.insertAdjacentHTML("beforeend", postCard);
  }

  // Set initial vote button colors
  updateVoteControls(post._id, post.votes, post.upvotedBy, post.downvotedBy);
}

/**
 * Delete a post
 * @param {String} postId - The ID of the post to delete
 */
async function deletePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      document.getElementById(`post-${postId}`).remove();
      alert("Post deleted successfully.");
    } else {
      const error = await response.json();
      alert(`Error deleting post: ${error.error}`);
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    alert("An unexpected error occurred while deleting the post.");
  }
}

/*****************************************************
 * 4. VOTE HANDLING (UPVOTE / DOWNVOTE)
 *****************************************************/

/**
 * Handle upvoting/downvoting a post
 * @param {String} postId 
 * @param {String} action - 'upvote' or 'downvote'
 */
async function vote(postId, action) {
  // Disable buttons to prevent multiple clicks
  const upvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-up`
  );
  const downvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-down`
  );
  upvoteButton.disabled = true;
  downvoteButton.disabled = true;

  try {
    const response = await fetch(`/api/posts/${postId}/vote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      const updatedPost = await response.json();

      // Update vote controls
      updateVoteControls(
        postId,
        updatedPost.votes,
        updatedPost.upvotedBy,
        updatedPost.downvotedBy
      );

      // Refresh the post data in the DOM
      fetchAndUpdatePost(postId);

    } else {
      const errorData = await response.json();
      if (response.status === 403) {
        alert(errorData.error);
      } else {
        alert("Failed to vote.");
      }
    }
  } catch (error) {
    console.error("Error voting:", error);
    alert("An error occurred while voting.");
  } finally {
    // Re-enable vote buttons
    upvoteButton.disabled = false;
    downvoteButton.disabled = false;
  }
}

/*****************************************************
 * 5. HELPER FUNCTIONS (POST UPDATING & VOTE CONTROL)
 *****************************************************/

/**
 * Fetch and update a specific post in the DOM
 * @param {String} postId 
 */
async function fetchAndUpdatePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    if (response.ok) {
      const updatedPost = await response.json();
      updatePostInDOM(updatedPost);
    } else {
      console.error("Failed to fetch updated post data.");
    }
  } catch (error) {
    console.error("Error fetching updated post data:", error);
  }
}

/**
 * Update a post in the DOM (e.g., votes)
 * @param {Object} post 
 */
function updatePostInDOM(post) {
  const postElement = document.getElementById(`post-${post._id}`);
  if (!postElement) return;

  // Update vote count text
  const voteSpan = postElement.querySelector(".vote-controls span");
  voteSpan.textContent = post.votes;

  // Update vote button colors
  updateVoteControls(post._id, post.votes, post.upvotedBy, post.downvotedBy);
}

/**
 * Update vote controls (UI) for a given post
 * @param {String} postId 
 * @param {Number} votes 
 * @param {Array} upvotedBy 
 * @param {Array} downvotedBy 
 */
function updateVoteControls(postId, votes, upvotedBy, downvotedBy) {
  const voteSpan = document.querySelector(`#post-${postId} .vote-controls span`);
  if (voteSpan) {
    voteSpan.textContent = votes;
  }

  const upvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-up`
  );
  const downvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-down`
  );

  // Reset colors
  if (upvoteButton) upvoteButton.style.color = "";
  if (downvoteButton) downvoteButton.style.color = "";

  // Apply color if current user has up/downvoted
  const userId = loggedInUser;
  if (upvotedBy.includes(userId) && upvoteButton) {
    upvoteButton.style.color = "blue";
  } 
  if (downvotedBy.includes(userId) && downvoteButton) {
    downvoteButton.style.color = "red";
  }
}

/*****************************************************
 * 6. REPLIES (ADD & DELETE)
 *****************************************************/

/**
 * Form submit handler for adding a new reply to a post
 * @param {Event} event 
 * @param {String} postId 
 */
async function addReply(event, postId) {
  event.preventDefault();

  // Get reply content from the textarea
  const replyContent = event.target.querySelector("textarea").value;

  try {
    const response = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });

    if (response.ok) {
      const newReply = await response.json();
      console.log("Got new reply from server:", newReply);

      // Add the new reply to the DOM
      const replyContainer = document.getElementById(`replies-${postId}`);
      const replyHTML = createReplyHTML(newReply, postId);

      replyContainer.insertAdjacentHTML("beforeend", replyHTML);

      // Reset the form
      event.target.reset();
    } else {
      alert("Failed to add reply.");
    }
  } catch (error) {
    console.error("Error adding reply:", error);
    alert("An error occurred while adding the reply.");
  }
}

/**
 * Delete a reply (sub-document) from a post
 * @param {String} postId 
 * @param {String} replyId 
 */
async function deleteReply(postId, replyId) {
  try {
    const response = await fetch(`/api/posts/${postId}/replies/${replyId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove the reply from the DOM
      document.getElementById(`reply-${replyId}`).remove();
      alert("Reply deleted successfully.");
    } else {
      const error = await response.json();
      alert(`Error deleting reply: ${error.error}`);
    }
  } catch (err) {
    console.error("Error deleting reply:", err);
    alert("An unexpected error occurred while deleting the reply.");
  }
}

/**
 * Helper function to create the reply HTML markup
 * @param {Object} reply - The reply object from the server
 * @param {String} postId - The parent post's ID
 * @returns {String} The HTML string for this reply
 */
function createReplyHTML(reply, postId) {
  const replyTime = new Date(reply.timestamp).toLocaleString();
  const canDelete = (loggedInUser === reply.author);

  return `
    <div class="reply" id="reply-${reply._id}">
      <p>${reply.content}</p>
      <div class="reply-meta">
        <span>Posted by <strong>${reply.author}</strong> on ${replyTime}</span>
        ${
          canDelete
            ? `<button class="delete-reply" onclick="deleteReply('${postId}', '${reply._id}')">
                 <i class="fas fa-trash"></i> Delete
               </button>`
            : ""
        }
      </div>
    </div>
  `;
}

/*****************************************************
 * 7. MODAL HANDLING (OPEN/CLOSE NEW POST MODAL)
 *****************************************************/

createPostButton.addEventListener("click", () => {
  newPostModal.style.display = "block";
});

/**
 * Close the new post modal
 */
function closeModal() {
  newPostModal.style.display = "none";
}
