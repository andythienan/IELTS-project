const audioPlayer = document.getElementById("audio-player");
const playAudioButton = document.getElementById("play-audio-btn");
const timerEl = document.getElementById("timer");
const questionsContainer = document.getElementById("questions-list");
const notificationEl = document.getElementById("notification");

let timerInterval;
let audioStarted = false;
let timeRemaining = 0;

const audioDuration = 316; // Duration of the audio in seconds
const reviewDuration = 60; // Time for reviewing answers in seconds
const totalTime = audioDuration + reviewDuration;


// Update Timer
function updateTimer() {
  if (timeRemaining > 0) {
    timeRemaining--;
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
    const seconds = String(timeRemaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;

    if (timeRemaining <= reviewDuration) {
      notificationEl.textContent = "Audio finished. You have 1 minute to check your answer!";
      notificationEl.style.display = "block";
    }
  } else {
    clearInterval(timerInterval);
    handleSubmit(); // Automatically submit when timer ends
  }
}

// Start Timer
function startTimer() {
  timeRemaining = totalTime;
  timerEl.textContent = "00:00";
  timerInterval = setInterval(updateTimer, 1000);
}

let shuffledQuestions = []; // Global to retain shuffled order for later validation

function shuffleQuestions(questions) {
  // Create an array of indices and shuffle them
  const indices = Array.from({ length: questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);

  // Map shuffled indices to questions
  shuffledQuestions = indices.map((i) => ({
    ...questions[i],
    originalIndex: i, // Keep track of the original index
  }));

  return shuffledQuestions;
}


// Display Questions
function displayQuestions() {
  questionsContainer.innerHTML = ""; // Clear existing questions

  // Shuffle the questions before displaying
  const randomizedQuestions = shuffleQuestions([...questions]);

  randomizedQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    // Generate the question HTML based on the type
    if (question.type === "multiple-choice") {
      questionDiv.innerHTML = `
        <p class="question-text">${question.question}</p>
        <div class="choices">
          ${question.options
            .map(
              (choice) =>
                `<div class="choice" data-question="${index}" data-choice="${choice}">${choice}</div>`
            )
            .join("")}
        </div>
      `;
    } else if (question.type === "t-f-ng") {
      questionDiv.innerHTML = `
        <p class="question-text">${question.question}</p>
        <div class="choices">
          ${question.options
            .map(
              (choice) =>
                `<div class="choice" data-question="${index}" data-choice="${choice}">${choice}</div>`
            )
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

  // Add event listeners for multiple-choice and T-F-NG selections
  document.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", handleChoiceSelection);
  });
}

// Handle Choice Selection
function handleChoiceSelection(event) {
  const selectedChoice = event.target;
  const questionIndex = selectedChoice.dataset.question;

  // Clear previous selection
  document
    .querySelectorAll(`.choice[data-question="${questionIndex}"]`)
    .forEach((choice) => {
      choice.classList.remove("selected");
    });

  // Mark the clicked choice as selected
  selectedChoice.classList.add("selected");
}

// Start Audio and Display Questions
function startAudio() {
  audioPlayer
    .play()
    .then(() => {
      audioStarted = true;

      // Notify user
      notificationEl.textContent = "Audio started. Listen carefully!";
      notificationEl.style.display = "block";

      // Hide the play button
      playAudioButton.style.display = "none";

      // Start the timer and display randomized questions
      startTimer();
      displayQuestions();
    })
    .catch((error) => {
      console.error("Audio playback failed:", error);
      notificationEl.textContent =
        "Unable to play audio. Please ensure your browser allows audio playback.";
      notificationEl.style.display = "block";
    });
}

// Handle Submit
async function handleSubmit() {
  clearInterval(timerInterval);

  // Match responses using the shuffled order
  const userResponses = shuffledQuestions.map((question, index) => {
    let userAnswer = null;

    if (question.type === "multiple-choice" || question.type === "t-f-ng") {
      const selectedChoice = document.querySelector(`.choice[data-question="${index}"].selected`);
      userAnswer = selectedChoice ? selectedChoice.dataset.choice : "Not answered";
    } else if (question.type === "fill-in-the-blank") {
      const inputField = document.querySelector(`.fill-blank[data-question="${index}"]`);
      userAnswer = inputField ? inputField.value.trim() : "Not answered";
    }

    // Validate against the original question's answer
    const originalQuestion = questions[question.originalIndex];
    return {
      question: originalQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: originalQuestion.answer,
      isCorrect: (() => {
        const normalizeText = (text) =>
          text?.toLowerCase().replace(/\s+/g, " ").trim();
      
        const normalizedUserAnswer = normalizeText(userAnswer);
        const normalizedCorrectAnswer = normalizeText(question.answer);
      
        console.log(`Question: ${question.question}`);
        console.log(`User Answer: '${userAnswer}'`);
        console.log(`Correct Answer: '${question.answer}'`);
        console.log(`Normalized User Answer: '${normalizedUserAnswer}'`);
        console.log(`Normalized Correct Answer: '${normalizedCorrectAnswer}'`);
        console.log(`Is Correct: ${normalizedUserAnswer === normalizedCorrectAnswer}`);
      
        return normalizedUserAnswer === normalizedCorrectAnswer;
      })()
    };
  });

  // Calculate score and percentage
  const score = userResponses.filter((response) => response.isCorrect).length;
  const percentage = ((score / questions.length) * 100).toFixed(2);

  // Display notification to the user
  notificationEl.textContent = `Quiz submitted! Score: ${score}/${questions.length} (${percentage}%)`;
  notificationEl.style.display = "block";

  // Send quiz data to the server
  const quizResponseData = {
    userId: loggedInUserId, // Pass the user's ID
    quizId: "listening-quiz-2",// Pass the current quiz ID
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

  // Redirect to the exam library after a delay
  setTimeout(() => {
    window.location.href = "/exam-library";
  }, 5000);
}


// Add event listener to the play button
playAudioButton.addEventListener("click", startAudio);
