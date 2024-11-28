// JavaScript: Functional Next and Previous Buttons

// Sample questions and passage data
const questions = [
    {
        title: "Question 1",
        text: "What is the main idea of the passage?",
        options: [
            "A. Governments provide essential benefits to citizens.",
            "B. Political systems are unrelated to economic systems.",
            "C. Adam Smith's theories had no impact on economics.",
            "D. All governmental systems operate in the same way."
        ],
        passage: `
        The term government describes the means by which a society organizes itself and how it allocates authority in order to accomplish collective goals and provide benefits that the society as a whole needs. Among the goals that governments around the world seek to accomplish are economic prosperity, secure national borders, and the safety and well-being of citizens. Governments also provide benefits for their citizens. The type of benefits provided differ according to the country and their specific type of governmental system, but governments commonly provide such things as education, health care, and an infrastructure for transportation. The term politics refers to the process of gaining and exercising control within a government for the purpose of setting and achieving particular goals, especially those related to the division of resources within a nation.

        Sometimes governmental systems are confused with economic systems. This is because certain types of political thought or governmental organization are closely related to or develop with certain types of economic systems. For example, the economic system of capitalism in Western Europe and North America developed at roughly the same time as ideas about democratic republics, self-government, and natural rights. At this time, the idea of liberty became an important concept. According to John Locke, an English political philosopher of the seventeenth century, all people have natural rights to life, liberty, and property. From this came the idea that people should be free to consent to being governed. In the eighteenth century, in Great Britain’s North American colonies, and later in France, this developed into the idea that people should govern themselves through elected representatives and not a king; only those representatives chosen by the people had the right to make laws to govern them.

        Similarly, Adam Smith, a Scottish philosopher who was born nineteen years after Locke’s death, believed that all people should be free to acquire property in any way that they wished. Instead of being controlled by government, business, and industry, Smith argued, people should be allowed to operate as they wish and keep the proceeds of their work. Competition would ensure that prices remained low and faulty goods disappeared from the market. In this way, businesses would reap profits, consumers would have their needs satisfied, and society as a whole would prosper. Smith discussed these ideas, which formed the basis for industrial capitalism, in his book The Wealth of Nations, which was published in 1776, the same year that the Declaration of Independence was written.
        `
    },
    {
        title: "Question 2",
        text: "Which statement best supports the main idea of the passage?",
        options: [
            "A. Governments always guarantee equality.",
            "B. Political and economic systems often develop together.",
            "C. Adam Smith advocated for strong government control.",
            "D. Democracy and capitalism are unrelated."
        ],
        passage: `
        In democratic societies, the rule of law and individual rights are intertwined with economic freedoms. The principles of free-market capitalism ensure that individuals and businesses have the liberty to make their own economic decisions while governments play a role in ensuring fairness and protecting the public good. This relationship between politics and economics has shaped modern societies, emphasizing the need for governance structures that prioritize equality, fairness, and prosperity.`
    }
];


// Track current question index
let currentQuestionIndex = 0;

// DOM Elements
const passageElement = document.getElementById("passage");
const questionTitleElement = document.getElementById("question-title");
const questionTextElement = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

// Load a question
function loadQuestion(index) {
    const question = questions[index];
    passageElement.textContent = question.passage;
    questionTitleElement.textContent = question.title;
    questionTextElement.textContent = question.text;

    // Clear and load options
    optionsContainer.innerHTML = "";
    question.options.forEach(option => {
        const label = document.createElement("label");
        label.className = "choice-box";
        label.innerHTML = `
            <input type="radio" name="question${index}" value="${option}">
            <span>${option}</span>
        `;
        optionsContainer.appendChild(label);
    });

    // Handle button states
    prevButton.disabled = index === 0;
    nextButton.disabled = index === questions.length - 1;
}

// Event Listeners
prevButton.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
});

// Initial Load
loadQuestion(currentQuestionIndex);


// Timer variables
let timeLeft = 45 * 60; // 45 minutes in seconds
const timerElement = document.getElementById("timer");

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to start the countdown
function startTimer() {
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
        } else {
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
        }
    }, 1000);
}

// Start the timer
startTimer();


document.addEventListener("DOMContentLoaded", () => {
    const passage = document.getElementById("passage");
    const highlightUI = document.getElementById("highlight-ui");
    const tooltip = document.getElementById("tooltip");
    const noteInput = document.querySelector(".note-input");
    const saveNoteBtn = document.getElementById("save-note");
    let activeColor = null; // Selected highlight color
    let activeHighlight = null; // Active highlighted element for editing

    // Hover to show highlight UI
    passage.addEventListener("mouseover", (e) => {
        if (!e.target.classList.contains("highlighted")) {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                highlightUI.style.top = `${window.scrollY + rect.bottom + 5}px`;
                highlightUI.style.left = `${rect.left}px`;
                highlightUI.style.display = "block";
                activeHighlight = null; // Reset active highlight
            }
        }
    });

    // Click on color to highlight
    document.querySelectorAll(".color-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const selection = window.getSelection();
            if (!selection.toString().trim() && !activeHighlight) return;

            const range = selection.getRangeAt(0);

            if (activeHighlight) {
                // Remove highlight if clicked again
                if (activeHighlight.style.backgroundColor === e.target.dataset.color) {
                    activeHighlight.replaceWith(document.createTextNode(activeHighlight.textContent));
                    activeHighlight = null;
                }
                return;
            }

            // Add highlight
            const span = document.createElement("span");
            span.style.backgroundColor = e.target.dataset.color;
            span.textContent = range.toString();
            span.classList.add("highlighted");

            range.deleteContents();
            range.insertNode(span);

            span.addEventListener("click", () => {
                activeHighlight = span;
                noteInput.value = span.getAttribute("data-note") || "";
                highlightUI.style.display = "block";
            });

            selection.removeAllRanges();
        });
    });

    // Save note
    saveNoteBtn.addEventListener("click", () => {
        if (activeHighlight) {
            activeHighlight.setAttribute("data-note", noteInput.value);
        }
        highlightUI.style.display = "none";
    });

    // Hover on highlighted text to show tooltip
    passage.addEventListener("mouseover", (e) => {
        if (e.target.classList.contains("highlighted") && e.target.dataset.note) {
            tooltip.textContent = e.target.dataset.note;
            tooltip.style.display = "block";
            tooltip.style.top = `${e.pageY + 5}px`;
            tooltip.style.left = `${e.pageX + 5}px`;
        }
    });

    passage.addEventListener("mouseout", (e) => {
        if (e.target.classList.contains("highlighted")) {
            tooltip.style.display = "none";
        }
    });

    // Hide UI when clicking outside
    document.addEventListener("click", (e) => {
        if (!highlightUI.contains(e.target) && !passage.contains(e.target)) {
            highlightUI.style.display = "none";
        }
    });
});
