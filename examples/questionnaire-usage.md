# Hair Care Questionnaire - Example Usage

This document provides practical examples of how to use the Hair Care Questionnaire API.

## Table of Contents

1. [Setting Up Questions](#setting-up-questions)
2. [User Flow Examples](#user-flow-examples)
3. [Admin Management Examples](#admin-management-examples)
4. [Complete Questionnaire Flow](#complete-questionnaire-flow)

---

## Setting Up Questions

### 1. Create the First Question (Hair Type)

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is your hair type?",
    "questionType": "single-choice",
    "category": "hair-type",
    "tags": ["hair-type", "initial"],
    "order": 1,
    "isFirstQuestion": true,
    "isActive": true,
    "options": [
      {
        "id": "opt1",
        "text": "Dry Hair",
        "value": "dry",
        "tags": ["dry", "hair-type"]
      },
      {
        "id": "opt2",
        "text": "Oily Hair",
        "value": "oily",
        "tags": ["oily", "hair-type"]
      },
      {
        "id": "opt3",
        "text": "Normal Hair",
        "value": "normal",
        "tags": ["normal", "hair-type"]
      },
      {
        "id": "opt4",
        "text": "Combination Hair",
        "value": "combination",
        "tags": ["combination", "hair-type"]
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "questionText": "What is your hair type?",
    "category": "hair-type",
    "order": 1,
    "isFirstQuestion": true,
    "options": [...],
    "createdAt": "2025-01-27T10:00:00.000Z"
  }
}
```

**Save the question ID** (e.g., `507f1f77bcf86cd799439011`) for linking to next questions.

### 2. Create Scalp Condition Question (Linked to Hair Type)

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Do you have dandruff or dry scalp?",
    "questionType": "single-choice",
    "category": "scalp-condition",
    "tags": ["scalp", "dandruff", "dry-scalp"],
    "order": 2,
    "isActive": true,
    "options": [
      {
        "id": "opt1",
        "text": "Yes, I have dandruff",
        "value": "dandruff",
        "tags": ["dandruff", "scalp-problem"]
      },
      {
        "id": "opt2",
        "text": "Yes, I have dry scalp",
        "value": "dry-scalp",
        "tags": ["dry-scalp", "scalp-problem"]
      },
      {
        "id": "opt3",
        "text": "No, I don'\''t have any scalp issues",
        "value": "none",
        "tags": ["healthy-scalp"]
      }
    ]
  }'
```

**Note:** After creating this question, you'll need to update the first question's options to link to this question using `nextQuestionId`.

### 3. Link Questions Together

Update the first question's options to point to the scalp condition question:

```bash
# First, get the scalp question ID (let's say it's 507f1f77bcf86cd799439012)
# Then update the first question:

curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "options": [
      {
        "id": "opt1",
        "text": "Dry Hair",
        "value": "dry",
        "tags": ["dry"],
        "nextQuestionId": "507f1f77bcf86cd799439012"
      },
      {
        "id": "opt2",
        "text": "Oily Hair",
        "value": "oily",
        "tags": ["oily"],
        "nextQuestionId": "507f1f77bcf86cd799439012"
      },
      {
        "id": "opt3",
        "text": "Normal Hair",
        "value": "normal",
        "tags": ["normal"],
        "nextQuestionId": "507f1f77bcf86cd799439012"
      },
      {
        "id": "opt4",
        "text": "Combination Hair",
        "value": "combination",
        "tags": ["combination"],
        "nextQuestionId": "507f1f77bcf86cd799439012"
      }
    ]
  }'
```

### 4. Create Hair Problem Question

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is your main hair concern?",
    "questionType": "single-choice",
    "category": "hair-problem",
    "tags": ["hair-problem", "concern"],
    "order": 3,
    "isActive": true,
    "options": [
      {
        "id": "opt1",
        "text": "Hair Loss",
        "value": "hair-loss",
        "tags": ["hair-loss", "problem"]
      },
      {
        "id": "opt2",
        "text": "Frizz",
        "value": "frizz",
        "tags": ["frizz", "problem"]
      },
      {
        "id": "opt3",
        "text": "Split Ends",
        "value": "split-ends",
        "tags": ["split-ends", "problem"]
      },
      {
        "id": "opt4",
        "text": "Lack of Volume",
        "value": "no-volume",
        "tags": ["volume", "problem"]
      },
      {
        "id": "opt5",
        "text": "None of the above",
        "value": "none",
        "tags": ["no-problem"]
      }
    ]
  }'
```

---

## User Flow Examples

### Step 1: Get the First Question

```bash
curl http://localhost:3000/api/questions/first
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "questionText": "What is your hair type?",
    "options": [
      {"id": "opt1", "text": "Dry Hair", "value": "dry"},
      {"id": "opt2", "text": "Oily Hair", "value": "oily"},
      {"id": "opt3", "text": "Normal Hair", "value": "normal"},
      {"id": "opt4", "text": "Combination Hair", "value": "combination"}
    ]
  }
}
```

### Step 2: User Selects an Option and Gets Next Question

```bash
curl -X POST http://localhost:3000/api/questions/next \
  -H "Content-Type: application/json" \
  -d '{
    "currentQuestionId": "507f1f77bcf86cd799439011",
    "selectedOptionId": "opt1",
    "answers": {
      "hairType": "dry"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "questionText": "Do you have dandruff or dry scalp?",
    "options": [
      {"id": "opt1", "text": "Yes, I have dandruff", "value": "dandruff"},
      {"id": "opt2", "text": "Yes, I have dry scalp", "value": "dry-scalp"},
      {"id": "opt3", "text": "No, I don'\''t have any scalp issues", "value": "none"}
    ]
  }
}
```

### Step 3: Continue the Flow

```bash
curl -X POST http://localhost:3000/api/questions/next \
  -H "Content-Type: application/json" \
  -d '{
    "currentQuestionId": "507f1f77bcf86cd799439012",
    "selectedOptionId": "opt1",
    "answers": {
      "hairType": "dry",
      "scalpCondition": "dandruff"
    }
  }'
```

### Step 4: End of Questionnaire

When there are no more questions, the API returns:

```json
{
  "success": true,
  "data": null,
  "message": "No more questions available"
}
```

---

## Admin Management Examples

### Get All Questions

```bash
curl "http://localhost:3000/api/questions?isActive=true&sortBy=order"
```

### Get Questions by Category

```bash
curl http://localhost:3000/api/questions/category/hair-type
```

### Update Question Text

```bash
curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What type of hair do you have?"
  }'
```

### Change Question Category

```bash
curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "hair-problem"
  }'
```

### Update Question Options

```bash
curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "options": [
      {
        "id": "opt1",
        "text": "Very Dry Hair",
        "value": "very-dry",
        "tags": ["dry"]
      },
      {
        "id": "opt2",
        "text": "Slightly Dry Hair",
        "value": "slightly-dry",
        "tags": ["dry"]
      }
    ]
  }'
```

### Reorder Questions

```bash
curl -X POST http://localhost:3000/api/questions/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "questionOrders": [
      {"questionId": "507f1f77bcf86cd799439011", "order": 1},
      {"questionId": "507f1f77bcf86cd799439012", "order": 2},
      {"questionId": "507f1f77bcf86cd799439013", "order": 3}
    ]
  }'
```

### Deactivate a Question

```bash
curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Delete a Question

```bash
curl -X DELETE http://localhost:3000/api/questions/507f1f77bcf86cd799439011
```

---

## Complete Questionnaire Flow

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

class QuestionnaireFlow {
  constructor() {
    this.answers = {};
    this.currentQuestion = null;
  }

  async start() {
    try {
      // Get first question
      const response = await axios.get(`${API_BASE_URL}/questions/first`);
      this.currentQuestion = response.data.data;
      return this.currentQuestion;
    } catch (error) {
      console.error('Error starting questionnaire:', error.message);
      throw error;
    }
  }

  async answerQuestion(selectedOptionId) {
    try {
      // Store the answer
      const selectedOption = this.currentQuestion.options.find(
        opt => opt.id === selectedOptionId
      );
      
      if (selectedOption) {
        this.answers[selectedOption.value] = selectedOption.text;
      }

      // Get next question
      const response = await axios.post(`${API_BASE_URL}/questions/next`, {
        currentQuestionId: this.currentQuestion.id,
        selectedOptionId: selectedOptionId,
        answers: this.answers
      });

      this.currentQuestion = response.data.data;
      
      if (!this.currentQuestion) {
        return {
          completed: true,
          message: 'Questionnaire completed!',
          answers: this.answers
        };
      }

      return this.currentQuestion;
    } catch (error) {
      console.error('Error answering question:', error.message);
      throw error;
    }
  }

  getAnswers() {
    return this.answers;
  }
}

// Usage Example
async function runQuestionnaire() {
  const flow = new QuestionnaireFlow();
  
  try {
    // Start questionnaire
    let question = await flow.start();
    console.log('Question:', question.questionText);
    question.options.forEach(opt => {
      console.log(`  ${opt.id}: ${opt.text}`);
    });

    // Simulate user selecting first option
    question = await flow.answerQuestion('opt1');
    
    if (question.completed) {
      console.log('Questionnaire completed!');
      console.log('Answers:', flow.getAnswers());
    } else {
      console.log('Next Question:', question.questionText);
      // Continue with more questions...
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the questionnaire
runQuestionnaire();
```

### Python Example

```python
import requests

API_BASE_URL = "http://localhost:3000/api"

class QuestionnaireFlow:
    def __init__(self):
        self.answers = {}
        self.current_question = None
    
    def start(self):
        """Get the first question"""
        response = requests.get(f"{API_BASE_URL}/questions/first")
        response.raise_for_status()
        self.current_question = response.json()["data"]
        return self.current_question
    
    def answer_question(self, selected_option_id):
        """Answer current question and get next question"""
        # Store the answer
        selected_option = next(
            (opt for opt in self.current_question["options"] 
             if opt["id"] == selected_option_id),
            None
        )
        
        if selected_option:
            self.answers[selected_option["value"]] = selected_option["text"]
        
        # Get next question
        response = requests.post(
            f"{API_BASE_URL}/questions/next",
            json={
                "currentQuestionId": self.current_question["id"],
                "selectedOptionId": selected_option_id,
                "answers": self.answers
            }
        )
        response.raise_for_status()
        
        result = response.json()["data"]
        
        if not result:
            return {
                "completed": True,
                "message": "Questionnaire completed!",
                "answers": self.answers
            }
        
        self.current_question = result
        return self.current_question
    
    def get_answers(self):
        return self.answers

# Usage Example
def run_questionnaire():
    flow = QuestionnaireFlow()
    
    try:
        # Start questionnaire
        question = flow.start()
        print(f"Question: {question['questionText']}")
        for opt in question["options"]:
            print(f"  {opt['id']}: {opt['text']}")
        
        # Simulate user selecting first option
        question = flow.answer_question("opt1")
        
        if question.get("completed"):
            print("Questionnaire completed!")
            print(f"Answers: {flow.get_answers()}")
        else:
            print(f"Next Question: {question['questionText']}")
            # Continue with more questions...
    
    except Exception as e:
        print(f"Error: {e}")

# Run the questionnaire
if __name__ == "__main__":
    run_questionnaire()
```

---

## Best Practices

1. **Always save question IDs** when creating questions to link them together
2. **Use tags** to group related questions and enable tag-based navigation
3. **Store user answers** in your application to build a complete profile
4. **Handle null responses** when `getNextQuestion` returns `null` (end of questionnaire)
5. **Use order field** to control question sequence when not using conditional logic
6. **Test question flow** before deploying to production
7. **Use isActive flag** to temporarily disable questions without deleting them

---

## Error Handling

```javascript
try {
  const response = await axios.get(`${API_BASE_URL}/questions/first`);
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

---

## Testing with Postman

1. Import the API collection (if available)
2. Set `API_BASE_URL` as an environment variable
3. Create questions using POST requests
4. Test the flow using GET `/questions/first` and POST `/questions/next`
5. Use the admin endpoints to manage questions

---

For more information, see the [API Documentation](http://localhost:3000/api-docs) or the main [README.md](../README.md).

