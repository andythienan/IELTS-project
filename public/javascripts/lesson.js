document.addEventListener("DOMContentLoaded", () => {
  /*********************************************
   * 1. GLOBAL VARIABLES & DOM ELEMENTS
   *********************************************/
  const startLessonBtn = document.getElementById("start-lesson-btn");
  const lessonContent = document.getElementById("lesson-content");

  // Holds the lesson data fetched from the server
  let lessonData = null;

  // Array of section DOM elements (each representing a lesson section)
  let lessonSections = [];

  // Keeps track of which section is currently being displayed
  let currentSectionIndex = 0;

  // Button to mark the lesson as complete
  let completeLessonBtn = null;

  /*********************************************
   * 2. FETCH LESSON DATA & INITIAL SETUP
   *********************************************/

  // 2a. Fetch the lesson data from the server
  async function fetchLessonData() {
    try {
      // Use template literal for clarity if `lessonId` is defined globally
      const response = await fetch(`/lesson/api/${lessonId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      lessonData = await response.json();
      console.log(lessonData);
      loadLesson(lessonData);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    }
  }

  // 2b. Once data is fetched, build out the lesson in the DOM
  function loadLesson(data) {
    // Set lesson title and description
    document.querySelector(".lesson-card h2").textContent = data.title;
    document.querySelector(".lesson-card p").textContent = data.description;

    // Create a DOM element for each lesson section
    data.sections.forEach((section, sectionIndex) => {
      const sectionElement = createSectionElement(section, sectionIndex);
      lessonContent.appendChild(sectionElement);
      lessonSections.push(sectionElement);

      // If there is a quiz for this section, set it up
      if (section.quiz) {
        setUpQuiz(section, sectionElement, sectionIndex);
      }

      // If it's not the last section, give it a "Next" button
      if (sectionIndex < data.sections.length - 1) {
        createNextButton(sectionElement, sectionIndex);
      }
    });

    // Create and append the "Complete Lesson" button (initially hidden)
    createCompleteLessonButton(data);

    // Event listener for "Start Lesson" button
    startLessonBtn.addEventListener("click", () => {
      lessonContent.style.display = "block";
      showSection(0);            // Show the first section
      startLessonBtn.style.display = "none";
    });
  }

  /*********************************************
   * 3. DOM BUILDERS / SECTION & QUIZ HELPERS
   *********************************************/

  /**
   * Creates a DOM element for a single lesson section
   * @param {Object} section - The section data
   * @param {Number} sectionIndex - Index of the section in lessonData.sections
   * @returns {HTMLDivElement} - The newly created section element
   */
  function createSectionElement(section, sectionIndex) {
    const sectionElement = document.createElement("div");
    sectionElement.classList.add("lesson-section");
    sectionElement.id = section.id;   // e.g. section.id from the data
    sectionElement.style.display = "none"; // Hidden by default

    // Build the base content
    let contentHTML = `
      <h3 class="lesson-heading">${section.heading}</h3>
      <p class="lesson-text">${section.text}</p>
    `;

    // Add examples, if available
    if (section.examples) {
      contentHTML += `
        <div class="example-box">
          <p>Examples:</p>
          <ul>
            ${section.examples
              .map((example) => `<li>${example}</li>`)
              .join("")}
          </ul>
        </div>
      `;
    }

    // Add synonym/antonym pairs, if available
    if (section.synonymAntonymPairs) {
      contentHTML += `
        <div class="example-box">
          ${section.synonymAntonymPairs
            .map(
              (pair) => `
                <div class="synonym-antonym-pair">
                  <div class="word">${pair.word}</div>
                  <div class="synonyms">
                    Synonyms: ${pair.synonyms
                      .map((s) => `<span class="example-word">${s}</span>`)
                      .join(", ")}
                  </div>
                  <div class="antonyms">
                    Antonyms: ${pair.antonyms
                      .map((s) => `<span class="example-word">${s}</span>`)
                      .join(", ")}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `;
    }

    // If there's a quiz, we’ll create a container for it (done below)
    if (section.quiz) {
      contentHTML += `<div id="quiz-container-${sectionIndex}"></div>`;
    }

    // Insert content into this section’s DOM element
    sectionElement.innerHTML = contentHTML;
    return sectionElement;
  }

  /**
   * Sets up a quiz inside a particular section
   * @param {Object} section - The section data (including quiz info)
   * @param {HTMLDivElement} sectionElement - The DOM element for this section
   * @param {Number} sectionIndex - Index of the section
   */
  function setUpQuiz(section, sectionElement, sectionIndex) {
    // Find the quiz container
    const quizContainer = sectionElement.querySelector(
      `#quiz-container-${sectionIndex}`
    );
    const quizQuestions = section.quizQuestions;

    // 1. Display all quiz questions
    quizQuestions.forEach((questionData, questionIndex) => {
      const questionElement = document.createElement("div");
      questionElement.classList.add("quiz-question");

      questionElement.innerHTML = `
        <p>${questionIndex + 1}. ${questionData.question}</p>
        ${questionData.options
          .map(
            (option) => `
              <label>
                <input
                  type="radio"
                  name="question${sectionIndex}-${questionIndex}"
                  value="${option}"
                /> 
                ${option}
              </label>
              <br>
            `
          )
          .join("")}
      `;
      quizContainer.appendChild(questionElement);
    });

    // 2. Add a "Submit Quiz" button
    const submitQuizBtn = document.createElement("button");
    submitQuizBtn.id = `submit-quiz-btn-${sectionIndex}`;
    submitQuizBtn.textContent = "Submit Quiz";
    sectionElement.appendChild(submitQuizBtn);

    // 3. Handle quiz submission
    submitQuizBtn.addEventListener("click", () => {
      let score = 0;
      quizQuestions.forEach((questionData, questionIndex) => {
        const selectedAnswer = document.querySelector(
          `input[name="question${sectionIndex}-${questionIndex}"]:checked`
        )?.value;
        if (selectedAnswer === questionData.answer) {
          score++;
        }
      });
      alert(`You got ${score} out of ${quizQuestions.length} questions right!`);
    });
  }

  /**
   * Create a "Next" button for a non-final section
   * @param {HTMLDivElement} sectionElement - The section DOM element
   * @param {Number} sectionIndex - Index of the section
   */
  function createNextButton(sectionElement, sectionIndex) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("next-btn");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      showSection(sectionIndex + 1);
    });
    sectionElement.appendChild(nextBtn);
  }

  /**
   * Create the "Complete Lesson" button and attach its logic
   * @param {Object} data - The full lesson data
   */
  function createCompleteLessonButton(data) {
    completeLessonBtn = document.createElement("button");
    completeLessonBtn.id = "complete-lesson-btn";
    completeLessonBtn.dataset.lessonId = lessonId;
    completeLessonBtn.textContent = "Complete Lesson";
    completeLessonBtn.style.display = "none"; // Hidden by default

    // Handle completing a lesson
    completeLessonBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/lesson/api/complete-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lessonId }),
        });

        if (response.ok) {
          console.log("Lesson completion data sent successfully");
          // Optionally display success, or do something here
        } else {
          console.error(
            "Failed to send lesson completion data:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("Error while sending lesson completion data:", error);
      }

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/library?type=lesson";
      }, 1000);
    });

    // Append the button to the last section, if at least one section exists
    if (lessonSections.length > 0) {
      lessonSections[lessonSections.length - 1].appendChild(completeLessonBtn);
    }
  }

  /*********************************************
   * 4. SECTION NAVIGATION
   *********************************************/

  /**
   * Show a specific section (by index) and hide all others
   * @param {Number} index - The index of the section to show
   */
  function showSection(index) {
    lessonSections.forEach((sec) => {
      sec.style.display = "none";
    });

    if (lessonSections[index]) {
      lessonSections[index].style.display = "block";
      currentSectionIndex = index;

      // Display the "Complete Lesson" button only on the final section
      if (index === lessonSections.length - 1) {
        completeLessonBtn.style.display = "block";
      } else {
        completeLessonBtn.style.display = "none";
      }
    }
  }

  /*********************************************
   * 5. INIT: FETCH LESSON DATA ON PAGE LOAD
   *********************************************/
  fetchLessonData();
});
