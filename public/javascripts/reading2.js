let currentQuestionIndex = 0;
const userAnswers = [];
let notes = [];
let highlightedPassages = [];
let timerInterval;
let timeRemaining = 300; // 5 minutes in seconds
let lastUsedColor = "yellow"; // Default and last used highlight color

const passageEl = document.getElementById("passage");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const noteInputEl = document.getElementById("note-input");
const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");
const submitButton = document.getElementById("submit-quiz");
const questionCounterEl = document.getElementById("question-counter");
const timerEl = document.getElementById("timer");
const notificationEl = document.getElementById("notification");
const closeNotificationButton = document.getElementById("notification-close");

// Context Menu Elements
const contextMenu = document.getElementById("context-menu");
const highlightOption = document.getElementById("highlight-option");
const removeHighlightOption = document.getElementById(
  "remove-highlight-option"
);
const addTextOption = document.getElementById("add-text-option");
const removeTextOption = document.getElementById("remove-text-option");
const colorPicker = document.getElementById("color-picker");

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

  // Restore or initialize notes
  noteInputEl.value = notes[index] || "";

  // Set the passage content
  passageEl.innerHTML = data.passage;

  // Restore highlights for the current question
  const currentQuestionHighlights = highlightedPassages[index] || [];
  currentQuestionHighlights.forEach((highlight) => {
    highlightTextInPassage(highlight.text, highlight.color);
  });

  // Select the answer if one was previously chosen
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

function highlightTextInPassage(text, color) {
  const passageText = passageEl.innerHTML;
  const highlightedText = `<span class="highlight selected-highlight" style="background-color: ${color};">${text}</span>`;
  passageEl.innerHTML = passageText.replace(
    new RegExp(text, "g"),
    highlightedText
  );
}

// Updated to use last used color
function handleHighlightClick(event) {
  event.stopPropagation();

  const selectedRange = window.getSelection();
  const selectedText = selectedRange.toString().trim();
  const isAlreadyHighlighted =
    selectedRange.anchorNode.parentElement.classList.contains(
      "selected-highlight"
    );

  if (selectedText && !isAlreadyHighlighted) {
    // Apply the last used color
    highlightSelection(lastUsedColor);
  } else {
    // Remove highlight
    removeHighlightFromSelection();
  }
}

function showNotification(message) {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  notificationContainer.textContent = message;
  notificationContainer.classList.add("show");

  // Hide the notification after a timeout
  setTimeout(() => {
    notificationContainer.classList.remove("show");
  }, 3000); // 3 seconds
}

// Updated to use and save last used color
function highlightSelection(color) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  // Check if the selection is already highlighted
  if (
    selection.anchorNode.parentElement.classList.contains("selected-highlight")
  ) {
    return; // Do nothing if already highlighted
  }

  // Create a new highlight span
  const highlightSpan = document.createElement("span");
  highlightSpan.className = "highlight selected-highlight";
  highlightSpan.style.backgroundColor = color;
  highlightSpan.textContent = selectedText;

  // Surround the selected text with the highlight span
  range.deleteContents();
  range.insertNode(highlightSpan);

  // Add the highlight to the array
  const highlightData = {
    text: selectedText,
    color: color,
  };
  highlightedPassages[currentQuestionIndex] = [
    ...(highlightedPassages[currentQuestionIndex] || []),
    highlightData,
  ];

  // Clear the selection and update last used color
  selection.removeAllRanges();
  lastUsedColor = color;

  console.log("Highlighted passages:", highlightedPassages);
  showNotification(`Text highlighted: "${selectedText}"`);
}

function removeHighlightFromSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  let node = selection.anchorNode;
  while (node && node !== passageEl) {
    if (node.classList && node.classList.contains("selected-highlight")) {
      const originalText = document.createTextNode(node.textContent);
      node.parentNode.replaceChild(originalText, node);

      // Remove the highlight from the array
      highlightedPassages[currentQuestionIndex] = highlightedPassages[
        currentQuestionIndex
      ].filter((highlight) => highlight.text !== selectedText);

      break; // Exit the loop once the highlight is removed
    }
    node = node.parentNode;
  }

  // Clear the selection
  selection.removeAllRanges();

  if (node && node.classList && node.classList.contains("selected-highlight")) {
    const originalText = document.createTextNode(node.textContent);
    node.parentNode.replaceChild(originalText, node);

    // Remove the highlight from the array
    highlightedPassages[currentQuestionIndex] = highlightedPassages[
      currentQuestionIndex
    ].filter((highlight) => highlight.text !== selectedText);

    // Show notification
    showNotification(`Highlight removed from: "${selectedText}"`);
  }
}

function selectAnswer(index) {
  userAnswers[currentQuestionIndex] = index;

  // Focus on the selected option for keyboard navigation
  optionsEl.querySelectorAll(".choice-box").forEach((option, i) => {
    option.classList.remove("selected");
    if (i === index) {
      option.classList.add("selected");
      option.focus(); // Focus for keyboard accessibility
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
  // Save notes before navigating away from the current question
  notes[currentQuestionIndex] = noteInputEl.value;

  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

async function handleSubmit() {
  clearInterval(timerInterval);

  // Save any remaining notes
  notes[currentQuestionIndex] = noteInputEl.value;

  const userResponses = quizData.map((question, index) => ({
    question: question.question,
    userAnswer: question.options[userAnswers[index]] || "Not answered",
    correctAnswer: question.answer,
    isCorrect: question.options[userAnswers[index]] === question.answer, // Check if the answer is correct
  }));

  // Calculate score and percentage
  let score = userResponses.filter((response) => response.isCorrect).length;
  const percentage = ((score / quizData.length) * 100).toFixed(2);

  // Display notification (you can customize this)
  notificationEl.textContent = `Quiz submitted! Score: ${score}/${quizData.length} (${percentage}%)`;
  notificationEl.style.display = "block";

  // Prepare data for database
  const quizResponseData = {
    userId: loggedInUserId, // Use the passed user ID
    quizId: "reading-quiz-2",
    questions: userResponses,
    score: score,
    percentage: percentage,
    highlights: highlightedPassages[currentQuestionIndex] || [],
    notes: notes[currentQuestionIndex] || "",
  };

  // Send data to server
  try {
    const response = await fetch("/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Make sure this is set
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

// Event listeners for navigation and submission
prevButton.addEventListener("click", () => handleNavigation(-1));
nextButton.addEventListener("click", () => handleNavigation(1));
submitButton.addEventListener("click", handleSubmit);
closeNotificationButton.addEventListener(
  "click",
  () => (notificationEl.style.display = "none")
);

// Context Menu Event Listeners
function handleRightClick(event) {
  event.preventDefault();

  const selectedText = window.getSelection().toString().trim();
  const isTextSelected = selectedText.length > 0;
  const isWithinHighlight =
    isTextSelected &&
    window
      .getSelection()
      .anchorNode.parentElement.classList.contains("selected-highlight");

  // Enable/disable context menu options based on selection
  highlightOption.style.display =
    isTextSelected && !isWithinHighlight ? "block" : "none";
  removeHighlightOption.style.display = isWithinHighlight ? "block" : "none";
  addTextOption.style.display = isTextSelected ? "block" : "none";
  removeTextOption.style.display = isTextSelected ? "block" : "none";
  colorPicker.style.display =
    isTextSelected && !isWithinHighlight ? "flex" : "none";

  // Adjust the context menu position to be closer to the cursor
  const offsetX = 20; // Horizontal offset
  const offsetY = 20; // Vertical offset

  contextMenu.style.top = `${event.clientY + offsetY}px`;
  contextMenu.style.left = `${event.clientX + offsetX}px`;
  contextMenu.style.display = "block";
}

function handleHighlightOption() {
  highlightSelection(lastUsedColor);
  contextMenu.style.display = "none";
}

function handleRemoveHighlightOption() {
  removeHighlightFromSelection();
  contextMenu.style.display = "none";
}

function handleAddTextOption() {
  // Get the selected range
  const selectedRange = window.getSelection().getRangeAt(0);
  const selectedText = selectedRange.toString().trim();

  // Prompt the user to enter text
  const newText = prompt("Enter text to add:");
  if (newText === null || newText.trim() === "") return; // Do nothing if canceled or empty

  // Create a new text node with the entered text
  const textNode = document.createTextNode(" " + newText + " ");

  // Insert the new text node after the selected range
  selectedRange.insertNode(textNode);

  contextMenu.style.display = "none";
}

function handleRemoveTextOption() {
  // Get the selected range
  const selectedRange = window.getSelection().getRangeAt(0);
  const selectedText = selectedRange.toString().trim();

  if (selectedText) {
    // Remove the selected text
    selectedRange.deleteContents();
  }

  contextMenu.style.display = "none";
}

// Event listeners for context menu options
highlightOption.addEventListener("click", handleHighlightOption);
removeHighlightOption.addEventListener("click", handleRemoveHighlightOption);
addTextOption.addEventListener("click", handleAddTextOption);
removeTextOption.addEventListener("click", handleRemoveTextOption);

// Prevent default right-click behavior on the passage
passageEl.addEventListener("contextmenu", handleRightClick);

// Color Picker Event Listener
colorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (event) => {
    // Remove 'selected' class from all color options
    colorPicker.querySelectorAll(".color-option").forEach((opt) => {
      opt.classList.remove("selected");
    });

    // Add 'selected' class to the clicked color option
    const clickedColor = event.target;
    clickedColor.classList.add("selected");

    // Update the selected highlight color and save as last used
    selectedHighlightColor = clickedColor.dataset.color;
    lastUsedColor = selectedHighlightColor; // Update last used color
  });
});

// Close the context menu when clicking outside or pressing Esc
document.addEventListener("click", (event) => {
  if (!contextMenu.contains(event.target)) {
    contextMenu.style.display = "none";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    contextMenu.style.display = "none";
  }
});

// Keyboard Shortcuts
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

// Enhanced Text Selection (Double and Triple Click)
passageEl.addEventListener("dblclick", () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const wordRange = document.createRange();

  // Find word boundaries
  wordRange.setStart(range.startContainer, range.startOffset);
  wordRange.setEnd(range.endContainer, range.endOffset);
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

  // Trigger highlight after selection (for double-click)
  handleHighlightClick(new MouseEvent("mouseup"));
});

// Prevent default behavior on triple click and mousedown
passageEl.addEventListener("mousedown", (event) => {
  if (event.detail >= 3) {
    // Triple click or more
    event.preventDefault();
  }
});

// Event listener to trigger highlight on mouseup (for regular selection)
passageEl.addEventListener("mouseup", handleHighlightClick);

startTimer();
loadQuestion(currentQuestionIndex);
