document.addEventListener('DOMContentLoaded', () => {
    const startLessonBtn = document.getElementById('start-lesson-btn');
    const lessonContent = document.getElementById('lesson-content');
    const lessonSections = document.querySelectorAll('.lesson-section');
    const nextButtons = document.querySelectorAll('.next-btn');
    const completeLessonBtn = document.getElementById('complete-lesson-btn');
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');

    startLessonBtn.addEventListener('click', () => {
        lessonContent.style.display = 'block';
        lessonSections[0].style.display = 'block';
        startLessonBtn.style.display = 'none'; // Hide start button
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            lessonSections.forEach(section => section.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Quiz questions
    const quizQuestions = [
        {
            question: "What is a synonym for 'happy'?",
            options: ["sad", "joyful", "angry", "tired"],
            answer: "joyful"
        },
        {
            question: "What is an antonym for 'big'?",
            options: ["large", "huge", "small", "tall"],
            answer: "small"
        },
        {
            question: "What is a synonym for 'brave'?",
            options: ["cowardly", "timid", "fearless", "weak"],
            answer: "fearless"
        },
        {
            question: "What is an antonym for 'begin'?",
            options: ["start", "initiate", "commence", "end"],
            answer: "end"
        }
        // Add more questions here
    ];

    // Function to display quiz questions
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

    // Function to check quiz answers
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

    // Event listener for quiz submission
    submitQuizBtn.addEventListener('click', checkQuizAnswers);

    // Show quiz when the "Interactive Quiz" section is reached
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            if (targetId === 'section-4') {
                displayQuizQuestions();
            }
        });
    });

    completeLessonBtn.addEventListener('click', async function() {
        const lessonId = this.dataset.lessonId;

        // Send lesson completion data (if needed)
        try {
            const response = await fetch('/api/complete-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId })
            });

            if (response.ok) {
                console.log('Lesson completion data sent successfully');
            } else {
                console.error('Failed to send lesson completion data', await response.json());
            }
        } catch (error) {
            console.error('Error while sending lesson completion data:', error);
        }

        // Redirect after a delay
        setTimeout(() => {
            window.location.href = "/lesson-library";
        }, 1000);
    });
});