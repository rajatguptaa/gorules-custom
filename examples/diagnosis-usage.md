# Response and Diagnosis - Usage Examples

This document provides examples of how to save user responses and generate diagnoses.

## Table of Contents

1. [Saving User Responses](#saving-user-responses)
2. [Getting Diagnosis](#getting-diagnosis)
3. [Complete Flow Example](#complete-flow-example)
4. [Creating Diagnoses](#creating-diagnoses)

---

## Saving User Responses

### Save Answer to a Question

```bash
curl -X POST http://localhost:3000/api/responses \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "507f1f77bcf86cd799439011",
    "selectedOptionId": "opt1",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "answers": [
      {
        "questionId": "507f1f77bcf86cd799439011",
        "questionText": "What is your hair type?",
        "selectedOptionId": "opt1",
        "selectedOptionText": "Dry Hair",
        "answerValue": "dry",
        "answeredAt": "2025-01-27T10:00:00.000Z"
      }
    ],
    "allAnswers": {
      "opt1": "dry",
      "507f1f77bcf86cd799439011": "dry"
    },
    "completed": false
  },
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note:** Save the `sessionId` to continue adding answers in the same session.

### Continue Adding Answers

```bash
curl -X POST http://localhost:3000/api/responses \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "questionId": "507f1f77bcf86cd799439012",
    "selectedOptionId": "opt1"
  }'
```

### Get Response by Session ID

```bash
curl http://localhost:3000/api/responses/550e8400-e29b-41d4-a716-446655440000
```

---

## Getting Diagnosis

### Complete Response and Get Diagnosis

After user answers all questions, complete the response to generate diagnosis:

```bash
curl -X POST http://localhost:3000/api/responses/550e8400-e29b-41d4-a716-446655440000/complete
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "answers": [
      {
        "questionId": "507f1f77bcf86cd799439011",
        "questionText": "What is your hair type?",
        "selectedOptionId": "opt1",
        "answerValue": "dry"
      },
      {
        "questionId": "507f1f77bcf86cd799439012",
        "questionText": "Do you have dandruff?",
        "selectedOptionId": "opt1",
        "answerValue": "dandruff"
      }
    ],
    "completed": true,
    "completedAt": "2025-01-27T10:05:00.000Z",
    "diagnosis": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Dry Hair with Dandruff",
      "description": "Recommended treatment for dry hair with dandruff",
      "category": "hair-care",
      "recommendations": [
        "Use anti-dandruff shampoo",
        "Apply moisturizing conditioner",
        "Avoid hot water when washing",
        "Use hair oil for deep conditioning"
      ],
      "products": [
        "Anti-Dandruff Shampoo",
        "Moisturizing Conditioner",
        "Hair Oil"
      ],
      "severity": "medium"
    }
  },
  "message": "Response completed and diagnosis generated"
}
```

### Get Diagnosis Without Saving Response

If you want to get diagnosis for answers without saving:

```bash
curl -X POST http://localhost:3000/api/responses/diagnosis \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "opt1": "dry",
      "opt2": "dandruff",
      "507f1f77bcf86cd799439011": "dry"
    }
  }'
```

---

## Complete Flow Example

### JavaScript Example

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

class QuestionnaireWithDiagnosis {
  constructor() {
    this.sessionId = null;
    this.answers = {};
  }

  async start() {
    // Get first question
    const response = await axios.get(`${API_BASE_URL}/questions/first`);
    return response.data.data;
  }

  async answerQuestion(questionId, selectedOptionId) {
    // Save answer
    const response = await axios.post(`${API_BASE_URL}/responses`, {
      sessionId: this.sessionId,
      questionId,
      selectedOptionId,
    });

    this.sessionId = response.data.sessionId;
    this.answers[selectedOptionId] = response.data.data.allAnswers[selectedOptionId];

    return response.data.data;
  }

  async completeAndGetDiagnosis() {
    if (!this.sessionId) {
      throw new Error('No session started');
    }

    // Complete response and get diagnosis
    const response = await axios.post(
      `${API_BASE_URL}/responses/${this.sessionId}/complete`
    );

    return response.data.data;
  }

  async getDiagnosisForAnswers() {
    // Get diagnosis without saving
    const response = await axios.post(`${API_BASE_URL}/responses/diagnosis`, {
      answers: this.answers,
    });

    return response.data.data;
  }
}

// Usage
async function runQuestionnaire() {
  const questionnaire = new QuestionnaireWithDiagnosis();

  try {
    // Start questionnaire
    let question = await questionnaire.start();
    console.log('Question:', question.questionText);

    // Answer first question
    await questionnaire.answerQuestion(question.id, 'opt1');
    console.log('Answered: Dry Hair');

    // Get next question
    const nextResponse = await axios.post(`${API_BASE_URL}/questions/next`, {
      currentQuestionId: question.id,
      selectedOptionId: 'opt1',
    });
    question = nextResponse.data.data;

    // Answer second question
    await questionnaire.answerQuestion(question.id, 'opt1');
    console.log('Answered: Has Dandruff');

    // Complete and get diagnosis
    const result = await questionnaire.completeAndGetDiagnosis();
    console.log('\n=== DIAGNOSIS ===');
    console.log('Name:', result.diagnosis.name);
    console.log('Description:', result.diagnosis.description);
    console.log('\nRecommendations:');
    result.diagnosis.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.log('\nRecommended Products:');
    result.diagnosis.products.forEach((product, i) => {
      console.log(`${i + 1}. ${product}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runQuestionnaire();
```

---

## Creating Diagnoses

### Create a Diagnosis

```bash
curl -X POST http://localhost:3000/api/diagnoses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dry Hair with Dandruff",
    "description": "Recommended treatment for dry hair with dandruff",
    "category": "hair-care",
    "conditions": {
      "and": [
        { "==": [{ "var": "opt1" }, "dry"] },
        { "==": [{ "var": "opt2" }, "dandruff"] }
      ]
    },
    "recommendations": [
      "Use anti-dandruff shampoo",
      "Apply moisturizing conditioner",
      "Avoid hot water when washing",
      "Use hair oil for deep conditioning"
    ],
    "products": [
      "Anti-Dandruff Shampoo",
      "Moisturizing Conditioner",
      "Hair Oil"
    ],
    "severity": "medium",
    "priority": 1
  }'
```

### Example Diagnoses

#### 1. Dry Hair with Dandruff

```json
{
  "name": "Dry Hair with Dandruff",
  "description": "Treatment for dry hair with dandruff issues",
  "category": "hair-care",
  "conditions": {
    "and": [
      { "==": [{ "var": "opt1" }, "dry"] },
      { "or": [
        { "==": [{ "var": "opt2" }, "dandruff"] },
        { "==": [{ "var": "opt2" }, "dry-scalp"] }
      ]}
    ]
  },
  "recommendations": [
    "Use anti-dandruff shampoo 2-3 times per week",
    "Apply moisturizing conditioner after every wash",
    "Avoid hot water - use lukewarm water",
    "Use hair oil for deep conditioning twice a week",
    "Avoid excessive brushing when hair is wet"
  ],
  "products": [
    "Anti-Dandruff Shampoo",
    "Moisturizing Conditioner",
    "Hair Oil",
    "Scalp Treatment"
  ],
  "severity": "medium",
  "priority": 1
}
```

#### 2. Oily Hair with Hair Loss

```json
{
  "name": "Oily Hair with Hair Loss",
  "description": "Treatment for oily hair with hair loss concerns",
  "category": "hair-care",
  "conditions": {
    "and": [
      { "==": [{ "var": "opt1" }, "oily"] },
      { "==": [{ "var": "opt3" }, "hair-loss"] }
    ]
  },
  "recommendations": [
    "Wash hair daily with gentle shampoo",
    "Use lightweight conditioner",
    "Avoid heavy oils and products",
    "Consider hair loss treatment products",
    "Consult a dermatologist if hair loss persists"
  ],
  "products": [
    "Gentle Daily Shampoo",
    "Lightweight Conditioner",
    "Hair Loss Treatment Serum"
  ],
  "severity": "high",
  "priority": 2
}
```

#### 3. Normal Hair - Maintenance

```json
{
  "name": "Normal Hair - Maintenance",
  "description": "General maintenance for healthy normal hair",
  "category": "hair-care",
  "conditions": {
    "and": [
      { "==": [{ "var": "opt1" }, "normal"] },
      { "!=": [{ "var": "opt2" }, "dandruff"] },
      { "!=": [{ "var": "opt3" }, "hair-loss"] }
    ]
  },
  "recommendations": [
    "Wash hair 2-3 times per week",
    "Use balanced shampoo and conditioner",
    "Regular trims every 6-8 weeks",
    "Protect hair from heat styling",
    "Maintain a healthy diet"
  ],
  "products": [
    "Balanced Shampoo",
    "Regular Conditioner",
    "Heat Protectant Spray"
  ],
  "severity": "low",
  "priority": 0
}
```

### Get All Diagnoses

```bash
curl http://localhost:3000/api/diagnoses
```

### Get Diagnoses by Category

```bash
curl "http://localhost:3000/api/diagnoses?category=hair-care&isActive=true"
```

### Update Diagnosis

```bash
curl -X PUT http://localhost:3000/api/diagnoses/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{
    "recommendations": [
      "Updated recommendation 1",
      "Updated recommendation 2"
    ]
  }'
```

---

## Diagnosis Matching Logic

The system evaluates diagnoses in priority order:

1. **Priority-based evaluation**: Diagnoses with higher priority are evaluated first
2. **JSON Logic conditions**: Each diagnosis has conditions that must match user answers
3. **First match wins**: The first diagnosis that matches is returned
4. **Default diagnosis**: If no match, returns a default "General Hair Care" diagnosis

### Condition Examples

```javascript
// Match if hair type is dry AND has dandruff
{
  "and": [
    { "==": [{ "var": "opt1" }, "dry"] },
    { "==": [{ "var": "opt2" }, "dandruff"] }
  ]
}

// Match if hair type is dry OR oily
{
  "or": [
    { "==": [{ "var": "opt1" }, "dry"] },
    { "==": [{ "var": "opt1" }, "oily"] }
  ]
}

// Match if NOT normal hair
{
  "!=": [{ "var": "opt1" }, "normal"]
}

// Complex condition
{
  "and": [
    { "or": [
      { "==": [{ "var": "opt1" }, "dry"] },
      { "==": [{ "var": "opt1" }, "oily"] }
    ]},
    { "==": [{ "var": "opt3" }, "hair-loss"] }
  ]
}
```

---

## Best Practices

1. **Save sessionId**: Always save the sessionId returned when saving first answer
2. **Complete responses**: Call complete endpoint after all questions are answered
3. **Priority ordering**: Set higher priority for more specific diagnoses
4. **Test conditions**: Test diagnosis conditions with various answer combinations
5. **Default diagnosis**: Always have a default diagnosis for unmatched cases
6. **Update answers**: You can update answers by sending the same questionId again

---

For more information, see:
- [Questionnaire Usage](./questionnaire-usage.md)
- [API Documentation](../README.md)
- [Database Schema](../docs/database-schema.md)

