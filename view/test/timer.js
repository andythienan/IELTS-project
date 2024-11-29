// Set the initial time in minutes (e.g., 30 minutes)
let timerDuration = 30 * 60; // 30 minutes in seconds

// Select the timer element
const timerElement = document.getElementById("timer");

// Function to format time as MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Function to start the timer
function startCountdown(duration) {
  let timeLeft = duration;

  const countdownInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdownInterval); // Stop the timer
      timerElement.textContent = "00:00";
      alert("Time is up!"); // Trigger an alert or custom action
    } else {
      timerElement.textContent = formatTime(timeLeft); // Update timer display
      timeLeft--;
    }
  }, 1000); // Update every second
}

// Start the countdown
startCountdown(timerDuration);
