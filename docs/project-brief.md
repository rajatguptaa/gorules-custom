# GoRules Custom – Project Brief

## Problem Statement
Hair-care brands need a lightweight “rules-as-a-service” backend to evaluate treatment eligibility and drive adaptive questionnaires without rebuilding business logic every time requirements change. They require a secure API that lets non-engineers store JSON Logic rules, run them against customer telemetry, and orchestrate question flows that adapt to previous answers.

## Solution Description
- **Rules API**: CRUD endpoints let admins manage JSON Logic rules in MongoDB, then evaluate stored or ad-hoc rules through `/api/rules/:id/evaluate` or `/api/evaluate`. Evaluations rely on `json-logic-js`, so rule writers can express conditional checks with standard operators.
- **Questionnaire Engine**: `/api/questions` endpoints store questions, options, and conditional routing (`nextQuestionId` or JSON Logic). Helpers expose “first question”, “next question” by answers, category filters, and drag/drop reordering.
- **Platform Plumbing**: `server.js` boots Express, applies CORS, JSON parsing, logging, health checks, and Swagger docs so the service is discoverable and production-ready.

## Simple DB Design
The application uses two MongoDB collections with concise schemas:

### rules
| Field | Type | Purpose |
| --- | --- | --- |
| `name` | String | Human-readable rule label. |
| `description` | String | Optional editor notes. |
| `rule` | Object | JSON Logic payload evaluated at runtime. |
| `createdAt` / `updatedAt` | Date | Auditing timestamps. |

Indexes: `{ name: 1 }`, `{ createdAt: -1 }` to accelerate lookups and recent activity views.

### questions
| Field | Type | Purpose |
| --- | --- | --- |
| `questionText` | String | Prompt shown to users. |
| `questionType` | String enum | single-choice, multiple-choice, text, number. |
| `options` | Array\<Option\> | Choices with `id`, `text`, `value`, optional `nextQuestionId`, `tags`. |
| `category` | String enum | hair-type, scalp-condition, hair-problem, hair-goal, lifestyle, other. |
| `order` | Number | Primary display ordering. |
| `isActive` / `isFirstQuestion` | Boolean | Publish flag and questionnaire entry point. |
| `conditionalLogic` | Object | JSON Logic evaluated against accumulated answers. |
| `metadata` | Object | Extra UI hints (e.g., helper text). |

Indexes: `{ category: 1, order: 1 }`, `{ isActive: 1, isFirstQuestion: 1 }`, `{ tags: 1 }` to keep traversal predictable even with large questionnaires.

This pared-down schema keeps the learning curve low while covering the project’s core use cases: rule evaluation and adaptive questionnaires.
