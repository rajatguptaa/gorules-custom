# GoRules Custom – Core Snapshot

## Core Logic
- `server.js` wires Express, connects to MongoDB via `config/database.js`, loads global middleware (CORS, JSON parsing, request logger, error handler), and mounts the `rules`, `evaluate`, and `questions` route groups plus Swagger docs.
- Rule endpoints (see `controllers/ruleController.js`) provide CRUD over MongoDB and evaluate rules using `json-logic-js`; stored rules are validated JSON objects and responses strip Mongo internals through the model transform.
- Question endpoints (`controllers/questionController.js`) manage the questionnaire tree: enforce a single first question, support conditional routing via option-level `nextQuestionId` or JSON Logic, and expose helpers for reordering and filtering by category/tags.
- Shared middleware adds structured logging, centralized error responses, and health/root endpoints so API clients can check uptime and discover available routes quickly.

## Database Schema
### `rules` collection (`models/Rule.js`)
| Field | Type | Notes |
| --- | --- | --- |
| `name` | String (req, <=200) | Display label used in Admin/UI lists. |
| `description` | String (<=1000) | Optional context for editors. |
| `rule` | Mixed JSON (req) | JSON Logic payload evaluated with `json-logic-js`. |
| `createdAt`, `updatedAt` | Date | Added via `timestamps`; `_id` is transformed to `id` in responses. |
Indexes: `{ name: 1 }`, `{ createdAt: -1 }`.

### `questions` collection (`models/Question.js`)
| Field | Type | Notes |
| --- | --- | --- |
| `questionText` | String (req, <=500) | Prompt shown to the user. |
| `questionType` | Enum (single-choice, multiple-choice, text, number) | Defaults to single-choice. |
| `options` | [{ id, text, value, nextQuestionId?, tags[]? }] | Required for choice questions; option-level routing supported. |
| `category` | Enum (hair-type, scalp-condition, hair-problem, hair-goal, lifestyle, other) | Drives filtering and sequencing. |
| `tags` | [String] | Used for logic-based chaining and reporting. |
| `order` | Number | Primary display order; helper endpoints reorder in bulk. |
| `isActive`, `isFirstQuestion` | Boolean | Control availability and entry point. |
| `conditionalLogic` | Mixed JSON Logic | Evaluated against accumulated answers to decide dynamic flow. |
| `metadata`, timestamps | Object, Date | Flexible payload for UI hints plus audit fields. |
Indexes focus on efficient questionnaire traversal: `{ category: 1, order: 1 }`, `{ isActive: 1, isFirstQuestion: 1 }`, `{ tags: 1 }`.

## Example
Evaluate an ad-hoc delivery rule without persisting it:

```http
POST /api/evaluate
Content-Type: application/json

{
  "rule": {
    "and": [
      { "<=": [ { "var": "distanceKm" }, 50 ] },
      { "!=": [ { "var": "areaType" }, "Rural" ] }
    ]
  },
  "data": {
    "distanceKm": 32,
    "areaType": "Urban"
  }
}
```

Response (200):

```json
{
  "success": true,
  "data": {
    "result": true,
    "evaluatedAt": "2025-02-01T10:15:00.000Z"
  }
}
```

This mirrors the `evaluateAdHocRule` flow: the JSON Logic payload is run directly via `json-logic-js`, so callers can test rule tweaks before saving them.
