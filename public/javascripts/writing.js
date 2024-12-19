let currentTaskIndex = 0;
let wordCount = 0;
let timerInterval;
let timeRemaining = 1500; // 25 minutes in seconds
let writingTasks = []; // Store fetched writing tasks

const taskInstructionsEl = document.getElementById("task-instructions");
const responseInputEl = document.getElementById("response-input");
const wordCountEl = document.getElementById("word-count");
const timerEl = document.getElementById("timer");
const submitButton = document.getElementById("submit-writing");
const notificationEl = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");
const imageContainerEl = document.getElementById("image-container");


function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // Automatically submit when time runs out
  } else {
    timeRemaining--;
  }
}

function startTimer() {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

async function fetchWritingTasks() {
    try {
       const response = await fetch(`/api/writing-task/${taskId}`);
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }
         writingTasks = await response.json();
         loadTask(currentTaskIndex);

    } catch (error) {
        console.error("Failed to fetch writing task data:", error);
        // Handle the error, e.g., show a message to the user
    }
}

function loadTask(index) {
    if (!writingTasks || writingTasks.length === 0) return;

  const taskData = writingTasks[index];
    taskInstructionsEl.textContent = taskData.task;
    responseInputEl.value = ""; // Clear previous response
    
     // Display the image
    if (taskData.image) {
       imageContainerEl.innerHTML = `<img src="${taskData.image}" alt="Task Image">`;
     } else {
        imageContainerEl.innerHTML = ""; // Clear any previous image
   }
   updateWordCount();
   submitButton.disabled = true; // Disable submit until response is provided
}

function updateWordCount() {
  const text = responseInputEl.value.trim();
  wordCount = text === "" ? 0 : text.split(/\s+/).length;
  wordCountEl.textContent = wordCount;

  // Enable submit button if word count is above a minimum threshold
  submitButton.disabled = wordCount < 50; // Adjust minimum word count as needed
}

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
       const response = await fetch("/submit-writing", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
            body: JSON.stringify(userResponse),
        });

        if (response.ok) {
         console.log("Writing test submitted successfully.");

            // Clear the response input field after successful submission
            responseInputEl.value = "";
           updateWordCount(); // Update word count (should be 0 now)

            // Optionally, display a success message in the notification
            // (You might want to customize this message)
            notificationEl.innerHTML = "Writing test submitted successfully! Redirecting...";
            notificationEl.style.display = "block";

        } else {
            console.error("Failed to submit writing test.");

            // Optionally, display an error message in the notification
            notificationEl.innerHTML = "Failed to submit writing test. Please try again.";
           notificationEl.style.display = "block";
        }
    } catch (error) {
    console.error("Error submitting writing test:", error);

    // Display an error message in the notification
       notificationEl.innerHTML = "Error submitting writing test. Please check your connection.";
       notificationEl.style.display = "block";
    }

   // Redirect to the exam library after a delay (only if submission was successful)
   setTimeout(() => {
        window.location.href = "/library?type=exam";
    }, 5000);
}
responseInputEl.addEventListener("input", updateWordCount);
submitButton.addEventListener("click", handleSubmit);
closeNotificationButton.addEventListener("click", () => notificationEl.style.display = "none");

fetchWritingTasks();
startTimer();