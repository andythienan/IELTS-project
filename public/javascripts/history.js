async function fetchUserActivityHistory() {
    try {
        const response = await fetch('/api/user-history');
        if (!response.ok) throw new Error('Failed to fetch user history.');

        const { quizzes, lessons, writings } = await response.json();

        // Populate quizzes
        const quizList = document.getElementById('quiz-history-list');
        quizList.innerHTML = '';
        if (quizzes.length > 0) {
            quizzes.forEach(quiz => {
                const listItem = document.createElement('li');
                listItem.textContent = `${quiz.quizId} - Score: ${quiz.score}, Percentage: ${quiz.percentage}% (Completed on ${new Date(quiz.timestamp).toLocaleDateString()})`;
                quizList.appendChild(listItem);
            });
        } else {
            quizList.innerHTML = '<li class="no-data">No quizzes completed yet.</li>';
        }

        // Populate lessons
        const lessonList = document.getElementById('lesson-history-list');
        lessonList.innerHTML = '';
        if (lessons.length > 0) {
            lessons.forEach(lesson => {
                const listItem = document.createElement('li');
                listItem.textContent = `${lesson.lessonId} (Completed on ${new Date(lesson.completedAt).toLocaleDateString()})`;
                lessonList.appendChild(listItem);
            });
        } else {
            lessonList.innerHTML = '<li class="no-data">No lessons completed yet.</li>';
        }

        // Populate writings
        const writingList = document.getElementById('writing-history-list');
        writingList.innerHTML = '';
        if (writings.length > 0) {
            writings.forEach(writing => {
                const listItem = document.createElement('li');
                listItem.textContent = `Task: ${writing.task} - Word Count: ${writing.wordCount} (Submitted on ${new Date(writing.completedAt).toLocaleDateString()})`;
                writingList.appendChild(listItem);
            });
        } else {
            writingList.innerHTML = '<li class="no-data">No writing submissions yet.</li>';
        }
    } catch (error) {
        console.error('Error fetching user history:', error);
    }
}

// Fetch user history on page load
fetchUserActivityHistory();