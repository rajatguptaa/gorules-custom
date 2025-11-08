# Database Schema Documentation

This document provides a comprehensive explanation of the database schema for the GoRules Custom API.

## Table of Contents

1. [Overview](#overview)
2. [Rules Collection](#rules-collection)
3. [Questions Collection](#questions-collection)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Validation Rules](#validation-rules)
7. [Example Documents](#example-documents)

---

## Overview

The application uses MongoDB with Mongoose ODM. The database contains two main collections:

- **rules** - Stores business rules for evaluation
- **questions** - Stores questionnaire questions with options and conditional logic

---

## Rules Collection

### Schema Name
`Rule`

### Collection Name
`rules`

### Description
Stores business rules that can be evaluated using JSON Logic against provided data.

### Schema Structure

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  name: String,               // Rule name (required, max 200 chars)
  description: String,        // Rule description (optional, max 1000 chars)
  rule: Object,               // JSON Logic rule object (required)
  createdAt: Date,            // Auto-generated timestamp
  updatedAt: Date             // Auto-updated timestamp
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Unique | MongoDB document identifier |
| `name` | String | Yes | Max 200 chars, trimmed | Name of the rule |
| `description` | String | No | Max 1000 chars, trimmed | Detailed description of the rule |
| `rule` | Object | Yes | Must be valid JSON object | JSON Logic rule definition |
| `createdAt` | Date | Auto | ISO 8601 format | Timestamp when rule was created |
| `updatedAt` | Date | Auto | ISO 8601 format | Timestamp when rule was last updated |

### Indexes

```javascript
// Index on name for faster lookups
{ name: 1 }

// Index on createdAt for sorting
{ createdAt: -1 }
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Delivery Eligibility Rule",
  "description": "Check if delivery is eligible based on distance and area",
  "rule": {
    "and": [
      { "<=": [{ "var": "distanceKm" }, 50] },
      { "!=": [{ "var": "areaType" }, "Rural"] }
    ]
  },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

### JSON Response Transformation

When returned via API, the schema transforms `_id` to `id` and removes MongoDB internal fields:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Delivery Eligibility Rule",
  "description": "...",
  "rule": { ... },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

---

## Questions Collection

### Schema Name
`Question`

### Collection Name
`questions`

### Description
Stores questionnaire questions with options, conditional logic, and metadata for the hair care questionnaire system.

### Schema Structure

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  questionText: String,             // Question text (required, max 500 chars)
  questionType: String,              // Type: single-choice, multiple-choice, text, number
  options: [OptionSchema],           // Array of option objects
  category: String,                  // Question category (required, enum)
  tags: [String],                   // Array of tag strings
  order: Number,                     // Display order (default: 0)
  isActive: Boolean,                 // Active status (default: true)
  isFirstQuestion: Boolean,         // First question flag (default: false)
  conditionalLogic: Object,         // JSON Logic for conditional display
  metadata: Object,                  // Additional metadata
  createdAt: Date,                   // Auto-generated timestamp
  updatedAt: Date                    // Auto-updated timestamp
}
```

### Option Schema (Nested)

```javascript
{
  id: String,                       // Option identifier (required)
  text: String,                     // Display text (required)
  value: String,                     // Option value (required)
  nextQuestionId: ObjectId,         // Reference to next question (optional)
  tags: [String]                    // Option-specific tags (optional)
}
```

### Field Details

#### Main Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Unique | MongoDB document identifier |
| `questionText` | String | Yes | Max 500 chars, trimmed | The question text displayed to users |
| `questionType` | String | No | Enum: single-choice, multiple-choice, text, number | Type of question input |
| `options` | Array | Conditional* | Array of OptionSchema | Question options (required for choice types) |
| `category` | String | Yes | Enum: hair-type, scalp-condition, hair-problem, hair-goal, lifestyle, other | Question category |
| `tags` | Array[String] | No | Lowercase, trimmed | Tags for filtering and linking questions |
| `order` | Number | No | Default: 0 | Display order for questions |
| `isActive` | Boolean | No | Default: true | Whether question is active |
| `isFirstQuestion` | Boolean | No | Default: false | Marks the starting question |
| `conditionalLogic` | Object | No | Valid JSON Logic | Logic for conditional question display |
| `metadata` | Object | No | Any valid object | Additional metadata |
| `createdAt` | Date | Auto | ISO 8601 format | Creation timestamp |
| `updatedAt` | Date | Auto | ISO 8601 format | Last update timestamp |

*Options are required when `questionType` is `single-choice` or `multiple-choice`.

#### Option Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String | Yes | Unique within question | Option identifier |
| `text` | String | Yes | Trimmed | Display text for the option |
| `value` | String | Yes | Trimmed | Value stored when option is selected |
| `nextQuestionId` | ObjectId | No | Valid question ID | Reference to next question to show |
| `tags` | Array[String] | No | Lowercase, trimmed | Tags associated with this option |

### Category Enum Values

- `hair-type` - Questions about hair type (dry, oily, normal, combination)
- `scalp-condition` - Questions about scalp condition (dandruff, dry scalp)
- `hair-problem` - Questions about hair problems (hair loss, frizz, split ends)
- `hair-goal` - Questions about hair goals (growth, volume, smoothness)
- `lifestyle` - Questions about lifestyle (washing frequency, styling habits)
- `other` - Other questions

### Indexes

```javascript
// Compound index for category and order queries
{ category: 1, order: 1 }

// Index for active first question lookup
{ isActive: 1, isFirstQuestion: 1 }

// Index for tag-based queries
{ tags: 1 }

// Index for order-based queries
{ order: 1 }
```

### Validation Rules

1. **Question Text**: Required, maximum 500 characters
2. **Category**: Required, must be one of the enum values
3. **Options**: Required for `single-choice` and `multiple-choice` question types, must have at least one option
4. **First Question**: Only one question can have `isFirstQuestion: true` at a time (enforced by pre-save hook)
5. **Option IDs**: Must be unique within a question
6. **nextQuestionId**: Must reference a valid question ID if provided

### Pre-Save Hook

The schema includes a pre-save hook that ensures only one question can be marked as the first question:

```javascript
// Before saving, if this question is set as first question,
// unset all other first questions
if (this.isFirstQuestion && this.isActive) {
  await Question.updateMany(
    { _id: { $ne: this._id }, isFirstQuestion: true },
    { isFirstQuestion: false }
  );
}
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "questionText": "What is your hair type?",
  "questionType": "single-choice",
  "category": "hair-type",
  "tags": ["hair-type", "initial"],
  "order": 1,
  "isActive": true,
  "isFirstQuestion": true,
  "options": [
    {
      "id": "opt1",
      "text": "Dry Hair",
      "value": "dry",
      "nextQuestionId": "507f1f77bcf86cd799439012",
      "tags": ["dry", "hair-type"]
    },
    {
      "id": "opt2",
      "text": "Oily Hair",
      "value": "oily",
      "nextQuestionId": "507f1f77bcf86cd799439012",
      "tags": ["oily", "hair-type"]
    },
    {
      "id": "opt3",
      "text": "Normal Hair",
      "value": "normal",
      "nextQuestionId": "507f1f77bcf86cd799439012",
      "tags": ["normal", "hair-type"]
    },
    {
      "id": "opt4",
      "text": "Combination Hair",
      "value": "combination",
      "nextQuestionId": "507f1f77bcf86cd799439012",
      "tags": ["combination", "hair-type"]
    }
  ],
  "conditionalLogic": null,
  "metadata": {
    "helpText": "Select the option that best describes your hair",
    "required": true
  },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

### JSON Response Transformation

When returned via API, the schema transforms `_id` to `id` and removes MongoDB internal fields:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "questionText": "What is your hair type?",
  "questionType": "single-choice",
  "category": "hair-type",
  "tags": ["hair-type", "initial"],
  "order": 1,
  "isActive": true,
  "isFirstQuestion": true,
  "options": [...],
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

---

## Relationships

### Question to Question (Self-Referencing)

Questions can reference other questions through the `nextQuestionId` field in options:

```
Question A (Option 1) ──nextQuestionId──> Question B
Question A (Option 2) ──nextQuestionId──> Question C
```

**Relationship Type**: One-to-Many (one question can have multiple options, each pointing to different questions)

**Example**:
```javascript
// Question 1
{
  _id: "q1",
  options: [
    { id: "opt1", nextQuestionId: "q2" },  // Points to Question 2
    { id: "opt2", nextQuestionId: "q3" }   // Points to Question 3
  ]
}

// Question 2
{
  _id: "q2",
  options: [
    { id: "opt1", nextQuestionId: "q4" }   // Points to Question 4
  ]
}
```

### No Direct Relationships with Rules

Rules and Questions are independent collections with no direct relationships. However, Questions can use JSON Logic in `conditionalLogic` field, which follows the same format as Rules.

---

## Indexes

### Rules Collection Indexes

```javascript
// Index for name lookups
db.rules.createIndex({ name: 1 })

// Index for sorting by creation date
db.rules.createIndex({ createdAt: -1 })
```

### Questions Collection Indexes

```javascript
// Compound index for category and order queries
db.questions.createIndex({ category: 1, order: 1 })

// Compound index for active first question lookup
db.questions.createIndex({ isActive: 1, isFirstQuestion: 1 })

// Index for tag-based queries
db.questions.createIndex({ tags: 1 })

// Index for order-based queries
db.questions.createIndex({ order: 1 })
```

### Index Usage Examples

```javascript
// Find questions by category, sorted by order
db.questions.find({ category: "hair-type" }).sort({ order: 1 })
// Uses: { category: 1, order: 1 }

// Find the first active question
db.questions.findOne({ isFirstQuestion: true, isActive: true })
// Uses: { isActive: 1, isFirstQuestion: 1 }

// Find questions by tags
db.questions.find({ tags: "dry" })
// Uses: { tags: 1 }

// Find next question by order
db.questions.find({ order: { $gte: 2 } }).sort({ order: 1 })
// Uses: { order: 1 }
```

---

## Validation Rules

### Rules Collection Validation

1. **name**: 
   - Required
   - String type
   - Maximum 200 characters
   - Trimmed (whitespace removed)

2. **description**:
   - Optional
   - String type
   - Maximum 1000 characters
   - Trimmed

3. **rule**:
   - Required
   - Must be an object (not null, not array, not primitive)
   - Custom validator ensures it's a valid JSON object

### Questions Collection Validation

1. **questionText**:
   - Required
   - String type
   - Maximum 500 characters
   - Trimmed

2. **questionType**:
   - Optional (default: "single-choice")
   - Must be one of: "single-choice", "multiple-choice", "text", "number"

3. **options**:
   - Required if `questionType` is "single-choice" or "multiple-choice"
   - Must be an array
   - Must have at least one option if required
   - Each option must have: `id`, `text`, `value`

4. **category**:
   - Required
   - Must be one of: "hair-type", "scalp-condition", "hair-problem", "hair-goal", "lifestyle", "other"
   - Converted to lowercase

5. **tags**:
   - Optional
   - Array of strings
   - Each tag is trimmed and converted to lowercase

6. **order**:
   - Optional (default: 0)
   - Number type

7. **isActive**:
   - Optional (default: true)
   - Boolean type

8. **isFirstQuestion**:
   - Optional (default: false)
   - Boolean type
   - Only one question can have this set to true (enforced by pre-save hook)

9. **nextQuestionId** (in options):
   - Optional
   - Must be a valid MongoDB ObjectId if provided
   - Should reference an existing question

---

## Example Documents

### Complete Rule Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Hair Care Eligibility",
  "description": "Determine if user is eligible for specific hair care products based on hair type and scalp condition",
  "rule": {
    "and": [
      {
        "or": [
          { "==": [{ "var": "hairType" }, "dry"] },
          { "==": [{ "var": "hairType" }, "normal"] }
        ]
      },
      {
        "!=": [{ "var": "scalpCondition" }, "dandruff"]
      }
    ]
  },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

### Complete Question Document with Conditional Logic

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "questionText": "What is your main hair concern?",
  "questionType": "single-choice",
  "category": "hair-problem",
  "tags": ["hair-problem", "concern"],
  "order": 3,
  "isActive": true,
  "isFirstQuestion": false,
  "options": [
    {
      "id": "opt1",
      "text": "Hair Loss",
      "value": "hair-loss",
      "nextQuestionId": "507f1f77bcf86cd799439014",
      "tags": ["hair-loss", "problem"]
    },
    {
      "id": "opt2",
      "text": "Frizz",
      "value": "frizz",
      "nextQuestionId": "507f1f77bcf86cd799439015",
      "tags": ["frizz", "problem"]
    },
    {
      "id": "opt3",
      "text": "Split Ends",
      "value": "split-ends",
      "tags": ["split-ends", "problem"]
    }
  ],
  "conditionalLogic": {
    "and": [
      { "==": [{ "var": "hairType" }, "dry"] },
      { "==": [{ "var": "hasScalpIssues" }, true] }
    ]
  },
  "metadata": {
    "helpText": "Select your primary hair concern",
    "required": true,
    "showOnlyIf": {
      "hairType": ["dry", "oily"]
    }
  },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

### Question with Text Input Type

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "questionText": "How many times per week do you wash your hair?",
  "questionType": "number",
  "category": "lifestyle",
  "tags": ["lifestyle", "washing", "frequency"],
  "order": 5,
  "isActive": true,
  "isFirstQuestion": false,
  "options": [],
  "conditionalLogic": null,
  "metadata": {
    "min": 0,
    "max": 7,
    "step": 1,
    "unit": "times per week"
  },
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

---

## Database Queries Examples

### Find First Question

```javascript
db.questions.findOne({ 
  isFirstQuestion: true, 
  isActive: true 
})
```

### Find Questions by Category

```javascript
db.questions.find({ 
  category: "hair-type",
  isActive: true 
}).sort({ order: 1 })
```

### Find Questions by Tags

```javascript
db.questions.find({ 
  tags: { $in: ["dry", "dandruff"] },
  isActive: true 
})
```

### Find Next Question by Order

```javascript
db.questions.findOne({ 
  order: { $gt: 2 },
  isActive: true 
}).sort({ order: 1 })
```

### Find Question by nextQuestionId Reference

```javascript
// Get option with nextQuestionId
const option = db.questions.findOne(
  { "options.id": "opt1" },
  { "options.$": 1 }
)

// Find the referenced question
db.questions.findOne({ 
  _id: option.options[0].nextQuestionId 
})
```

### Update Question Order

```javascript
db.questions.updateMany(
  { _id: { $in: ["q1", "q2", "q3"] } },
  [
    {
      $set: {
        order: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", ObjectId("q1")] }, then: 1 },
              { case: { $eq: ["$_id", ObjectId("q2")] }, then: 2 },
              { case: { $eq: ["$_id", ObjectId("q3")] }, then: 3 }
            ]
          }
        }
      }
    }
  ]
)
```

---

## Schema Evolution

### Adding New Fields

When adding new fields to existing schemas:

1. **Make fields optional** initially to avoid breaking existing documents
2. **Set default values** for required fields
3. **Update validation** in the model
4. **Update API documentation** (Swagger)
5. **Migrate existing data** if needed

### Migration Example

```javascript
// Add new field to all existing questions
db.questions.updateMany(
  { metadata: { $exists: false } },
  { $set: { metadata: {} } }
)
```

---

## Performance Considerations

1. **Indexes**: All frequently queried fields are indexed
2. **Embedded Documents**: Options are embedded (not referenced) for faster reads
3. **Selective Queries**: Use `isActive` filter to exclude inactive questions
4. **Pagination**: Consider adding pagination for large question sets
5. **Caching**: Consider caching frequently accessed questions

---

## Data Integrity

1. **Referential Integrity**: `nextQuestionId` should reference valid questions (application-level validation)
2. **Unique Constraints**: Only one `isFirstQuestion: true` at a time (enforced by pre-save hook)
3. **Cascade Deletes**: Consider soft deletes or updating references when deleting questions
4. **Validation**: All required fields are validated at the schema level

---

For more information, see:
- [Usage Examples](../examples/questionnaire-usage.md)
- [Sequence Diagrams](../examples/sequence-diagram.md)
- [API Documentation](../README.md)

