// Correct answers for validation
const correctAnswers = {
  // Section 1
  1: "warehouse",
  2: "Hitcher",
  3: "supermarket",
  4: "bakery",
  5: "ARW204",
  6: "adverts",
  6: "advertisements",
  7: "newspaper",
  8: "agency",
  9: "tutors",
  10: "feedback",
  11: "A",
  12: "B",
  13: "C",
  14: "A",
  15: "B",
  16: "C",
  17: "B",
  18: "E",
  19: "H",
  20: "G",
  21: "A",
  22: "B",
  23: "A",
  24: "C",
  25: "B",
  26: "C",
  27: "B",
  27: "E",
  28: "B",
  28: "E",
  29: "A",
  29: "D",
  30: "A",
  30: "D",
  31: "transportation",
  32: "clean",
  33: "information",
  34: "residents",
  35: "bonus",
  36: "visitors",
  37: "communication",
  38: "sleep",
  39: "plastic",
  40: "planning",
};



// Load PDF using pdf.js
async function renderPDF(url) {
  const pdfViewerContainer = document.getElementById("pdf-viewer-container");
  const pdf = await pdfjsLib.getDocument(url).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Use a higher scale for better resolution
    const viewport = page.getViewport({ scale: 2.0 }); // High resolution

    // Create a canvas for rendering the page
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set the canvas dimensions to match the PDF page
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Append the canvas to the container
    pdfViewerContainer.appendChild(canvas);

    // Render the PDF page
    await page.render({ canvasContext: context, viewport }).promise;

    // Scale down the canvas visually using CSS for better fitting
    canvas.style.width = "100%"; // Fit width to container
    canvas.style.height = "auto"; // Maintain aspect ratio
  }
}



// Call renderPDF with the path to your PDF file
renderPDF("/files/Listening 1.pdf");

// Function to check answers
function checkAnswers() {
  const userAnswers = {};
  const results = [];

  // Validate text answers
  document.querySelectorAll(".answer-box").forEach((input) => {
    const question = input.dataset.question;
    const answer = input.value.trim();
    userAnswers[question] = answer;

    // Compare user input with correct answers
    const isCorrect = answer.toLowerCase() === (correctAnswers[question] || "").toLowerCase();
    results.push({
      question,
      userAnswer: answer,
      correctAnswer: correctAnswers[question],
      isCorrect
    });
  });

  // Validate choice answers
  document.querySelectorAll(".answer-choice").forEach((select) => {
    const question = select.dataset.question;
    const answer = select.value;
    userAnswers[question] = answer;

    // Compare user choice with correct answers
    const isCorrect = answer === (correctAnswers[question] || "");
    results.push({
      question,
      userAnswer: answer,
      correctAnswer: correctAnswers[question],
      isCorrect
    });
  });

  // Display results
  results.forEach(result => {
    console.log(`Question ${result.question}: ${result.isCorrect ? "Correct" : "Incorrect"}`);
  });

  alert("Check the console for detailed results!");
}

// Attach answer checking to the submit button
document.getElementById("submit-quiz").addEventListener("click", checkAnswers);

const audioPlayer = document.getElementById("audio-player");
const audioSource = document.getElementById("audio-source");
const audioPlayerContainer = document.getElementById("audio-player-container");

// List of audio files
const audioFiles = [
  "/files/Listening_1.mp3",
  "/files/Listening_1-2.mp3",
  "/files/Listening_1-3.mp3",
  "/files/Listening_1-4.mp3"
];

let currentAudioIndex = 0;

// Hide the audio player when playing
audioPlayer.addEventListener("play", () => {
  audioPlayerContainer.style.visibility = "hidden"; // Hides the audio player
});

// Show the audio player when finished
audioPlayer.addEventListener("ended", () => {
  audioPlayerContainer.style.visibility = "visible"; // Shows the audio player
  
  // Play the next audio if available
  currentAudioIndex++;
  if (currentAudioIndex < audioFiles.length) {
    audioSource.src = audioFiles[currentAudioIndex];
    audioPlayer.load();
    audioPlayer.play();
  } else {
    console.log("All audio files have been played.");
  }
});

