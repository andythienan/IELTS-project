// Variables
let currentQuestionIndex = 0;
const userAnswers = [];
let timerInterval;
let timeRemaining = 2400; // 20 minutes in seconds

// Audio and PDF Variables
const audioPlayer = document.getElementById("audio-player");
const audioSource = document.getElementById("audio-source");
const audioPlayerContainer = document.getElementById("audio-player-container");
const audioFiles = [
  "/files/listening_2.mp3",
  "/files/listening_2_2.mp3",
  "/files/listening_2_3.mp3",
  "/files/listening_2_4.mp3",
];
let currentAudioIndex = 0;

// DOM Elements
const timerEl = document.getElementById("timer");
const questionContainer = document.getElementById("question-container");
const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");
const submitButton = document.getElementById("submit-quiz");
const questionCounterEl = document.getElementById("question-counter");

// Question Data
const questionsTest2 = [
  // Section 1
  { type: "text", text: "1. Complete the notes: _______", correct: "club" },
  { type: "text", text: "2. Complete the notes: _______", correct: "male" },
  { type: "text", text: "3. Complete the notes: _______", correct: "drive" },
  { type: "text", text: "4. Complete the notes: _______", correct: "Tuesday" },
  { type: "text", text: "5. Complete the notes: _______", correct: "August" },
  { type: "text", text: "6. Complete the notes: _______", correct: "dinner" },
  { type: "text", text: "7. Complete the notes: _______", correct: "25" },
  { type: "text", text: "8. Complete the notes: _______", correct: "16" },
  { type: "text", text: "9. Complete the notes: _______", correct: "modern" },
  { type: "text", text: "10. Complete the notes: _______", correct: "hospital" },

  // Section 2
  { type: "choice", text: "11. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
  { type: "choice", text: "12. Choose the correct letter:", options: ["A", "B", "C"], correct: "A" },
  { type: "choice", text: "13. Choose the correct letter:", options: ["A", "B", "C"], correct: "B" },
  { type: "choice", text: "14. Choose the correct letter:", options: ["A", "B", "C"], correct: "A" },
  { type: "choice", text: "15. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "F" },
  { type: "choice", text: "16. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "C" },
  { type: "choice", text: "17. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "D" },
  { type: "choice", text: "18. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "E" },
  { type: "choice", text: "19. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "B" },
  { type: "choice", text: "20. Label the map: _______", options: ["A", "B", "C", "D", "E", "F"], correct: "A" },

  // Section 3
  { type: "choice", text: "21. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
  { type: "choice", text: "22. Choose the correct letter:", options: ["A", "B", "C"], correct: "A" },
  { type: "choice", text: "23. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
  { type: "choice", text: "24. Choose the correct letter:", options: ["A", "B", "C"], correct: "B" },
  { type: "choice", text: "25. Choose the correct letter:", options: ["A", "B", "C"], correct: "B" },
  { type: "choice", text: "26. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
  { type: "choice", text: "27. Choose TWO letters:", options: ["A", "B", "C", "D", "E", "F", "G"], correct: "F" },
  { type: "choice", text: "28. Choose TWO letters:", options: ["A", "B", "C", "D", "E", "F", "G"], correct: "E" },
  { type: "choice", text: "29. Choose TWO letters:", options: ["A", "B", "C", "D", "E", "F", "G"], correct: "D" },
  { type: "choice", text: "30. Choose TWO letters:", options: ["A", "B", "C", "D", "E", "F", "G"], correct: "G" },

  // Section 4
  { type: "text", text: "31. Complete the notes: _______", correct: "microscope" },
  { type: "text", text: "32. Complete the notes: _______", correct: "iron" },
  { type: "text", text: "33. Complete the notes: _______", correct: "chocolates" },
  { type: "text", text: "34. Complete the notes: _______", correct: "flavour" },
  { type: "text", text: "35. Complete the notes: _______", correct: "fertilisers" },
  { type: "text", text: "36. Complete the notes: _______", correct: "bacteria" },
  { type: "text", text: "37. Complete the notes: _______", correct: "drugs" },
  { type: "text", text: "38. Complete the notes: _______", correct: "silver" },
  { type: "text", text: "39. Complete the notes: _______", correct: "weight" },
  { type: "text", text: "40. Complete the notes: _______", correct: "radiation" },
];

// Initialize Timer
function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const secs = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${secs}`;
  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // Auto-submit when time runs out
  } else {
    timeRemaining--;
  }
}

function startTimer() {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// Load Question
function loadQuestion(index) {
  const question = questionsTest2[index];
  questionContainer.innerHTML = ""; // Clear previous question

  // Create question element
  const questionEl = document.createElement("div");
  questionEl.classList.add("question");
  questionEl.innerHTML = `<p>${question.text}</p>`;

  if (question.type === "text") {
    // Text input for answers
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("answer-box");
    input.dataset.question = index;
    input.value = userAnswers[index] || "";
    input.placeholder = "Your answer here";
    input.addEventListener("input", () => {
      userAnswers[index] = input.value;
    });
    questionEl.appendChild(input);
  } else if (question.type === "choice") {
    // Multiple-choice options
    const select = document.createElement("select");
    select.classList.add("answer-choice");
    select.dataset.question = index;
    select.innerHTML = `<option value="">Select your answer</option>`;
    question.options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option;
      optionEl.textContent = option;
      if (userAnswers[index] === option) optionEl.selected = true;
      select.appendChild(optionEl);
    });
    select.addEventListener("change", () => {
      userAnswers[index] = select.value;
    });
    questionEl.appendChild(select);
  }

  questionContainer.appendChild(questionEl);

  // Update navigation buttons and counter
  questionCounterEl.textContent = `Question ${index + 1} of ${questionsTest2.length}`;
  prevButton.disabled = index === 0;
  nextButton.disabled = index === questionsTest2.length - 1;
  submitButton.disabled = !isQuizComplete();
}

// Navigation
function handleNavigation(offset) {
  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

// Check if Quiz is Complete
function isQuizComplete() {
  return questionsTest2.every((_, index) => userAnswers[index] !== undefined);
}

// Submit Quiz
function handleSubmit() {
  clearInterval(timerInterval);

  // Evaluate answers
  const results = questionsTest2.map((q, index) => {
    const userAnswer = userAnswers[index];

    // Validation for multiple correct answers
    const isCorrect = Array.isArray(q.correct)
      ? Array.isArray(userAnswer)
        ? q.correct.sort().join(",") === userAnswer.sort().join(",") // For multiple-choice with multiple answers
        : q.correct.some((validAnswer) => validAnswer.toLowerCase() === userAnswer.toLowerCase()) // For text answers with multiple correct
      : userAnswer?.toLowerCase() === q.correct?.toLowerCase(); // Single correct answer

    return {
      question: q.text,
      userAnswer: userAnswer || "Not answered",
      correctAnswer: Array.isArray(q.correct) ? q.correct.join(", ") : q.correct,
      isCorrect,
    };
  });

  // Calculate score
  const score = results.filter((r) => r.isCorrect).length;
  const percentage = ((score / questionsTest2.length) * 100).toFixed(2);

  // Display submission notification
  alert(`Quiz submitted! Score: ${score}/${questionsTest2.length} (${percentage}%)`);

  // Log results (optional for debugging)
  console.log("Results:", results);

  // Redirect after 5 seconds
  setTimeout(() => {
    // Replace the URL below with the desired redirect URL
    window.location.href = "/your-redirect-page-url";
  }, 5000); // 5000ms = 5 seconds
}

// Handle Sequential Audio Playback
audioPlayer.addEventListener("ended", () => {
  currentAudioIndex++;
  if (currentAudioIndex < audioFiles.length) {
    audioSource.src = audioFiles[currentAudioIndex];
    audioPlayer.load();
    audioPlayer.play();
  } else {
    console.log("All audio files have been played.");
  }
});

// Event Listeners
prevButton.addEventListener("click", () => handleNavigation(-1));
nextButton.addEventListener("click", () => handleNavigation(1));
submitButton.addEventListener("click", handleSubmit);

// Initialize Quiz
startTimer();
loadQuestion(currentQuestionIndex);

async function renderPDF(url) {
  const pdfViewerContainer = document.getElementById("pdf-viewer-container");
  const pdf = await pdfjsLib.getDocument(url).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Render at a high resolution
    const viewport = page.getViewport({ scale: 2.0 }); // Adjust scale for clarity
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match the PDF page
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    pdfViewerContainer.appendChild(canvas);

    // Render the page into the canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Scale down visually for fitting inside the container
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }
} 

// Call this function to load the PDF
renderPDF("/files/Listening 2.pdf");