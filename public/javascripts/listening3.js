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
  "/files/listening_3.mp3",
  "/files/listening_3_2.mp3",
  "/files/listening_3_3.mp3",
  "/files/listening_3_4.mp3",
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
const questionsTest3= [
// Section 1
{ type: "text", text: "1. Complete the notes: _______", correct: "Jamieson" },
{ type: "text", text: "2. Complete the notes: _______", correct: "11th July" },
{ type: "text", text: "3. Complete the notes: _______", correct: "waiter(s)" },
{ type: "text", text: "4. Complete the notes: _______", correct: "sing" },
{ type: "text", text: "5. Complete the notes: _______", correct: "children" },
{ type: "text", text: "6. Complete the notes: _______", correct: "drive" },
{ type: "text", text: "7. Complete the notes: _______", correct: "transport" },
{ type: "text", text: "8. Complete the notes: _______", correct: "meal" },
{ type: "text", text: "9. Complete the notes: _______", correct: "Thursday" },
{ type: "text", text: "10. Complete the notes: _______", correct: "photo" },

// Section 2
{ type: "choice", text: "11 Choose TWO letters:", options: ["A", "B", "C"], correct: ["B", "C"] },
{ type: "choice", text: "12 Choose TWO letters:", options: ["A", "B", "C"], correct: ["B", "C"] },
{ type: "choice", text: "13 Choose TWO letters:", options: ["A", "B", "C", "D"], correct: ["A", "D"] },
{ type: "choice", text: "14 Choose TWO letters:", options: ["A", "B", "C", "D"], correct: ["A", "D"] },
{ type: "choice", text: "15. Choose the correct letter:", options: ["A", "B", "C", "D"], correct: "D" },
{ type: "choice", text: "16. Choose the correct letter:", options: ["A", "B", "C", "D"], correct: "A" },
{ type: "choice", text: "17. Choose the correct letter:", options: ["A", "B", "C", "D"], correct: "B" },
{ type: "choice", text: "18. Choose the correct letter:", options: ["A", "B", "C", "D"], correct: "C" },
{ type: "choice", text: "19. Choose the correct letter:", options: ["A", "B", "C", "D", "E", "F", "G", "H"], correct: "H" },
{ type: "choice", text: "20. Choose the correct letter:", options: ["A", "B", "C", "D", "E", "F", "G", "H"], correct: "G" },

// Section 3
{ type: "choice", text: "21. Choose the correct letter:", options: ["A", "B", "C"], correct: "A" },
{ type: "choice", text: "22. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
{ type: "choice", text: "23. Choose the correct letter:", options: ["A", "B", "C"], correct: "A" },
{ type: "choice", text: "24. Choose the correct letter:", options: ["A", "B", "C"], correct: "C" },
{ type: "choice", text: "25. Choose the correct letter:", options: ["A", "B", "C"], correct: "B" },
{ type: "choice", text: "26. Choose the correct letter:", options: ["A", "B", "C"], correct: "B" },
{ type: "text", text: "27. Complete the notes: _______", correct: "sharing" },
{ type: "text", text: "28. Complete the notes: _______", correct: "education" },
{ type: "text", text: "29. Complete the notes: _______", correct: "settle down" },
{ type: "text", text: "30. Complete the notes: _______", correct: "gifts" },

// Section 4
{ type: "text", text: "31. Complete the notes: _______", correct: "carbon dioxide" },
{ type: "text", text: "32. Complete the notes: _______", correct: "legs" },
{ type: "text", text: "33. Complete the notes: _______", correct: "control" },
{ type: "text", text: "34. Complete the notes: _______", correct: "butterfly" },
{ type: "text", text: "35. Complete the notes: _______", correct: "feet" },
{ type: "text", text: "36. Complete the notes: _______", correct: "woodlands" },
{ type: "text", text: "37. Complete the notes: _______", correct: "heat" },
{ type: "text", text: "38. Complete the notes: _______", correct: "body shape" },
{ type: "text", text: "39. Complete the notes: _______", correct: "stomach" },
{ type: "text", text: "40. Complete the notes: _______", correct: "distance" },

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
  const question = questionsTest3[index];
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
  questionCounterEl.textContent = `Question ${index + 1} of ${questionsTest3.length}`;
  prevButton.disabled = index === 0;
  nextButton.disabled = index === questionsTest3.length - 1;
  submitButton.disabled = !isQuizComplete();
}

// Navigation
function handleNavigation(offset) {
  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

// Check if Quiz is Complete
function isQuizComplete() {
  return questionsTest3.every((_, index) => userAnswers[index] !== undefined);
}

// Submit Quiz
function handleSubmit() {
  clearInterval(timerInterval);

  // Evaluate answers
  const results = questionsTest3.map((q, index) => {
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
  const percentage = ((score / questionsTest3.length) * 100).toFixed(2);

  // Display submission notification
  alert(`Quiz submitted! Score: ${score}/${questionsTest3.length} (${percentage}%)`);

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
renderPDF("/files/Listening 3.pdf");