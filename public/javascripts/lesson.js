document.addEventListener('DOMContentLoaded', () => {
  const startLessonBtn = document.getElementById('start-lesson-btn');
  const lessonContent = document.getElementById('lesson-content');
  let lessonData = null;
  let lessonSections = [];
  let currentSectionIndex = 0;
  let completeLessonBtn = null;

  async function fetchLessonData() {
    try {
      const response = await fetch(`/api/lesson/${lessonId}`);
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

  function loadLesson(data) {
    // Set lesson title and description
    document.querySelector('.lesson-card h2').textContent = data.title;
    document.querySelector('.lesson-card p').textContent = data.description;

    data.sections.forEach((section, sectionIndex) => {
      const sectionElement = document.createElement('div');
      sectionElement.classList.add('lesson-section');
      sectionElement.id = section.id;
      sectionElement.style.display = 'none'; // Initially hidden

      let contentHTML = `
        <h3 class="lesson-heading">${section.heading}</h3>
        <p class="lesson-text">${section.text}</p>
      `;

      if (section.examples) {
        contentHTML += `
          <div class="example-box">
            <p>Examples:</p>
            <ul>
              ${section.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (section.synonymAntonymPairs) {
        contentHTML += `
          <div class="example-box">
            ${section.synonymAntonymPairs.map(pair => `
              <div class="synonym-antonym-pair">
                <div class="word">${pair.word}</div>
                <div class="synonyms">Synonyms: ${pair.synonyms.map(s => `<span class="example-word">${s}</span>`).join(", ")}</div>
                <div class="antonyms">Antonyms: ${pair.antonyms.map(s => `<span class="example-word">${s}</span>`).join(", ")}</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (section.quiz) {
        contentHTML += `<div id="quiz-container"></div>`;
      }

      sectionElement.innerHTML = contentHTML;
      lessonContent.appendChild(sectionElement);
      lessonSections.push(sectionElement);

      // Handle quiz if present
      if (section.quiz) {
        const quizContainer = sectionElement.querySelector("#quiz-container");
        const quizQuestions = section.quizQuestions;

        function displayQuizQuestions() {
          quizQuestions.forEach((questionData, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('quiz-question');
            questionElement.innerHTML = `
              <p>${index + 1}. ${questionData.question}</p>
              ${questionData.options.map(option => `
                <label>
                  <input type="radio" name="question${index}" value="${option}"> ${option}
                </label><br>
              `).join('')}
            `;
            quizContainer.appendChild(questionElement);
          });
        }

        displayQuizQuestions();
        const submitQuizBtn = document.createElement('button');
        submitQuizBtn.id = 'submit-quiz-btn';
        submitQuizBtn.textContent = 'Submit Quiz';
        sectionElement.appendChild(submitQuizBtn);

        submitQuizBtn.addEventListener('click', () => {
          let score = 0;
          quizQuestions.forEach((questionData, index) => {
            const selectedAnswer = document.querySelector(`input[name="question${index}"]:checked`)?.value;
            if (selectedAnswer === questionData.answer) {
              score++;
            }
          });
          alert(`You got ${score} out of ${quizQuestions.length} questions right!`);
        });
      }

      // Add a "Next" button to every section except the last
      if (sectionIndex < data.sections.length - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('next-btn');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          showSection(sectionIndex + 1);
        });
        sectionElement.appendChild(nextBtn);
      }
    });

    // Create the "Complete Lesson" button but don't show it yet
    completeLessonBtn = document.createElement('button');
    completeLessonBtn.id = "complete-lesson-btn";
    completeLessonBtn.dataset.lessonId = lessonId;
    completeLessonBtn.textContent = "Complete Lesson";
    completeLessonBtn.style.display = 'none';

    completeLessonBtn.addEventListener('click', async function () {
      const lessonId = this.dataset.lessonId;
      try {
        const response = await fetch('/api/complete-lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId }),
        });

        if (response.ok) {
          console.log('Lesson completion data sent successfully');
        } else {
          console.error('Failed to send lesson completion data', await response.json());
        }
      } catch (error) {
        console.error('Error while sending lesson completion data:', error);
      }

      setTimeout(() => {
        window.location.href = "/library?type=lesson";
      }, 1000);
    });

    // Append the complete button to the last section only
    if (lessonSections.length > 0) {
      lessonSections.at(-1).appendChild(completeLessonBtn);
    }

    // Start lesson button click event
    startLessonBtn.addEventListener('click', () => {
      lessonContent.style.display = 'block';
      showSection(0); // Show the first section
      startLessonBtn.style.display = 'none';
    });
  }

  function showSection(index) {
    // Hide all sections
    lessonSections.forEach(section => section.style.display = 'none');

    // Show the requested section
    if (lessonSections[index]) {
      lessonSections[index].style.display = 'block';
      currentSectionIndex = index;

      // If this is the last section, show the complete lesson button
      if (index === lessonSections.length - 1) {
        completeLessonBtn.style.display = 'block';
      } else {
        // Hide the complete button if not on the last section
        completeLessonBtn.style.display = 'none';
      }
    }
  }

  fetchLessonData();
});
