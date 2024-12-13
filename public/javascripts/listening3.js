const audioPlayer = document.getElementById("audio-player");
const questionsContainer = document.getElementById("questions");
const submitButton = document.getElementById("submit-test");
const timerEl = document.getElementById("timer");
const notificationEl = document.getElementById("notification");
const closeNotificationButton =
  document.getElementById("notification-close");

let timerInterval;
let timeRemaining = 1500; // 25 minutes in seconds

const questions = [
{
"question": "The first apartment on Beetle Road is a three-bedroom property with a bathroom and living room. It costs ______ per month and includes internet and utilities.",
"choices": [
  "$400",
  "$435",
  "$500",
  "$600"
],
"answer": "$435"
},
{
"question": "The three-bedroom apartment on Oakington Avenue is located ______ and costs $400 per month for a bedroom with an air conditioner.",
"choices": [
  "near a shopping center",
  "on campus",
  "off campus",
  "in the city center"
],
"answer": "on campus"
},
{
"question": "The two-bedroom apartment on Mead Street can be converted into a three-bedroom by using the ______ as a bedroom.",
"choices": [
  "study",
  "living room",
  "kitchen",
  "dining area"
],
"answer": "study"
},
{
"question": "The apartment on Mead Street costs $600 per month but lacks a ______.",
"choices": [
  "TV",
  "DVD player",
  "washing machine",
  "microwave"
],
"answer": "washing machine"
},
{
"question": "The one-bedroom apartment in the Devon Close Complex includes a study and access to free ______ after 6:00 PM.",
"choices": [
  "laundry services",
  "parking",
  "dining hall meals",
  "Wi-Fi"
],
"answer": "dining hall meals"
},
{
"question": "The Devon Close Complex apartment costs $500 per month but lacks a ______ in the apartment itself.",
"choices": [
  "kitchen",
  "bathroom",
  "study",
  "living room"
],
"answer": "bathroom"
},
{
"question": "Joseph expresses interest in either the apartment on ______ or the one in the Devon Close Complex.",
"choices": [
  "Oakington Avenue",
  "Mead Street",
  "Beetle Road",
  "Elm Street"
],
"answer": "Beetle Road"
},
];

function updateTimer() {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;

  if (timeRemaining === 0) {
    clearInterval(timerInterval);
    handleSubmit();
  } else {
    timeRemaining--;
  }
}

function startTimer() {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function displayQuestions() {
  console.log("Rendering questions...");
  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `
      <p class="question-text">${question.question}</p>
      <div class="choices">
        ${question.choices
          .map(
            (choice) => `
            <div class="choice" data-question="${index}" data-choice="${choice.charAt(
              0
            )}">${choice}</div>
          `
          )
          .join("")}
      </div>
    `;
    questionsContainer.appendChild(questionDiv);
  });

  questionsContainer.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", handleChoiceSelection);
  });
  console.log("Questions rendered successfully.");
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

  const allQuestionsAnswered = questions.every((_, index) => {
    return (
      questionsContainer.querySelector(
        `.choice[data-question="${index}"].selected`
      ) !== null
    );
  });
  submitButton.disabled = !allQuestionsAnswered;
}

async function handleSubmit(event) {
event.preventDefault(); // Prevent form submission
clearInterval(timerInterval);

// Extract user answers:
const userResponses = questions.map((question, index) => {
const selectedChoice = document.querySelector(
`.choice[data-question="${index}"].selected`
);
const userAnswer = selectedChoice ? selectedChoice.dataset.choice : "Not answered";
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
// If you have a user ID available from a server template or session, insert it here.
// Otherwise, remove or hard-code a user ID if necessary.
userId: "", 
quizId: "listening-quiz-3", 
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
  audioPlayer.play();
  startTimer();

  // Fallback to display questions after 10 seconds if audio hasn't ended
  setTimeout(() => {
    if (!questionsContainer.querySelector(".question")) {
      displayQuestions();
    }
  }, 10000);
});

audioPlayer.addEventListener("ended", displayQuestions);

document
  .getElementById("questions-form")
  .addEventListener("submit", handleSubmit);

closeNotificationButton.addEventListener(
  "click",
  () => (notificationEl.style.display = "none")
);