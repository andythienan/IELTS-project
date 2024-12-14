const audioPlayer = document.getElementById("audio-player");
const questionsContainer = document.getElementById("questions-container");
const timerEl = document.getElementById("timer");
const notificationEl = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");

let timerInterval;
let audioStarted = false;
let questionsDisplayed = false;
let reviewTimeStarted = false;
let timeRemaining; // Overall time (audio + review)

const preparationDuration = 10; // 10 seconds for preparation
const audioDuration = 286; // Placeholder for actual audio duration
const reviewDuration = 60; // 1 minute in seconds for review

const questions = [
  {
    "question": "Why did the speakers decide to prioritize candidates from the business faculty over other faculties?",
    "options": [
      "They have more experience than candidates from other faculties.",
      "They possess advanced computer knowledge required for the role.",
      "They are more creative and suited for leadership roles.",
      "They have demonstrated superior English proficiency."
    ],
    "answer": "They have more experience than candidates from other faculties."
  },
  {
    "question": "What is the main drawback identified for Steven as a potential candidate?",
    "options": [
      "He has a problem with alcohol consumption.",
      "He expresses intentions to leave the institution for overseas opportunities.",
      "His lack of qualifications compared to others makes him unsuitable.",
      "His attitude toward leisure clashes with the role's demands."
    ],
    "answer": "He expresses intentions to leave the institution for overseas opportunities."
  },
  {
    "question": "What concern is raised about Abdul, despite his strong qualifications?",
    "options": [
      "His broken English sometimes leads to miscommunication.",
      "He lacks motivation to work overtime or handle tough situations.",
      "His academic qualifications are not recognized locally.",
      "He has expressed dissatisfaction with his current role."
    ],
    "answer": "His broken English sometimes leads to miscommunication."
  },
  {
    "question": "Why is Oscar’s candidacy questioned, even though he is stable and has a good attitude?",
    "options": [
      "He is perceived as too old, with age-related health concerns.",
      "His qualifications are not relevant to the responsibilities of the position.",
      "His language skills are insufficient for effective communication.",
      "He lacks sufficient experience compared to other candidates."
    ],
    "answer": "He is perceived as too old, with age-related health concerns."
  },
  // More questions here
];

function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;

  // Adjust styling for review time
  if (reviewTimeStarted) {
    timerEl.style.color = "red";
  } else {
    timerEl.style.color = "black";
  }

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // Submit when overall time is up
  } else {
    timeRemaining--;

    if (!questionsDisplayed && timeRemaining <= reviewDuration + audioDuration) {
      // Display questions immediately after preparation
      displayQuestions();
      questionsDisplayed = true;
    }

    if (audioStarted && !reviewTimeStarted && timeRemaining <= reviewDuration) {
      // Start review time (display notification)
      notificationEl.textContent = "Audio finished. You have 1 minute to check your answers.";
      notificationEl.style.display = "block";
      reviewTimeStarted = true;
    }
  }
}

function startTimer() {
  // Calculate total time (prep + audio + review)
  timeRemaining = preparationDuration + audioDuration + reviewDuration;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function displayQuestions() {
  questionsContainer.style.display = "block";

  // Clear any existing questions to prevent duplication
  questionsContainer.innerHTML = "";

  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `
      <p class="question-text">${question.question}</p>
      <div class="choices">
        ${question.options
          .map(
            (choice) => `
            <div class="choice" data-question="${index}" data-choice="${choice}">${choice}</div>
          `
          )
          .join("")}
      </div>
    `;
    questionsContainer.appendChild(questionDiv);

    // Restore previously selected choice if exists
    const previousSelection = localStorage.getItem(`question-${index}`);
    if (previousSelection) {
      const matchingChoice = questionDiv.querySelector(`.choice[data-choice="${previousSelection}"]`);
      if (matchingChoice) matchingChoice.classList.add("selected");
    }
  });

  questionsContainer.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", handleChoiceSelection);
  });
}

function handleChoiceSelection(event) {
  const selectedChoice = event.target;
  const questionIndex = selectedChoice.dataset.question;

  questionsContainer
    .querySelectorAll(`.choice[data-question="${questionIndex}"]`)
    .forEach((choice) => {
      choice.classList.remove("selected");
    });

  selectedChoice.classList.add("selected");

  // Save the selected choice to localStorage
  localStorage.setItem(`question-${questionIndex}`, selectedChoice.dataset.choice);
}

async function handleSubmit() {
  clearInterval(timerInterval);

  // Extract user answers:
  const userResponses = questions.map((question, index) => {
    const selectedChoice = document.querySelector(
      `.choice[data-question="${index}"].selected`
    );
    const userAnswer = selectedChoice
      ? selectedChoice.dataset.choice
      : "Not answered";
    return {
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.answer,
      isCorrect: userAnswer === question.answer,
    };
  });

  // Calculate score and percentage
  let score = userResponses.filter((res) => res.isCorrect).length;
  const percentage = ((score / questions.length) * 100).toFixed(2);

  // Update notification text
  notificationEl.textContent = `Quiz submitted! Score: ${score}/${questions.length} (${percentage}%)`;
  notificationEl.style.display = "block";

  // Prepare the data to send to the server
  const quizResponseData = {
    userId: "", // Add user ID if available
    quizId: "listening-quiz-1",
    questions: userResponses,
    score: score,
    percentage: percentage,
  };

  // Send data to server
  fetch("/submit-quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quizResponseData),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Quiz data sent to server successfully.");
      } else {
        console.error("Failed to send quiz data to server.");
      }
    })
    .catch((error) => {
      console.error("Error sending quiz data to server:", error);
    });

  // Redirect after a delay
  setTimeout(() => {
    window.location.href = "/exam-library";
  }, 5000);
}

window.addEventListener("DOMContentLoaded", () => {
  // Hide questions initially
  questionsContainer.style.display = "none";

  // Start preparation timer
  notificationEl.textContent = "Get ready! Your test will start in 10 seconds.";
  notificationEl.style.display = "block";

  setTimeout(() => {
    displayQuestions(); // Show questions after preparation time
    notificationEl.textContent = "Audio started. You can now answer the questions.";
    audioPlayer.style.display = "block";
    audioPlayer.play();
    audioStarted = true;
    startTimer(); // Start the timer when preparation time ends
  }, preparationDuration * 1000);

  closeNotificationButton.addEventListener(
    "click",
    () => (notificationEl.style.display = "none")
  );
});
