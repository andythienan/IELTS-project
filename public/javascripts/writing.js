/******************************************************
 * 1. GLOBAL VARIABLES & DOM ELEMENTS
 ******************************************************/
let currentTaskIndex = 0;
let wordCount = 0;
let timerInterval;
let timeRemaining = 1500; // 25 minutes (in seconds)
let writingTasks = []; // Will store fetched writing tasks

// DOM references
const taskInstructionsEl = document.getElementById("task-instructions");
const responseInputEl     = document.getElementById("response-input");
const wordCountEl         = document.getElementById("word-count");
const timerEl             = document.getElementById("timer");
const submitButton        = document.getElementById("submit-writing");
const notificationEl      = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");
const imageContainerEl    = document.getElementById("image-container");

/******************************************************
 * 2. TIMER LOGIC
 ******************************************************/
/**
 * Update the countdown every second.
 * Submits automatically when time is up.
 */
function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // auto-submit
  } else {
    timeRemaining--;
  }
}

/**
 * Start the countdown timer.
 */
function startTimer() {
  updateTimer(); // Update immediately to avoid the initial 1-second delay
  timerInterval = setInterval(updateTimer, 1000);
}

/******************************************************
 * 3. FETCH WRITING TASKS
 ******************************************************/
/**
 * Fetch the writing tasks from the server (by taskId).
 */
async function fetchWritingTasks() {
  try {
    const response = await fetch(`/writing/api/${taskId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    writingTasks = await response.json();
    loadTask(currentTaskIndex);

  } catch (error) {
    console.error("Failed to fetch writing task data:", error);
    // Optionally display a user-facing error message
  }
}

/******************************************************
 * 4. LOADING & DISPLAYING A TASK
 ******************************************************/
/**
 * Load a specific writing task by index, update the DOM.
 * @param {Number} index - Index of the task in writingTasks
 */
function loadTask(index) {
  if (!writingTasks || writingTasks.length === 0) return;

  const taskData = writingTasks[index];
  taskInstructionsEl.textContent = taskData.task;
  responseInputEl.value = ""; // Clear any previous response

  // Display the image (if present)
  if (taskData.image) {
    imageContainerEl.innerHTML = `<img src="${taskData.image}" alt="Task Image">`;
  } else {
    imageContainerEl.innerHTML = ""; // Clear if no image
  }

  // Update word count and disable submit until user types enough
  updateWordCount();
  submitButton.disabled = true;
}

/******************************************************
 * 5. WORD COUNT & TEXT MONITORING
 ******************************************************/
/**
 * Count words in the response text, display them, and enable/disable submit.
 */
function updateWordCount() {
  const text = responseInputEl.value.trim();
  wordCount = text === "" ? 0 : text.split(/\s+/).length;
  wordCountEl.textContent = wordCount;

  // Enable the submit button only if word count meets minimum (example: 50)
  submitButton.disabled = wordCount < 50;
}

/******************************************************
 * 6. SUBMISSION LOGIC
 ******************************************************/
/**
 * Submit the current writing task to the server.
 * Also handles redirecting after submission or upon timeout.
 */
async function handleSubmit() {
  clearInterval(timerInterval);

  const userResponse = {
    task: writingTasks[currentTaskIndex].task,
    response: responseInputEl.value,
    wordCount: wordCount,
  };

  console.log("User Response:", userResponse);
  notificationEl.style.display = "block";

  // Send the response to the server
  try {
    const response = await fetch("/writing/submit-writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userResponse),
    });

    if (response.ok) {
      console.log("Writing test submitted successfully.");

      // Clear the input and reset word count
      responseInputEl.value = "";
      updateWordCount(); // Should now be 0

      // Show success message
      notificationEl.innerHTML = "Writing test submitted successfully! Redirecting...";
      notificationEl.style.display = "block";
    } else {
      console.error("Failed to submit writing test.");
      notificationEl.innerHTML = "Failed to submit writing test. Please try again.";
      notificationEl.style.display = "block";
    }
  } catch (error) {
    console.error("Error submitting writing test:", error);
    notificationEl.innerHTML = "Error submitting writing test. Please check your connection.";
    notificationEl.style.display = "block";
  }

  // Redirect to exam library after short delay (regardless of success/failure)
  setTimeout(() => {
    window.location.href = "/library?type=exam";
  }, 5000);
}

/******************************************************
 * 7. EVENT LISTENERS
 ******************************************************/
responseInputEl.addEventListener("input", updateWordCount);
submitButton.addEventListener("click", handleSubmit);

closeNotificationButton.addEventListener("click", () => {
  notificationEl.style.display = "none";
});

/******************************************************
 * 8. INIT: FETCH DATA & START TIMER
 ******************************************************/
fetchWritingTasks();
startTimer();
