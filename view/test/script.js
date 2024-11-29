const passageText = document.getElementById('passage-text');
const highlightButton = document.getElementById('highlight-button');
const colorPalette = document.querySelector('.color-palette');
const colorOptions = document.querySelectorAll('.color-option');
const noteArea = document.querySelector('.note-area');
const noteText = document.getElementById('note-text');
const saveNoteButton = document.getElementById('save-note-button');

let selectedColor = 'yellow'; // Default highlight color
let currentHighlight = null; // Keep track of currently highlighted span

// Highlight and Note-Taking Logic
highlightButton.addEventListener('click', () => {
    colorPalette.classList.toggle('active');
});

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        selectedColor = option.dataset.color;
        highlightText();
        colorPalette.classList.remove('active'); // Hide palette after selection
    });
});

function highlightText() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
        const range = selection.getRangeAt(0);
        currentHighlight = document.createElement('span');
        currentHighlight.classList.add('highlight', selectedColor);
        currentHighlight.textContent = selectedText;
        range.deleteContents();
        range.insertNode(currentHighlight);

        // Show note area and position it near the highlight
        noteArea.classList.add('active');
        const highlightRect = currentHighlight.getBoundingClientRect();
        noteArea.style.top = `${highlightRect.bottom + 5}px`;
        noteArea.style.left = `${highlightRect.left}px`;
        noteText.value = ''; // Clear previous note

    }
    selection.removeAllRanges();
}

passageText.addEventListener('mouseup', () => {
    if (colorPalette.classList.contains('active')) {
        highlightText();
    }
});

saveNoteButton.addEventListener('click', () => {
    if (currentHighlight) {
        const note = noteText.value;
        currentHighlight.dataset.note = note; // Store
    }
}

   // Question Data (Replace with your actual questions)
   const questions = [
    {
        number: 1,
        text: "What is the main idea of the passage?",
        options: [
            "A. Governments provide essential benefits to citizens.",
            "B. Political systems are unrelated to economic systems.",
            "C. Adam Smith's theories had no impact on economics.",
            "D. All governmental systems operate in the same way."
        ],
        answer: "A"
    },
    {
        number: 2,
        text: "According to the passage, what is the purpose of politics?",
        options: [
            "A. To confuse citizens about economics.",
            "B. To set and achieve particular goals within a government.",
            "C. To promote a single type of economic system.",
            "D. To separate resources equally among all nations."
        ],
        answer: "B"
    },
    // Add more questions here...
];

let currentQuestionIndex = 0;
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const answerList = document.getElementById('answer-list');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

// Function to load a question
function loadQuestion(index) {
    const question = questions[index];
    questionNumber.textContent = `Question ${question.number}`;
    questionText.textContent = question.text;

    answerList.innerHTML = '';
    question.options.forEach((option, i) => {
        const listItem = document.createElement('li');
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'answer';
        radioInput.id = `answer${String.fromCharCode(65 + i)}`; // A, B, C, D
        radioInput.value = String.fromCharCode(65 + i);

        const label = document.createElement('label');
        label.htmlFor = `answer${String.fromCharCode(65 + i)}`;
        label.textContent = option;

        listItem.appendChild(radioInput);
        listItem.appendChild(label);
        answerList.appendChild(listItem);
    });
}

// Initial question load
loadQuestion(currentQuestionIndex);

// Navigation buttons
prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
});

//Store highlights and notes
let highlightsAndNotes = [];
function saveHighlightsAndNotes() {
    const allHighlights = document.querySelectorAll('.highlight');
    allHighlights.forEach(highlight => {
        const text = highlight.textContent;
        const color = highlight.classList.contains('yellow') ? 'yellow' : highlight.classList.contains('green') ? 'green' : 'blue';
        const note = highlight.dataset.note || '';
        highlightsAndNotes.push({text, color, note});
    });
    console.log(highlightsAndNotes);
}

window.addEventListener('beforeunload', saveHighlightsAndNotes);

function loadHighlightsAndNotes() {
    const storedHighlightsAndNotes = localStorage.getItem('highlightsAndNotes');

    if (storedHighlightsAndNotes) {
        const parsedHighlightsAndNotes = JSON.parse(storedHighlightsAndNotes);

        parsedHighlightsAndNotes.forEach(highlightData => {
            const textToHighlight = highlightData.text;
            const color = highlightData.color;
            const note = highlightData.note;

            const textNodes = getTextNodes(passageText);

            textNodes.forEach(textNode => {
                const text = textNode.nodeValue;
                const index = text.indexOf(textToHighlight);

                if (index !== -1) {
                    const range = document.createRange();
                    range.setStart(textNode, index);
                    range.setEnd(textNode, index + textToHighlight.length);

                    const span = document.createElement('span');
                    span.classList.add('highlight', color);
                    span.textContent = textToHighlight;
                    span.dataset.note = note;

                    range.deleteContents();
                    range.insertNode(span);
                }
            });
        });
    }
}

// Helper function to get all text nodes within an element
function getTextNodes(element) {
    let textNodes = [];
    if (element) {
        if (element.nodeType === Node.TEXT_NODE) {
            textNodes.push(element);
        } else {
            for (let child of element.childNodes) {
                textNodes = textNodes.concat(getTextNodes(child));
            }
        }
    }
    return textNodes;
}
window.addEventListener('load', loadHighlightsAndNotes);

// Answer Submission/Storage
let userAnswers = {};

answerList.addEventListener('change', (event) => {
    if(event.target.type === 'radio') {
        userAnswers[questions[currentQuestionIndex].number] = event.target.value;
        console.log("User Answers:", userAnswers);
    }
});

function submitTest() {
    saveHighlightsAndNotes();
    const results = calculateResults(userAnswers);
    displayResults(results);
    storeResults(userAnswers, results);
}

function calculateResults(userAnswers) {
    let correctAnswers = 0;
    for (const questionNumber in userAnswers) {
        if (userAnswers.hasOwnProperty(questionNumber)) {
            const userAnswer = userAnswers[questionNumber];
            const correctAnswer = questions.find(q => q.number === parseInt(questionNumber)).answer;
            if (userAnswer === correctAnswer) {
                correctAnswers++;
            }
        }
    }
    return {
        correct: correctAnswers,
        total: questions.length,
        score: (correctAnswers / questions.length) * 100
    };
}

function displayResults(results) {
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = `
        <h2>Test Results</h2>
        <p>Correct Answers: ${results.correct}</p>
        <p>Total Questions: ${results.total}</p>
        <p>Score: ${results.score.toFixed(2)}%</p>
        <button id="view-answers-button">View Answers</button>
    `;
    document.body.appendChild(resultDiv);

    document.getElementById('view-answers-button').addEventListener('click', () => {
        displayAnswerKey();
    });
}

 function displayAnswerKey() {
    const answerKeyDiv = document.createElement('div');
    answerKeyDiv.innerHTML = '<h2>Answer Key</h2>';
    const answerKeyList = document.createElement('ul');

    questions.forEach(question => {
        const listItem = document.createElement('li');
        listItem.textContent = `Question ${question.number}: ${question.answer}`;
        answerKeyList.appendChild(listItem);
    });

    answerKeyDiv.appendChild(answerKeyList);
    document.body.appendChild(answerKeyDiv);
}

function storeResults(userAnswers, results) {
    const testData = {
        questions: questions,
        userAnswers: userAnswers,
        results: results,
        highlightsAndNotes: highlightsAndNotes
    };
    localStorage.setItem('testData', JSON.stringify(testData));
    console.log("Test Data Stored:", testData);
}

const submitButton = document.createElement('button');
submitButton.id = 'submit-button';
submitButton.textContent = 'Submit Test';
submitButton.addEventListener('click', submitTest);
document.querySelector('.controls').appendChild(submitButton);