async function fetchUserActivityHistory() {
    try {
      const response = await fetch("/api/user-history");
      if (!response.ok) throw new Error("Failed to fetch user history.");
  
      const { quizzes, lessons, writings } = await response.json();
  
        // Populate quizzes
        const quizData = quizzes.reduce((acc, quiz) => {
          if (!acc[quiz.quizType]) {
            acc[quiz.quizType] = [];
          }
          acc[quiz.quizType].push(quiz);
          return acc;
        }, {});
  
      const quizListContainer = document.getElementById("quiz-history-list");
        quizListContainer.innerHTML = "";
  
  
      for (const quizType in quizData) {
            const quizSection = document.createElement("div");
          quizSection.classList.add("skill-section");
  
          const quizHeading = document.createElement("h3");
            quizHeading.style.fontSize = "1.2rem";
            quizHeading.style.color = "#444";
  
         const historyListContainer = document.createElement('div');
         historyListContainer.classList.add('history-list-container')
          const historyList = document.createElement("ul");
           historyList.classList.add("history-list");
            quizData[quizType].forEach((quiz) => {
              const listItem = document.createElement("li");
              listItem.textContent = `${quiz.quizId} - Score: ${quiz.score}, Percentage: ${quiz.percentage}% (Completed on ${new Date(quiz.timestamp).toLocaleDateString()})`;
              historyList.appendChild(listItem);
           });
           historyListContainer.appendChild(historyList)
           quizSection.appendChild(quizHeading)
          quizSection.appendChild(historyListContainer);
        quizListContainer.appendChild(quizSection);
        }
      if (Object.keys(quizData).length === 0) {
       quizListContainer.innerHTML =
          '<li class="no-data">No quizzes completed yet.</li>';
      }
  
      // Populate lessons
      const lessonData = lessons.reduce((acc, lesson) => {
        if (!acc[lesson.skill]) {
          acc[lesson.skill] = [];
        }
        acc[lesson.skill].push(lesson);
        return acc;
      }, {});
  
  
      const lessonListContainer = document.getElementById("lesson-history-list");
        lessonListContainer.innerHTML = "";
  
      for (const skill in lessonData) {
        const skillSection = document.createElement("div");
        skillSection.classList.add("skill-section");
  
        const skillHeading = document.createElement("h3");
         skillHeading.style.fontSize = "1.2rem";
          skillHeading.style.color = "#444";
  
  
         const historyListContainer = document.createElement('div');
        historyListContainer.classList.add('history-list-container')
  
         const historyList = document.createElement("ul");
         historyList.classList.add("history-list");
          lessonData[skill].forEach((lesson) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${lesson.lessonId} (Completed on ${new Date(
              lesson.completedAt
            ).toLocaleDateString()})`;
            historyList.appendChild(listItem);
          });
         historyListContainer.appendChild(historyList)
        skillSection.appendChild(skillHeading);
         skillSection.appendChild(historyListContainer);
          lessonListContainer.appendChild(skillSection);
      }
      if (Object.keys(lessonData).length === 0) {
          lessonListContainer.innerHTML =
          '<li class="no-data">No lessons completed yet.</li>';
      }
  
  
      // Populate writings
      populateHistoryList("writing-history-list", writings, (writing) => {
        return `Task: ${writing.task} - Word Count: ${
          writing.wordCount
        } (Submitted on ${new Date(writing.completedAt).toLocaleDateString()})`;
      });
  
  
      // Attach event listeners for collapsible sections
      const headers = document.querySelectorAll(".history-section h2");
          headers.forEach((header) => {
              header.addEventListener("click", function() {
              const section = this.closest(".history-section");
              if (!section) {
                  console.error("Error: No history section found for event target", this);
                  return;
              }
               const listContainer = section.querySelector(".history-list-container");
              if (!listContainer) {
                  console.error("Error: No list container found for", section);
                   return;
              }
              this.classList.toggle("collapsed");
              listContainer.classList.toggle("collapsed");
          });
      });
  
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  }
  
  function populateHistoryList(listId, data, formatItem) {
      const listContainer = document.getElementById(listId);
    listContainer.innerHTML = "";
  
    const historyListContainer = document.createElement('div');
      historyListContainer.classList.add('history-list-container')
    const list = document.createElement("ul");
        list.classList.add("history-list");
  
    if (data && data.length > 0) {
      data.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = formatItem(item);
        list.appendChild(listItem);
      });
    } else {
      const noData = document.createElement("li");
      noData.classList.add("no-data");
      noData.textContent = `No items found.`;
      list.appendChild(noData);
    }
       historyListContainer.appendChild(list)
      listContainer.appendChild(historyListContainer);
  }
  
  // Fetch user history on page load
  fetchUserActivityHistory();