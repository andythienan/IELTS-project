// listening.js
const audioPlayer = document.getElementById("audio-player");
const playAudioButton = document.getElementById("play-audio-btn");
const timerEl = document.getElementById("timer");
const questionsContainer = document.getElementById("questions-list");
const notificationEl = document.getElementById("notification");
const audioSourceEl = document.getElementById("audio-source");

let timerInterval;
let audioStarted = false;
let timeRemaining = 0;
let testData = null;
let shuffledQuestions = [];

async function fetchTestData() {
  try {
    console.log("Fetching test data for testId:", testId);
    const response = await fetch(`/api/listening-test/${testId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    testData = await response.json();
    console.log("Test data fetched:", testData);

    // Set audio source and load
    audioSourceEl.src = testData.audioSource;
    audioPlayer.load();

    // Display questions immediately
    displayQuestions();

    // Once metadata is loaded (length known), set timer
    audioPlayer.onloadedmetadata = () => {
      const audioDuration = getAudioDuration(testData.audioSource);
      setTimer(audioDuration);
    };
  } catch (error) {
    console.error("Failed to fetch listening test data:", error);
  }
}

function getAudioDuration(source) {
  // Adjust durations as needed
  switch (source) {
    case "/files/listening_audio/listening1.mp3":
      return 316;
    case "/files/listening_audio/listening2.mp3":
      return 250;
    case "/files/listening_audio/listening3.mp3":
      return 316;
    default:
      return 0;
  }
}

function setTimer(audioDuration) {
  const reviewDuration = 60; // 1 min review
  const totalTime = audioDuration + reviewDuration;
  timeRemaining = totalTime;
  timerEl.textContent = "00:00";
}

function updateTimer() {
  if (timeRemaining > 0) {
    timeRemaining--;
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
    const seconds = String(timeRemaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;

    if (timeRemaining === 60) {
      notificationEl.textContent = "Audio finished. You have 1 minute to check your answer!";
      notificationEl.style.display = "block";
    }
  } else {
    clearInterval(timerInterval);
    handleSubmit();
  }
}

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function shuffleQuestions(questions) {
  if (!questions || questions.length === 0) {
    console.log("Invalid questions: ", questions);
    return [];
  }
  const indices = Array.from({ length: questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
  shuffledQuestions = indices.map((i) => ({
    ...questions[i],
    originalIndex: i,
  }));
  return shuffledQuestions;
}

function displayQuestions() {
  if (!testData || !testData.questions) {
    console.error("No test data or questions to display.");
    return;
  }
  questionsContainer.innerHTML = "";

  const randomizedQuestions = shuffleQuestions([...testData.questions]);
  console.log("Randomized questions: ", randomizedQuestions);

  randomizedQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    if (question.type === "multiple-choice" || question.type === "t-f-ng") {
      questionDiv.innerHTML = `
        <p class="question-text">${question.question}</p>
        <div class="choices">
          ${question.options
            .map((choice) => `<div class="choice" data-question="${index}" data-choice="${choice}">${choice}</div>`)
            .join("")}
        </div>
      `;
    } else if (question.type === "fill-in-the-blank") {
      questionDiv.innerHTML = `
        <p class="question-text">${question.question}</p>
        <input type="text" class="fill-blank" data-question="${index}" placeholder="Type your answer here" />
      `;
    }
    questionsContainer.appendChild(questionDiv);
  });

  document.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", handleChoiceSelection);
  });
}

function handleChoiceSelection(event) {
  const selectedChoice = event.target;
  const questionIndex = selectedChoice.dataset.question;
  document.querySelectorAll(`.choice[data-question="${questionIndex}"]`).forEach((choice) => {
    choice.classList.remove("selected");
  });
  selectedChoice.classList.add("selected");
}

function startAudio() {
  audioPlayer.play().then(() => {
    audioStarted = true;
    notificationEl.textContent = "Audio started. Listen carefully!";
    notificationEl.style.display = "block";
    playAudioButton.style.display = "none";
    startTimer();
  }).catch((error) => {
    console.error("Audio playback failed:", error);
    notificationEl.textContent =
      "Unable to play audio. Please ensure your browser allows audio playback.";
    notificationEl.style.display = "block";
  });
}

async function handleSubmit() {
  clearInterval(timerInterval);
  const userResponses = shuffledQuestions.map((question, index) => {
    let userAnswer = null;
    const originalQuestion = testData.questions[question.originalIndex];

    if (question.type === "multiple-choice" || question.type === "t-f-ng") {
      const selectedChoice = document.querySelector(`.choice[data-question="${index}"].selected`);
      userAnswer = selectedChoice ? selectedChoice.dataset.choice : "Not answered";
    } else if (question.type === "fill-in-the-blank") {
      const inputField = document.querySelector(`.fill-blank[data-question="${index}"]`);
      userAnswer = inputField ? inputField.value.trim() : "Not answered";
    }

    const normalizeText = (text) => text?.toLowerCase().trim();
    const normalizedUserAnswer = normalizeText(userAnswer);
    const normalizedCorrectAnswer = normalizeText(originalQuestion.answer);

    return {
      question: originalQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: originalQuestion.answer,
      isCorrect: normalizedUserAnswer === normalizedCorrectAnswer,
    };
  });

  const score = userResponses.filter((r) => r.isCorrect).length;
  const percentage = ((score / testData.questions.length) * 100).toFixed(2);

  notificationEl.textContent = `Quiz submitted! Score: ${score}/${testData.questions.length} (${percentage}%)`;
  notificationEl.style.display = "block";

  const quizResponseData = {
    userId: loggedInUserId,
    quizId: testId,
    questions: userResponses,
    score: score,
    percentage: percentage,
  };

  try {
    const response = await fetch("/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizResponseData),
    });

    if (!response.ok) {
      console.error("Failed to send quiz data to server.");
    }
  } catch (error) {
    console.error("Error sending quiz data to server:", error);
  }

  setTimeout(() => {
    window.location.href = "/library?type=exam";
  }, 5000);
}

playAudioButton.addEventListener("click", startAudio);
fetchTestData();
