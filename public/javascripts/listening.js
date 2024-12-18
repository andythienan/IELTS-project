document.addEventListener('DOMContentLoaded', () => {
  const startLessonBtn = document.getElementById('start-lesson-btn');
  const lessonContent = document.getElementById('lesson-content');
  let lessonData = null;
  let lessonSections = [];

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
      console.error("Failed to fetch writing task data:", error);
    }
  }
  function loadLesson(data) {
  document.querySelector('.lesson-card h2').textContent = data.title;
  document.querySelector('.lesson-card p').textContent = data.description;
    data.sections.forEach((section, sectionIndex) => {
      const sectionElement = document.createElement('div');
      sectionElement.classList.add('lesson-section');
      sectionElement.id = section.id;
      if (sectionIndex > 0) {
        sectionElement.style.display = 'none';
     }
    let contentHTML = `<h3 class="lesson-heading">${section.heading}</h3>
                        <p class="lesson-text">${section.text}</p>`;
   if (section.examples) {
           contentHTML += `<div class="example-box">
                             <p>Examples:</p>
                                <ul>
                                    ${section.examples.map(example => `<li>${example}</li>`).join('')}
                                 </ul>
                              </div>`;
    }
    if (section.synonymAntonymPairs) {
            contentHTML += `
                  <div class="example-box">
                    ${section.synonymAntonymPairs.map(pair => `
                      <div class="synonym-antonym-pair">
                        <div class="word">${pair.word}</div>
                        <div class="synonyms">Synonyms: ${pair.synonyms.map(s => `<span class="example-word">${s}</span>`).join(",")}</div>
                        <div class="antonyms">Antonyms: ${pair.antonyms.map(s => `<span class="example-word">${s}</span>`).join(",")}</div>
                      </div>
                    `).join('')}
                  </div>`;
    }
  if (section.quiz) {
          contentHTML += `<div id="quiz-container"></div>`;
      }
    sectionElement.innerHTML = contentHTML;
    lessonContent.appendChild(sectionElement);
    lessonSections.push(sectionElement)

      if(section.quiz){
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
                        <input type="radio" name="question${index}" value="${option}">
                          ${option}
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
            sectionElement.appendChild(submitQuizBtn)
          submitQuizBtn.addEventListener('click', checkQuizAnswers);

              function checkQuizAnswers() {
            let score = 0;
           quizQuestions.forEach((questionData, index) => {
             const selectedAnswer = document.querySelector(`input[name="question${index}"]:checked`)?.value;
                if (selectedAnswer === questionData.answer) {
                    score++;
                }
            });
          alert(`You got ${score} out of ${quizQuestions.length} questions right!`);
        }
          }
      });
       const nextButtons = document.querySelectorAll('.next-btn');
      const completeLessonBtn = document.createElement('button');
       completeLessonBtn.id = "complete-lesson-btn";
      completeLessonBtn.dataset.lessonId = lessonId;
       completeLessonBtn.textContent = "Complete Lesson";
          completeLessonBtn.style.display = 'none'; //initial hide
     if(lessonSections.length > 0){
         lessonSections.at(-1).appendChild(completeLessonBtn)
       }
         lessonContent.appendChild(completeLessonBtn)



        nextButtons.forEach((button, buttonIndex) => {
       if (buttonIndex < data.sections.length -1){
           button.addEventListener('click', () => {
                  const targetId = button.dataset.target;
               lessonSections.forEach(section => section.style.display = 'none');
               document.getElementById(targetId).style.display = 'block';
           });
       } else {
           button.style.display = 'none';
          }
   });

     startLessonBtn.addEventListener('click', () => {
          lessonContent.style.display = 'block';
             if (lessonSections && lessonSections.length > 0) {
                lessonSections[0].style.display = 'block';
             }
        // Show complete button when the last section is reached
          if(lessonSections.length > 0){
              lessonSections.at(-1).appendChild(completeLessonBtn)
           completeLessonBtn.style.display = "block"
         }
        // Hide the start lesson button after it's clicked
         startLessonBtn.style.display = 'none';
     });

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
          window.location.href = "/lesson-library";
      }, 1000);
   });
  }
  fetchLessonData();
});