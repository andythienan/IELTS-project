let currentQuestionIndex = 0;
const userAnswers = [];
let notes = [];
let timerInterval;
let timeRemaining = 1200; // 20 minutes in seconds

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");
const submitButton = document.getElementById("submit-quiz");
const questionCounterEl = document.getElementById("question-counter");
const timerEl = document.getElementById("timer");
const notificationEl = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");
const audioPlayer = document.getElementById("audio-player");
if (audioPlayer) {
  audioPlayer.addEventListener("play", () => {
    audioPlayer.controls = false; // Ensure this isn't hiding the player prematurely
  });
}

// Restrict replay and mid-play stoppage for the audio player
audioPlayer.addEventListener("play", () => {
  audioPlayer.controls = false; // Disable controls after play starts
});
audioPlayer.addEventListener("ended", () => {
  audioPlayer.controls = false; // Keep controls disabled after playback
});

// Function to update and display the timer
function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const secs = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${secs}`;

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // Automatically submit when time runs out
  } else {
    timeRemaining--;
  }
}

// Start the timer when the quiz loads
function startTimer() {
  updateTimer(); // Update immediately to avoid 1-second delay
  timerInterval = setInterval(updateTimer, 1000);
}

function loadQuestion(index) {
  const data = quizData[index];
  questionEl.textContent = data.question;
  optionsEl.innerHTML = "";

  // Set up the multi-answer options
  data.options.forEach((option, i) => {
    const optionEl = document.createElement("div");
    optionEl.textContent = option;
    optionEl.className = "choice-box";
    optionEl.addEventListener("click", () => selectAnswer(i));
    if (userAnswers[index] === i) {
      optionEl.classList.add("selected");
    }
    optionsEl.appendChild(optionEl);
  });

  questionCounterEl.textContent = `Question ${index + 1} of ${quizData.length}`;
  prevButton.disabled = index === 0;
  nextButton.disabled = index === quizData.length - 1;
  submitButton.disabled = true; // Keep submit disabled until all questions are answered
}

function selectAnswer(index) {
  userAnswers[currentQuestionIndex] = index;

  // Focus on the selected option for keyboard navigation
  optionsEl.querySelectorAll(".choice-box").forEach((option, i) => {
    option.classList.remove("selected");
    if (i === index) {
      option.classList.add("selected");
    }
  });

  // Enable submit button if all questions are answered
  submitButton.disabled = !isQuizComplete();
}

function isQuizComplete() {
  return (
    userAnswers.length === quizData.length &&
    userAnswers.every((a) => a !== undefined)
  );
}

function handleNavigation(offset) {
  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

async function handleSubmit() {
  clearInterval(timerInterval);
  const userResponses = quizData.map((question, index) => ({
    question: question.question,
    userAnswer: question.options[userAnswers[index]] || "Not answered",
    correctAnswer: question.answer,
    isCorrect: question.options[userAnswers[index]] === question.answer,
  }));

  let score = userResponses.filter((response) => response.isCorrect).length;
  const percentage = ((score / quizData.length) * 100).toFixed(2);

  notificationEl.textContent = `Quiz submitted! Score: ${score}/${quizData.length} (${percentage}%)`;
  notificationEl.style.display = "block";

  const quizResponseData = {
    userId: loggedInUserId,
    quizId: "listening-quiz-1",
    questions: userResponses,
    score: score,
    percentage: percentage,
  };

  try {
    const response = await fetch("/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizResponseData),
    });
    if (response.ok) {
      console.log("Quiz data sent to server successfully.");
    } else {
      console.error("Failed to send quiz data to server.");
    }
  } catch (error) {
    console.error("Error sending quiz data to server:", error);
  }

  setTimeout(() => {
    window.location.href = "/exam-library";
  }, 5000);
}

prevButton.addEventListener("click", () => handleNavigation(-1));
nextButton.addEventListener("click", () => handleNavigation(1));
submitButton.addEventListener("click", handleSubmit);
closeNotificationButton.addEventListener(
  "click",
  () => (notificationEl.style.display = "none")
);

startTimer();
loadQuestion(currentQuestionIndex);
