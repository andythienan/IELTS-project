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
"question": "What is the primary role of the leading education officer position?",
"choices": [
  "Handling disputes and motivating staff",
  "Teaching courses",
  "Developing new computer systems",
  "Conducting research projects"
],
"answer": "Handling disputes and motivating staff"
},
{
"question": "Why were the candidates from the computing faculty rejected?",
"choices": [
  "They lacked sufficient experience",
  "They were not interested in the job",
  "They failed the language requirement",
  "They had health issues"
],
"answer": "They lacked sufficient experience"
},
{
"question": "What are some benefits of the leading education officer position?",
"choices": [
  "Overtime rates, parking space, and petrol money",
  "High salary and extended holidays",
  "Full creative freedom and no overtime",
  "Office with a view and a flexible schedule"
],
"answer": "Overtime rates, parking space, and petrol money"
},
{
"question": "Which candidate has the most work experience?",
"choices": [
  "Steven",
  "Abdul",
  "Leck",
  "Oscar"
],
"answer": "Oscar"
},
{
"question": "What is a drawback associated with Steven?",
"choices": [
  "Limited English language ability",
  "He expresses an intention of leaving to teach abroad",
  "He refuses to work overtime",
  "He has health problems"
],
"answer": "He expresses an intention of leaving to teach abroad"
},
{
"question": "What is a concern about Abdul as a candidate?",
"choices": [
  "His limited English language ability",
  "His lack of qualifications",
  "His bad attitude towards work",
  "His frequent complaints about the job"
],
"answer": "His limited English language ability"
},
{
"question": "Why is Leck considered a less suitable candidate?",
"choices": [
  "He has serious health issues",
  "He refuses to work overtime and complains about his job",
  "He lacks the required qualifications",
  "He has intentions of moving abroad"
],
"answer": "He refuses to work overtime and complains about his job"
},
{
"question": "What issue is raised about Oscar as a candidate?",
"choices": [
  "He has serious health problems",
  "He lacks stability in the role",
  "His language skills are inadequate",
  "He has a poor attitude towards work"
],
"answer": "He has serious health problems"
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