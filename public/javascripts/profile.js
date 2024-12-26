/*******************************************************
 * 1. DOM LOADED EVENT: Toggle Sections
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Toggle visibility for history sections
  const toggleHistorySection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const header = section.querySelector("h2");
    const container = section.querySelector(".history-list-container");
    if (header && container) {
      header.addEventListener("click", () => {
        container.classList.toggle("collapsed");
        header.classList.toggle("collapsed");
      });
    }
  };

  // Call the toggle function for each history section
  toggleHistorySection("quiz-section");
  toggleHistorySection("lesson-section");
  toggleHistorySection("writing-section");
  toggleHistorySection("listening-section");
});

/*******************************************************
 * 2. FETCH & DISPLAY USER ACTIVITY HISTORY
 *******************************************************/
/**
 * Fetch and display the user activity history from the server:
 *  - Quizzes, Lessons, Writings, Listenings
 */
async function fetchUserActivityHistory() {
  try {
    const response = await fetch("/api/user-history");
    if (!response.ok) {
      throw new Error("Failed to fetch user history.");
    }

    // Parse the JSON response
    const { quizzes, lessons, writings, listenings } = await response.json();

    // Populate each section
    populateQuizHistory(quizzes);
    populateLessonHistory(lessons);
    populateWritingHistory(writings);
    populateListeningHistory(listenings);
    
  } catch (error) {
    console.error("Error fetching user history:", error);
  }
}

/*******************************************************
 * 3. QUIZ HISTORY
 *******************************************************/
/**
 * Populate the quiz history in the DOM
 * @param {Array} quizzes - Array of quiz objects
 */
function populateQuizHistory(quizzes) {
  const quizListContainer = document.getElementById("quiz-history-list");
  if (!quizListContainer) return;

  quizListContainer.innerHTML = ""; // Clear existing content

  if (!quizzes || quizzes.length === 0) {
    quizListContainer.innerHTML =
      '<li class="no-data">No quizzes completed yet.</li>';
    return;
  }

  // Group quizzes by type (reading or listening) for better organization
  const groupedQuizzes = quizzes.reduce((acc, quiz) => {
    const quizType =
      quiz.quizId && quiz.quizId.includes("reading") ? "reading" : "listening";
    if (!acc[quizType]) {
      acc[quizType] = [];
    }
    acc[quizType].push(quiz);
    return acc;
  }, {});

  // Loop through each quiz type (reading, listening)
  for (const quizType in groupedQuizzes) {
    // Create a section for each quiz type
    const quizSection = document.createElement("div");
    quizSection.classList.add("skill-section");

    // Create a heading for the quiz type
    const quizHeading = document.createElement("h3");
    quizHeading.style.fontSize = "1.2rem";
    quizHeading.style.color = "#444";
    quizHeading.textContent =
      quizType.charAt(0).toUpperCase() + quizType.slice(1) + " Quizzes";

    // Create a container for the quiz list
    const historyListContainer = document.createElement("div");
    historyListContainer.classList.add("history-list-container");

    // Create the quiz list (ul element)
    const historyList = document.createElement("ul");
    historyList.classList.add("history-list");

    // Loop through each quiz in the current quiz type
    groupedQuizzes[quizType].forEach((quiz) => {
      const listItem = document.createElement("li");
      const timestamp = new Date(quiz.timestamp).toLocaleDateString();
      listItem.innerHTML = `
        <strong>Quiz ID:</strong> ${quiz.quizId}<br>
        <strong>Score:</strong> ${quiz.score}<br>
        <strong>Percentage:</strong> ${quiz.percentage}%<br>
        <strong>Completed on:</strong> ${timestamp}
      `;
      historyList.appendChild(listItem);
    });

    // Append elements to build the quiz section structure
    historyListContainer.appendChild(historyList);
    quizSection.appendChild(quizHeading);
    quizSection.appendChild(historyListContainer);
    quizListContainer.appendChild(quizSection);
  }
}

/*******************************************************
 * 4. LESSON HISTORY
 *******************************************************/
/**
 * Populate the lesson history in the DOM
 * @param {Array} lessons - Array of lesson objects
 */
function populateLessonHistory(lessons) {
  const lessonListContainer = document.getElementById("lesson-history-list");
  if (!lessonListContainer) return;

  lessonListContainer.innerHTML = ""; // Clear existing content

  // Group lessons by lessonId
  const lessonData = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.lessonId]) {
      acc[lesson.lessonId] = [];
    }
    acc[lesson.lessonId].push(lesson);
    return acc;
  }, {});

  // Loop through each lessonId
  for (const lessonId in lessonData) {
    const lessonSection = document.createElement("div");
    lessonSection.classList.add("skill-section");

    const lessonHeading = document.createElement("h3");
    lessonHeading.style.fontSize = "1.2rem";
    lessonHeading.style.color = "#444";
    lessonHeading.textContent =
      lessonId.charAt(0).toUpperCase() + lessonId.slice(1);

    const historyListContainer = document.createElement("div");
    historyListContainer.classList.add("history-list-container");

    const historyList = document.createElement("ul");
    historyList.classList.add("history-list");

    // Loop through each lesson with the current lessonId
    lessonData[lessonId].forEach((lesson) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong>Lesson ID:</strong> ${lesson.lessonId}<br>
        <strong>Completed on:</strong> ${new Date(
          lesson.completedAt
        ).toLocaleDateString()}
      `;
      historyList.appendChild(listItem);
    });

    // Append elements to build the lesson section structure
    historyListContainer.appendChild(historyList);
    lessonSection.appendChild(lessonHeading);
    lessonSection.appendChild(historyListContainer);
    lessonListContainer.appendChild(lessonSection);
  }

  // Display "no lessons" message if there are none
  if (Object.keys(lessonData).length === 0) {
    lessonListContainer.innerHTML =
      '<li class="no-data">No lessons completed yet.</li>';
  }
}

/*******************************************************
 * 5. WRITING HISTORY
 *******************************************************/
/**
 * Populate the writing history in the DOM
 * @param {Array} writings - Array of writing objects
 */
function populateWritingHistory(writings) {
  const writingListContainer = document.getElementById("writing-history-list");
  if (!writingListContainer) return;

  writingListContainer.innerHTML = ""; // Clear existing content

  const writingList = document.createElement("ul");
  writingList.classList.add("history-list");

  if (writings && writings.length > 0) {
    // Loop through each writing submission
    writings.forEach((writing) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong>Task:</strong> ${writing.task}<br>
        <strong>Word count:</strong> ${writing.wordCount}<br>
        <strong>Submitted on:</strong> ${new Date(
          writing.completedAt
        ).toLocaleDateString()}
      `;
      writingList.appendChild(listItem);
    });
  } else {
    // Display a "no writings" message if there are none
    const noData = document.createElement("li");
    noData.classList.add("no-data");
    noData.textContent = "No writing submissions yet.";
    writingList.appendChild(noData);
  }

  writingListContainer.appendChild(writingList);
}

/*******************************************************
 * 6. LISTENING HISTORY
 *******************************************************/
/**
 * Populate the listening history in the DOM
 * @param {Array} listenings - Array of listening objects
 */
function populateListeningHistory(listenings) {
  const listeningListContainer = document.getElementById(
    "listening-history-list"
  );
  if (!listeningListContainer) return;

  listeningListContainer.innerHTML = ""; // Clear existing content

  if (listenings && listenings.length > 0) {
    listenings.forEach((listening) => {
      const listItem = document.createElement("li");
      const timestamp = new Date(listening.timestamp).toLocaleDateString();
      listItem.innerHTML = `
        <strong>Listening ID:</strong> ${listening.quizId}<br>
        <strong>Score:</strong> ${listening.score}<br>
        <strong>Percentage:</strong> ${listening.percentage}%<br>
        <strong>Completed on:</strong> ${timestamp}
      `;
      listeningListContainer.appendChild(listItem);
    });
  } else {
    listeningListContainer.innerHTML =
      '<li class="no-data">No listening activities completed yet.</li>';
  }
}
