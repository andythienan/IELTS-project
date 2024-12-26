/********************************************************************
 * 1. GLOBAL VARIABLES & DOM ELEMENTS
 ********************************************************************/
let currentQuestionIndex = 0;
const userAnswers = [];
let notes = [];
let highlightedPassages = [];
let quizData = []; // Will store fetched quiz data
let timerInterval;
let timeRemaining = 900; // 15 minutes in seconds
let lastUsedColor = "yellow"; // Default highlight color

// DOM Elements
const passageEl             = document.getElementById("passage");
const questionEl            = document.getElementById("question");
const optionsEl             = document.getElementById("options");
const prevButton            = document.getElementById("prev-question");
const nextButton            = document.getElementById("next-question");
const submitButton          = document.getElementById("submit-quiz");
const questionCounterEl     = document.getElementById("question-counter");
const timerEl               = document.getElementById("timer");
const notificationEl        = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");

// Context Menu Elements (assumed declared in the HTML)
const contextMenu           = document.getElementById("context-menu");
const highlightOption       = document.getElementById("highlight-option");
const removeHighlightOption = document.getElementById("remove-highlight-option");
const addTextOption         = document.getElementById("add-text-option");
const removeTextOption      = document.getElementById("remove-text-option");
const colorPicker           = document.getElementById("color-picker");

/********************************************************************
 * 2. TIMER & INIT
 ********************************************************************/
/**
 * Starts and updates the 15-minute timer
 */
function startTimer() {
  updateTimer(); // Update immediately to avoid initial 1-second delay
  timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Updates the timer display every second, submits if time runs out
 */
function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const secs    = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${secs}`;

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit(); // Automatically submit when time is up
  } else {
    timeRemaining--;
  }
}

/**
 * Fetch quiz data from server and load the first question
 */
async function fetchQuizData() {
  try {
    const response = await fetch(`/reading/api/${quizId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    quizData = await response.json();
    loadQuestion(currentQuestionIndex);
  } catch (error) {
    console.error("Failed to fetch quiz data:", error);
    showNotification("Failed to load quiz data");
  }
}

/********************************************************************
 * 3. QUESTION LOADING & NAVIGATION
 ********************************************************************/
/**
 * Loads a question by index, updates DOM elements
 * @param {Number} index 
 */
function loadQuestion(index) {
  if (!quizData || quizData.length === 0) return;

  const data = quizData[index];
  questionEl.textContent = data.question;
  optionsEl.innerHTML    = "";

  // Set passage content
  passageEl.innerHTML = data.passage;

  // Restore highlights for the current question
  const currentQuestionHighlights = highlightedPassages[index] || [];
  currentQuestionHighlights.forEach((highlight) => {
    highlightTextInPassage(highlight.text, highlight.color);
  });

  // Populate multiple-choice or other options
  data.options.forEach((option, i) => {
    const optionEl = document.createElement("div");
    optionEl.textContent = option;
    optionEl.className   = "choice-box";
    optionEl.addEventListener("click", () => selectAnswer(i));
    if (userAnswers[index] === i) {
      optionEl.classList.add("selected");
    }
    optionsEl.appendChild(optionEl);
  });

  // Update question counter
  questionCounterEl.textContent = `Question ${index + 1} of ${quizData.length}`;

  // Control prev/next button states
  prevButton.disabled = (index === 0);
  nextButton.disabled = (index === quizData.length - 1);

  // Always disable submit until all questions are answered
  submitButton.disabled = true;
}

/**
 * Handles navigation between questions
 * @param {Number} offset - +1 for next, -1 for previous
 */
function handleNavigation(offset) {
  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

/**
 * Selects an answer for the current question
 * @param {Number} index - The index of the option
 */
function selectAnswer(index) {
  userAnswers[currentQuestionIndex] = index;

  // Focus/Highlight the selected choice
  optionsEl.querySelectorAll(".choice-box").forEach((option, i) => {
    option.classList.remove("selected");
    if (i === index) {
      option.classList.add("selected");
      option.focus();
    }
  });

  // Enable "Submit" if all questions answered
  submitButton.disabled = !isQuizComplete();

  // Enable "Next" if an answer is selected (and not on the last question)
  if (currentQuestionIndex < quizData.length - 1) {
    nextButton.disabled = false;
  }
}

/**
 * Checks if all quiz questions have been answered
 * @returns {Boolean} true if complete
 */
function isQuizComplete() {
  return (
    userAnswers.length === quizData.length &&
    userAnswers.every((a) => a !== undefined)
  );
}

/********************************************************************
 * 4. HIGHLIGHTING & REMOVAL
 ********************************************************************/
/**
 * Highlights the given text in the passage with the specified color
 * @param {String} text 
 * @param {String} color 
 */
function highlightTextInPassage(text, color) {
  const passageText      = passageEl.innerHTML;
  const highlightedText  = `<span class="highlight selected-highlight" style="background-color: ${color};">${text}</span>`;
  
  passageEl.innerHTML = passageText.replace(
    new RegExp(text, "g"),
    highlightedText
  );
}

/**
 * Handle highlight when user selects text
 * Uses the last used color for highlighting
 */
function handleHighlightClick(event) {
  event.stopPropagation();

  const selectedRange = window.getSelection();
  const selectedText  = selectedRange.toString().trim();
  
  const isAlreadyHighlighted =
    selectedRange.anchorNode?.parentElement?.classList.contains(
      "selected-highlight"
    );

  if (selectedText && !isAlreadyHighlighted) {
    highlightSelection(lastUsedColor);
  } else if (isAlreadyHighlighted) {
    removeHighlightFromSelection();
  }
}

/**
 * Highlight currently selected text with the given color
 * @param {String} color 
 */
function highlightSelection(color) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) return;

  const range         = selection.getRangeAt(0);
  const selectedText  = range.toString();

  // If already highlighted, do nothing
  if (
    selection.anchorNode?.parentElement?.classList.contains(
      "selected-highlight"
    )
  ) {
    return;
  }

  // Create a new highlight span
  const highlightSpan = document.createElement("span");
  highlightSpan.className              = "highlight selected-highlight";
  highlightSpan.style.backgroundColor  = color;
  highlightSpan.textContent            = selectedText;

  // Replace selected text with the highlight span
  range.deleteContents();
  range.insertNode(highlightSpan);

  // Save highlight info in our array
  const highlightData = { text: selectedText, color: color };
  highlightedPassages[currentQuestionIndex] = [
    ...(highlightedPassages[currentQuestionIndex] || []),
    highlightData,
  ];

  // Clear selection & update last used color
  selection.removeAllRanges();
  lastUsedColor = color;

  console.log("Highlighted passages:", highlightedPassages);
  showNotification(`Highlight added`);
}

/**
 * Removes highlight from the currently selected text
 */
function removeHighlightFromSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) return;

  const range        = selection.getRangeAt(0);
  const selectedText = range.toString();

  let node = selection.anchorNode;
  while (node && node !== passageEl) {
    if (node.classList?.contains("selected-highlight")) {
      const originalText = document.createTextNode(node.textContent);
      node.parentNode.replaceChild(originalText, node);

      // Remove from the highlightedPassages array
      highlightedPassages[currentQuestionIndex] = highlightedPassages[
        currentQuestionIndex
      ].filter((highlight) => highlight.text !== selectedText);

      break;
    }
    node = node.parentNode;
  }

  // Clear selection
  selection.removeAllRanges();

  // Double-check if we removed it
  if (node?.classList?.contains("selected-highlight")) {
    const originalText = document.createTextNode(node.textContent);
    node.parentNode.replaceChild(originalText, node);

    highlightedPassages[currentQuestionIndex] = highlightedPassages[
      currentQuestionIndex
    ].filter((highlight) => highlight.text !== selectedText);

    showNotification(`Highlight removed`);
  }
}

/********************************************************************
 * 5. SUBMIT QUIZ
 ********************************************************************/
/**
 * Handles final submission of the quiz data
 * - Calculates score
 * - Sends data to server
 * - Displays notification/redirects
 */
async function handleSubmit() {
  clearInterval(timerInterval);

  // Build user response objects
  const userResponses = quizData.map((question, index) => {
    const chosenOption = userAnswers[index];
    return {
      question: question.question,
      userAnswer: question.options[chosenOption] || "Not answered",
      correctAnswer: question.answer,
      isCorrect: question.options[chosenOption] === question.answer,
    };
  });

  // Calculate score and percentage
  const score       = userResponses.filter((r) => r.isCorrect).length;
  const percentage  = ((score / quizData.length) * 100).toFixed(2);

  // Build object to send to the server
  const quizResponseData = {
    userId: loggedInUserId,
    quizId: quizId,
    questions: userResponses,
    score: score,
    percentage: percentage,
    highlights: highlightedPassages[currentQuestionIndex] || []
  };

  try {
    const response = await fetch("/reading/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizResponseData),
    });

    if (response.ok) {
      showNotification(`Quiz submitted! Score: ${score}/${quizData.length} (${percentage}%)`);
      setTimeout(() => (window.location.href = "/library?type=exam"), 5000);
    } else {
      throw new Error("Failed to submit quiz");
    }
  } catch (error) {
    console.error("Error submitting quiz:", error);
    showNotification("Failed to submit quiz. Please try again.");
  }
}

/********************************************************************
 * 6. NOTIFICATIONS & UTILITIES
 ********************************************************************/
/**
 * Shows a small notification (auto-dismiss)
 * @param {String} message 
 */
function showNotification(message) {
  const notificationContainer = document.getElementById("notification-container");
  notificationContainer.textContent = message;
  notificationContainer.classList.add("show");

  // Hide notification after 3 seconds
  setTimeout(() => {
    notificationContainer.classList.remove("show");
  }, 3000);
}

/********************************************************************
 * 7. CONTEXT MENU LOGIC (RIGHT-CLICK OPTIONS)
 ********************************************************************/
function handleRightClick(event) {
  event.preventDefault();

  const selectedText    = window.getSelection().toString().trim();
  const isTextSelected  = selectedText.length > 0;
  const isWithinHighlight =
    isTextSelected &&
    window
      .getSelection()
      .anchorNode.parentElement.classList.contains("selected-highlight");

  // Show/hide context menu options
  highlightOption.style.display       = isTextSelected && !isWithinHighlight ? "block" : "none";
  removeHighlightOption.style.display = isWithinHighlight ? "block" : "none";
  addTextOption.style.display         = isTextSelected ? "block" : "none";
  removeTextOption.style.display      = isTextSelected ? "block" : "none";
  colorPicker.style.display           = (isTextSelected && !isWithinHighlight) ? "flex" : "none";

  // Position the context menu
  const offsetX = 20;
  const offsetY = 20;
  contextMenu.style.top  = `${event.clientY + offsetY}px`;
  contextMenu.style.left = `${event.clientX + offsetX}px`;
  contextMenu.style.display = "block";
}

/********************************************************************
 * 8. KEYBOARD SHORTCUTS & TEXT SELECTION
 ********************************************************************/
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "h") {
    // Alt + H: Highlight
    highlightSelection(lastUsedColor);
  } else if (event.altKey && event.key === "r") {
    // Alt + R: Remove Highlight
    removeHighlightFromSelection();
  } else if (event.key === "Enter") {
    // Enter: Select currently focused option
    const focusedOption = document.activeElement;
    if (focusedOption.classList.contains("choice-box")) {
      const optionIndex = Array.from(optionsEl.children).indexOf(focusedOption);
      selectAnswer(optionIndex);
    }
  } else if (event.key === "ArrowRight") {
    // Right Arrow: Next question
    if (currentQuestionIndex < quizData.length - 1) {
      handleNavigation(1);
    }
  } else if (event.key === "ArrowLeft") {
    // Left Arrow: Previous question
    if (currentQuestionIndex > 0) {
      handleNavigation(-1);
    }
  }
});

/**
 * Enhanced text selection on double click (select entire word).
 */
passageEl.addEventListener("dblclick", () => {
  const selection = window.getSelection();
  const range     = selection.getRangeAt(0);
  const wordRange = document.createRange();

  wordRange.setStart(range.startContainer, range.startOffset);
  wordRange.setEnd(range.endContainer,   range.endOffset);

  // Expand selection to whole word
  while (
    wordRange.startOffset > 0 &&
    wordRange.startContainer.nodeValue.charAt(wordRange.startOffset - 1) !== " "
  ) {
    wordRange.setStart(wordRange.startContainer, wordRange.startOffset - 1);
  }
  while (
    wordRange.endOffset < wordRange.endContainer.nodeValue.length &&
    wordRange.endContainer.nodeValue.charAt(wordRange.endOffset) !== " "
  ) {
    wordRange.setEnd(wordRange.endContainer, wordRange.endOffset + 1);
  }

  selection.removeAllRanges();
  selection.addRange(wordRange);

  // Trigger highlight
  handleHighlightClick(new MouseEvent("mouseup"));
});

/**
 * Prevent default on triple-click or more
 */
passageEl.addEventListener("mousedown", (event) => {
  if (event.detail >= 3) {
    event.preventDefault();
  }
});

/**
 * Trigger highlight on mouseup (for normal selection)
 */
passageEl.addEventListener("mouseup", handleHighlightClick);

/********************************************************************
 * 9. EVENT LISTENERS FOR BUTTONS
 ********************************************************************/
prevButton.addEventListener("click", () => handleNavigation(-1));
nextButton.addEventListener("click", () => handleNavigation(1));
submitButton.addEventListener("click", handleSubmit);
closeNotificationButton.addEventListener(
  "click",
  () => (notificationEl.style.display = "none")
);

/********************************************************************
 * 10. RIGHT-CLICK (CONTEXT MENU) SETUP
 ********************************************************************/
document.addEventListener("contextmenu", handleRightClick);

/********************************************************************
 * 11. INIT: FETCH DATA & START TIMER
 ********************************************************************/
fetchQuizData();
startTimer();
