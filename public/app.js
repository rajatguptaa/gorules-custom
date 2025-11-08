// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State Management
let currentQuestion = null;
let sessionId = null;
let answers = [];
let questionHistory = [];
let currentQuestionIndex = 0;

// DOM Elements
const loadingEl = document.getElementById('loading');
const questionContainerEl = document.getElementById('question-container');
const diagnosisContainerEl = document.getElementById('diagnosis-container');
const errorContainerEl = document.getElementById('error-container');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const progressEl = document.getElementById('progress');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const errorMessageEl = document.getElementById('error-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startQuestionnaire();
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrevious);
    restartBtn.addEventListener('click', resetQuestionnaire);
    retryBtn.addEventListener('click', startQuestionnaire);
});

// Start Questionnaire
async function startQuestionnaire() {
    try {
        showLoading();
        hideError();
        
        // Get first question
        const response = await fetch(`${API_BASE_URL}/questions/first`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                throw new Error('No questions found. Please create questions in the database first.');
            }
            throw new Error(errorData.message || `Failed to fetch first question (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('No questions available. Please create questions in the database.');
        }
        
        currentQuestion = data.data;
        console.log('Current question set:', currentQuestion);
        
        questionHistory = [currentQuestion];
        currentQuestionIndex = 0;
        answers = [];
        sessionId = null;
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            showQuestion();
        }, 100);
    } catch (error) {
        console.error('Error starting questionnaire:', error);
        showError(error.message || 'Failed to start questionnaire. Please check if the server is running and questions are created.');
    }
}

// Show Question
function showQuestion() {
    if (!currentQuestion) {
        console.error('No current question to display');
        showError('No question data available');
        return;
    }
    
    hideAll();
    questionContainerEl.classList.remove('hidden');
    
    // Set question text
    if (currentQuestion.questionText) {
        questionTextEl.textContent = currentQuestion.questionText;
    } else {
        questionTextEl.textContent = 'Question';
        console.warn('Question text is missing');
    }
    
    // Clear options container
    optionsContainerEl.innerHTML = '';
    
    // Create options
    if (currentQuestion.options && currentQuestion.options.length > 0) {
        currentQuestion.options.forEach((option, index) => {
            const optionEl = createOptionElement(option, index);
            optionsContainerEl.appendChild(optionEl);
        });
    } else {
        // For text/number questions
        const inputEl = document.createElement('input');
        inputEl.type = currentQuestion.questionType === 'number' ? 'number' : 'text';
        inputEl.className = 'option';
        inputEl.placeholder = 'Enter your answer...';
        optionsContainerEl.appendChild(inputEl);
    }
    
    // Update progress
    updateProgress();
    
    // Update buttons
    prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
    nextBtn.disabled = true;
    
    console.log('Question displayed:', currentQuestion.questionText);
}

// Create Option Element
function createOptionElement(option, index) {
    const optionEl = document.createElement('label');
    optionEl.className = 'option';
    optionEl.dataset.optionId = option.id;
    optionEl.dataset.optionValue = option.value;
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'question-option';
    radio.value = option.value;
    radio.dataset.optionId = option.id;
    
    const text = document.createTextNode(option.text);
    
    optionEl.appendChild(radio);
    optionEl.appendChild(text);
    
    // Add click handler
    optionEl.addEventListener('click', () => {
        // Unselect all
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select this one
        optionEl.classList.add('selected');
        radio.checked = true;
        nextBtn.disabled = false;
    });
    
    return optionEl;
}

// Handle Next
async function handleNext() {
    try {
        const selectedOption = document.querySelector('input[name="question-option"]:checked');
        
        if (!selectedOption && currentQuestion.questionType === 'single-choice') {
            alert('Please select an option');
            return;
        }
        
        const selectedOptionId = selectedOption ? selectedOption.dataset.optionId : null;
        const answerValue = selectedOption ? selectedOption.value : 
                          (document.querySelector('input[type="text"], input[type="number"]')?.value || '');
        
        // Save answer
        await saveAnswer(currentQuestion.id, selectedOptionId, answerValue);
        
        // Get next question
        const nextQuestion = await getNextQuestion(currentQuestion.id, selectedOptionId);
        
        if (nextQuestion) {
            currentQuestion = nextQuestion;
            questionHistory.push(currentQuestion);
            currentQuestionIndex++;
            showQuestion();
        } else {
            // No more questions, complete and show diagnosis
            await completeQuestionnaire();
        }
    } catch (error) {
        showError(error.message);
    }
}

// Handle Previous
async function handlePrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        currentQuestion = questionHistory[currentQuestionIndex];
        // Remove last answer
        answers.pop();
        showQuestion();
    }
}

// Save Answer
async function saveAnswer(questionId, selectedOptionId, answerValue) {
    try {
        const response = await fetch(`${API_BASE_URL}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: sessionId,
                questionId: questionId,
                selectedOptionId: selectedOptionId,
                answerValue: answerValue,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to save answer (Status: ${response.status})`);
        }
        
        const data = await response.json();
        sessionId = data.sessionId || data.data.sessionId;
        answers.push({
            questionId,
            selectedOptionId,
            answerValue,
        });
    } catch (error) {
        console.error('Error saving answer:', error);
        throw error;
    }
}

// Get Next Question
async function getNextQuestion(currentQuestionId, selectedOptionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/next`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentQuestionId: currentQuestionId,
                selectedOptionId: selectedOptionId,
                answers: buildAnswersObject(),
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get next question (Status: ${response.status})`);
        }
        
        const data = await response.json();
        return data.data; // Can be null if no more questions
    } catch (error) {
        console.error('Error getting next question:', error);
        throw error;
    }
}

// Build Answers Object
function buildAnswersObject() {
    const answersObj = {};
    answers.forEach(answer => {
        if (answer.selectedOptionId) {
            answersObj[answer.selectedOptionId] = answer.answerValue;
        }
        answersObj[answer.questionId] = answer.answerValue;
    });
    return answersObj;
}

// Complete Questionnaire
async function completeQuestionnaire() {
    try {
        showLoading();
        
        if (!sessionId) {
            throw new Error('No session found');
        }
        
        const response = await fetch(`${API_BASE_URL}/responses/${sessionId}/complete`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to complete questionnaire (Status: ${response.status})`);
        }
        
        const data = await response.json();
        showDiagnosis(data.data);
    } catch (error) {
        console.error('Error completing questionnaire:', error);
        showError(error.message || 'Failed to complete questionnaire. Please try again.');
    }
}

// Show Diagnosis
function showDiagnosis(responseData) {
    hideAll();
    diagnosisContainerEl.classList.remove('hidden');
    
    const diagnosis = responseData.diagnosis;
    
    if (!diagnosis) {
        document.getElementById('diagnosis-name').textContent = 'No diagnosis available';
        document.getElementById('diagnosis-description').textContent = 
            'We could not generate a diagnosis based on your answers.';
        return;
    }
    
    // Set diagnosis details
    document.getElementById('diagnosis-name').textContent = diagnosis.name;
    document.getElementById('diagnosis-description').textContent = 
        diagnosis.description || 'Based on your answers, here are our recommendations:';
    
    // Set recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
        diagnosis.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No specific recommendations available.';
        recommendationsList.appendChild(li);
    }
    
    // Set products
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    if (diagnosis.products && diagnosis.products.length > 0) {
        diagnosis.products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = product;
            productsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No specific products recommended.';
        productsList.appendChild(li);
    }
    
    // Set severity badge
    const severityBadge = document.getElementById('severity-badge');
    if (diagnosis.severity) {
        severityBadge.textContent = `Severity: ${diagnosis.severity}`;
        severityBadge.className = `severity-badge ${diagnosis.severity}`;
    } else {
        severityBadge.style.display = 'none';
    }
}

// Update Progress
function updateProgress() {
    // Simple progress calculation (can be improved)
    const totalQuestions = 5; // Estimate or track actual total
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressEl.style.width = `${Math.min(progress, 100)}%`;
}

// Reset Questionnaire
function resetQuestionnaire() {
    currentQuestion = null;
    sessionId = null;
    answers = [];
    questionHistory = [];
    currentQuestionIndex = 0;
    startQuestionnaire();
}

// Show/Hide Helpers
function showLoading() {
    hideAll();
    loadingEl.classList.remove('hidden');
}

function showError(message) {
    hideAll();
    errorContainerEl.classList.remove('hidden');
    
    let errorText = message;
    
    // Add helpful instructions for common errors
    if (message.includes('No questions found') || message.includes('No questions available')) {
        errorText += '\n\nTo create sample questions, run:\nnode scripts/create-sample-questions.js';
    } else if (message.includes('Failed to fetch') || message.includes('network')) {
        errorText += '\n\nPlease check:\n1. Server is running (npm start)\n2. MongoDB is connected\n3. CORS is configured correctly';
    }
    
    errorMessageEl.innerHTML = errorText.replace(/\n/g, '<br>');
}

function hideAll() {
    loadingEl.classList.add('hidden');
    questionContainerEl.classList.add('hidden');
    diagnosisContainerEl.classList.add('hidden');
    errorContainerEl.classList.add('hidden');
}

function hideError() {
    errorContainerEl.classList.add('hidden');
}
