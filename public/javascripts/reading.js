let currentQuestionIndex = 0;
const userAnswers = [];
let notes = [];
let highlightedPassages = [];
let quizData = []; // Variable to store fetched quiz data
let timerInterval;
let timeRemaining = 900; // 15 minutes in seconds
let lastUsedColor = "yellow"; // Default and last used highlight color
const passageEl = document.getElementById("passage");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");
const submitButton = document.getElementById("submit-quiz");
const questionCounterEl = document.getElementById("question-counter");
const timerEl = document.getElementById("timer");
const notificationEl = document.getElementById("notification");
const closeNotificationButton =
  document.getElementById("notification-close");

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

async function fetchQuizData() {
  try {
    const response = await fetch(`/api/reading-quiz/${quizId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    quizData = await response.json();
    loadQuestion(currentQuestionIndex);
  } catch (error) {
    console.error("Failed to fetch quiz data:", error);
    // Handle the error, e.g., show a message to the user
  }
}
function loadQuestion(index) {
    if (!quizData || quizData.length === 0) return;
  
    const data = quizData[index];
    questionEl.textContent = data.question;
    optionsEl.innerHTML = "";
  
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
  
    questionCounterEl.textContent = `Question ${index + 1} of ${
      quizData.length
    }`;
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
  } else if (isAlreadyHighlighted){
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
    selection.anchorNode.parentElement.classList.contains(
      "selected-highlight"
    )
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
  showNotification(`Highlight added`);
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

  if (
    node &&
    node.classList &&
    node.classList.contains("selected-highlight")
  ) {
    const originalText = document.createTextNode(node.textContent);
    node.parentNode.replaceChild(originalText, node);

    // Remove the highlight from the array
    highlightedPassages[currentQuestionIndex] = highlightedPassages[
      currentQuestionIndex
    ].filter((highlight) => highlight.text !== selectedText);

    // Show notification
    showNotification(`Highlight removed`);
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

  // Enable next button if an answer is selected
  if (currentQuestionIndex < quizData.length -1){
    nextButton.disabled = false;
  }
}

function isQuizComplete() {
  return (
    userAnswers.length === quizData.length &&
    userAnswers.every((a) => a !== undefined)
  );
}

function handleNavigation(offset) {
  // Save notes before navigating away from the current question

  currentQuestionIndex += offset;
  loadQuestion(currentQuestionIndex);
}

async function handleSubmit() {
    clearInterval(timerInterval);
  
    const userResponses = quizData.map((question, index) => ({
      question: question.question,
      userAnswer: question.options[userAnswers[index]] || "Not answered",
      correctAnswer: question.answer,
      isCorrect: question.options[userAnswers[index]] === question.answer, // Check if the answer is correct
    }));
  
    // Calculate score and percentage
    let score = userResponses.filter(response => response.isCorrect).length;
    const percentage = ((score / quizData.length) * 100).toFixed(2);
  
    // Display notification (you can customize this)
    notificationEl.textContent = `Quiz submitted! Score: ${score}/${quizData.length} (${percentage}%)`;
    notificationEl.style.display = "block";
  
    // Prepare data for database
    const quizResponseData = {
        userId: loggedInUserId, // Use the passed user ID
        quizId: quizId, 
        questions: userResponses,
        score: score,
        percentage: percentage,
        highlights: highlightedPassages[currentQuestionIndex] || [],
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
      window.location.href = "/library?type=exam";
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
  removeHighlightOption.style.display = isWithinHighlight
    ? "block"
    : "none";
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
      const optionIndex = Array.from(optionsEl.children).indexOf(
        focusedOption
      );
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
    wordRange.startContainer.nodeValue.charAt(
      wordRange.startOffset - 1
    ) !== " "
  ) {
    wordRange.setStart(
      wordRange.startContainer,
      wordRange.startOffset - 1
    );
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

fetchQuizData();
startTimer();