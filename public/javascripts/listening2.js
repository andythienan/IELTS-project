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
"question": "The speaker discusses the impracticality of reducing carbon dioxide emissions by limiting fossil fuel consumption. What alternative method is proposed, and why is this considered more practical?",
"choices": [
  "Using renewable energy sources to eliminate the need for fossil fuels",
  "Capturing carbon dioxide from industrial processes and storing it permanently",
  "Neutralizing carbon dioxide with oceanic compounds to create carbonic acid",
  "Utilizing carbon dioxide to create synthetic fuels for energy production"
],
"answer": "Capturing carbon dioxide from industrial processes and storing it permanently"
},
{
"question": "What are the benefits of reacting carbon dioxide with metal oxides to form solid carbonate materials, and what is the primary challenge with this approach?",
"choices": [
  "It eliminates CO2 emissions entirely; however, the process is extremely slow even with enhancements",
  "It is cost-effective and sustainable; however, the materials required are rare",
  "It prevents oceanic acidification; however, it produces toxic byproducts",
  "It creates valuable byproducts for industry; however, the technology is still experimental"
],
"answer": "It eliminates CO2 emissions entirely; however, the process is extremely slow even with enhancements"
},
{
"question": "The proposal to pump CO2 to the ocean floor was ruled out due to concerns about oceanic acidity. What are the potential consequences of increased acidity mentioned by the speaker?",
"choices": [
  "Disruption of delicate marine ecosystems and food chains that humans depend on",
  "Significant loss of oceanic biodiversity and increased greenhouse gas release",
  "Destruction of coral reefs and the collapse of commercial fishing industries",
  "Global warming acceleration due to reduced carbon sequestration in oceans"
],
"answer": "Disruption of delicate marine ecosystems and food chains that humans depend on"
},
{
"question": "Geo sequestration involves pumping CO2 underground. Identify and elaborate on the three serious disadvantages associated with this method, as outlined by the speaker.",
"choices": [
  "Environmental damage, economic instability, and lack of proven results",
  "Risk of leaks, high costs, and doubts about its effectiveness in reducing global warming",
  "Health risks, technical complexity, and insufficient public support",
  "Limited capacity, legal challenges, and increased greenhouse gas emissions"
],
"answer": "Risk of leaks, high costs, and doubts about its effectiveness in reducing global warming"
},
{
"question": "The speaker mentions a specific risk related to CO2 leaks in geo sequestration. What historical example supports this concern, and what could be the potential consequences?",
"choices": [
  "Volcanic CO2 leaks causing suffocation; potential to endanger thousands of lives",
  "Industrial CO2 leaks causing acid rain; potential to destroy local agriculture",
  "Pipeline failures causing environmental contamination; potential to disrupt ecosystems",
  "Oceanic CO2 emissions leading to mass marine life death; potential to collapse fisheries"
],
"answer": "Volcanic CO2 leaks causing suffocation; potential to endanger thousands of lives"
},
{
"question": "The cost of geo sequestration is a significant barrier. How would this method impact electricity users, and why might this be a deterrent to widespread implementation?",
"choices": [
  "Electricity bills would increase by approximately 50%, discouraging public acceptance",
  "The cost of infrastructure and maintenance would lead to a 100% increase in bills",
  "The inefficiency of the process would double electricity costs for minimal environmental benefit",
  "The reliance on imported materials would significantly raise electricity production costs"
],
"answer": "The cost of infrastructure and maintenance would lead to a 100% increase in bills"
},
{
"question": "The speaker questions whether geo sequestration significantly reduces global warming. What operational inefficiency of this process is highlighted, and how does it undermine environmental benefits?",
"choices": [
  "The process requires burning additional coal, producing other pollutants like sulfur and heavy metals",
  "The system releases CO2 during construction, offsetting any captured emissions",
  "The energy consumption for sequestration exceeds the CO2 captured, making it unsustainable",
  "The process relies on outdated technology that cannot handle large-scale emissions"
],
"answer": "The process requires burning additional coal, producing other pollutants like sulfur and heavy metals"
},
{
"question": "What ongoing efforts are mentioned to evaluate the feasibility of geo sequestration, and why are these efforts significant despite the challenges?",
"choices": [
  "Small-scale experiments at oil production sites to assess its long-term viability",
  "Collaborations between governments and industries to reduce costs and risks",
  "Pilot programs in renewable energy facilities to offset CO2 emissions",
  "International agreements to regulate carbon storage standards globally"
],
"answer": "Small-scale experiments at oil production sites to assess its long-term viability"
}
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