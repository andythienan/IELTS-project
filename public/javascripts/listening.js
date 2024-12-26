/*************************************************
 * 1. GLOBAL VARIABLES & DOM ELEMENTS
 *************************************************/
const audioPlayer      = document.getElementById("audio-player");
const playAudioButton  = document.getElementById("play-audio-btn");
const timerEl          = document.getElementById("timer");
const questionsContainer = document.getElementById("questions-list");
const notificationEl   = document.getElementById("notification");
const audioSourceEl    = document.getElementById("audio-source");

let timerInterval      = null;
let audioStarted       = false;
let timeRemaining      = 0;
let testData           = null;
let shuffledQuestions  = [];

/*************************************************
 * 2. FETCH & INITIALIZE LISTENING TEST
 *************************************************/

/**
 * Fetch test data from server
 * - Sets up audio source
 * - Displays questions
 * - Sets up onloadedmetadata callback for timer
 */
async function fetchTestData() {
  try {
    console.log("Fetching test data for testId:", testId);
    const response = await fetch(`/listening/api/${testId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    testData = await response.json();
    console.log("Test data fetched:", testData);

    // Set audio source and load audio
    audioSourceEl.src = testData.audioSource;
    audioPlayer.load();

    // Display questions in DOM
    displayQuestions();

    // Once audio metadata is loaded, set up the timer
    audioPlayer.onloadedmetadata = () => {
      const audioDuration = getAudioDuration(testData.audioSource);
      setTimer(audioDuration);
    };
  } catch (error) {
    console.error("Failed to fetch listening test data:", error);
  }
}

/*************************************************
 * 3. AUDIO & TIMER LOGIC
 *************************************************/

/**
 * Determine how long the audio is (override if you want to calculate dynamically)
 * @param {String} source - Path/URL to the audio file
 * @returns {Number} Duration in seconds
 */
function getAudioDuration(source) {
  // Hard-coded durations; adjust as needed
  switch (source) {
    case "/files/listening_audio/listening1.mp3":
      return 286;
    case "/files/listening_audio/listening2.mp3":
      return 316;
    case "/files/listening_audio/listening3.mp3":
      return 256;
    default:
      return 0;
  }
}

/**
 * Sets up the total time: audio duration + review time
 * @param {Number} audioDuration
 */
function setTimer(audioDuration) {
  const reviewDuration = 60; // 1 min review
  timeRemaining = audioDuration + reviewDuration;
  timerEl.textContent = "00:00"; // initial display
}

/**
 * Update timer every second
 * - When time’s up, automatically submits
 */
function updateTimer() {
  if (timeRemaining > 0) {
    timeRemaining--;

    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
    const seconds = String(timeRemaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;

    // 1-minute left notification
    if (timeRemaining === 60) {
      notificationEl.textContent =
        "Audio finished. You have 1 minute to check your answer!";
      notificationEl.style.display = "block";
    }
  } else {
    clearInterval(timerInterval);
    handleSubmit(); // auto-submit when timer hits 0
  }
}

/**
 * Starts the timer (called once audio actually starts)
 */
function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

/*************************************************
 * 4. QUESTIONS & USER SELECTIONS
 *************************************************/

/**
 * Shuffle the questions array
 * (This also keeps track of the original index so we can compare later)
 * @param {Array} questions
 * @returns {Array} shuffled array
 */
function shuffleQuestions(questions) {
  if (!questions || questions.length === 0) {
    console.log("Invalid questions: ", questions);
    return [];
  }

  const indices = Array
    .from({ length: questions.length }, (_, i) => i)
    .sort(() => Math.random() - 0.5);

  shuffledQuestions = indices.map((i) => ({
    ...questions[i],
    originalIndex: i,
  }));
  return shuffledQuestions;
}

/**
 * Display all questions in the DOM (randomized)
 */
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
            .map(
              (choice) => `
                <div
                  class="choice"
                  data-question="${index}"
                  data-choice="${choice}"
                >
                  ${choice}
                </div>
              `
            )
            .join("")}
        </div>
      `;
    } else if (question.type === "fill-in-the-blank") {
      questionDiv.innerHTML = `
        <p class="question-text">${question.question}</p>
        <input
          type="text"
          class="fill-blank"
          data-question="${index}"
          placeholder="Type your answer here"
        />
      `;
    }

    questionsContainer.appendChild(questionDiv);
  });

  // Add event listeners to each multiple-choice option
  document.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", handleChoiceSelection);
  });
}

/**
 * Mark a choice as selected (radio-like behavior but with divs)
 */
function handleChoiceSelection(event) {
  const selectedChoice = event.target;
  const questionIndex  = selectedChoice.dataset.question;

  // Remove 'selected' from all choices in that question
  document
    .querySelectorAll(`.choice[data-question="${questionIndex}"]`)
    .forEach((choice) => {
      choice.classList.remove("selected");
    });

  // Mark the clicked choice as selected
  selectedChoice.classList.add("selected");
}

/*************************************************
 * 5. AUDIO START & SUBMIT LOGIC
 *************************************************/

/**
 * Start the audio playback and timer
 */
function startAudio() {
  audioPlayer
    .play()
    .then(() => {
      audioStarted = true;
      notificationEl.textContent = "Audio started. Listen carefully!";
      notificationEl.style.display = "block";
      playAudioButton.style.display = "none";

      // Start countdown
      startTimer();
    })
    .catch((error) => {
      console.error("Audio playback failed:", error);
      notificationEl.textContent =
        "Unable to play audio. Please ensure your browser allows audio playback.";
      notificationEl.style.display = "block";
    });
}

/**
 * Handle final quiz submission:
 * - Collect user answers
 * - Compare to correct answers
 * - Display result & send to server
 */
async function handleSubmit() {
  clearInterval(timerInterval);

  // Build the userResponses array
  const userResponses = shuffledQuestions.map((question, index) => {
    let userAnswer = null;
    const originalQuestion = testData.questions[question.originalIndex];

    // multiple-choice or T/F/NG
    if (question.type === "multiple-choice" || question.type === "t-f-ng") {
      const selectedChoice = document.querySelector(
        `.choice[data-question="${index}"].selected`
      );
      userAnswer = selectedChoice ? selectedChoice.dataset.choice : "Not answered";
    }
    // fill-in-the-blank
    else if (question.type === "fill-in-the-blank") {
      const inputField = document.querySelector(
        `.fill-blank[data-question="${index}"]`
      );
      userAnswer = inputField ? inputField.value.trim() : "Not answered";
    }

    // Simple normalization for comparison
    const normalizeText = (text) => text?.toLowerCase().trim();
    const normalizedUserAnswer    = normalizeText(userAnswer);
    const normalizedCorrectAnswer = normalizeText(originalQuestion.answer);

    return {
      question: originalQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: originalQuestion.answer,
      isCorrect: normalizedUserAnswer === normalizedCorrectAnswer,
    };
  });

  // Calculate score
  const score      = userResponses.filter((r) => r.isCorrect).length;
  const total      = testData.questions.length;
  const percentage = ((score / total) * 100).toFixed(2);

  // Display result to user
  notificationEl.textContent = `Quiz submitted! Score: ${score}/${total} (${percentage}%)`;
  notificationEl.style.display = "block";

  // Build object to send to server
  const quizResponseData = {
    userId: loggedInUserId, 
    quizId: testId,
    questions: userResponses,
    score: score,
    percentage: percentage,
    audioFile: testData.audioSource, 
  };

  // Send quiz results to server
  try {
    const response = await fetch("/listening/submit-quiz", {
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

  // Redirect after short delay
  setTimeout(() => {
    window.location.href = "/library?type=exam";
  }, 5000);
}

/*************************************************
 * 6. EVENT LISTENERS & INIT
 *************************************************/
playAudioButton.addEventListener("click", startAudio);

// Fetch test data on page load
fetchTestData();
