let testData = [];
let currentQuestionIndex = 0;

// Load JSON data
fetch('testData.json')
  .then(response => response.json())
  .then(data => {
    testData = data;
    loadQuestion(currentQuestionIndex);
  })
  .catch(error => console.error("Error loading test data:", error));

// Load a question
function loadQuestion(index) {
  const data = testData[index];
  document.getElementById("passage").textContent = data.passage;
  document.getElementById("question").textContent = data.question;

  const options = document.getElementById("options");
  options.innerHTML = '';
  data.options.forEach(option => {
    const li = document.createElement("li");
    li.textContent = option;
    li.addEventListener("click", () => handleAnswer(option, index));
    options.appendChild(li);
  });

  document.getElementById("question-counter").textContent = `Question ${index + 1} of ${testData.length}`;
  document.getElementById("prev-question").disabled = index === 0;
  document.getElementById("next-question").disabled = index === testData.length - 1;
}

// Navigation
document.getElementById("prev-question").addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion(currentQuestionIndex);
  }
});

document.getElementById("next-question").addEventListener("click", () => {
  if (currentQuestionIndex < testData.length - 1) {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
  }
});

// Handle answer selection
function handleAnswer(option, index) {
  console.log(`Selected Answer for Question ${index + 1}: ${option}`);
}
