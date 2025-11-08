# GoRules Custom API

A rules-as-a-service API built with Node.js, Express, and MongoDB. This application provides a RESTful API for creating, managing, and evaluating business rules using JSON Logic.

## Features

- ✅ **CRUD Operations** - Create, read, update, and delete rules
- ✅ **Rule Evaluation** - Evaluate stored rules or ad-hoc rules against JSON data
- ✅ **Questionnaire System** - Hair care questionnaire with conditional questions
- ✅ **Question Management** - Admin endpoints for managing questions, options, and order
- ✅ **Conditional Logic** - Dynamic question flow based on previous answers
- ✅ **MongoDB Integration** - Persistent storage using MongoDB with Mongoose ODM
- ✅ **JSON Logic Support** - Powerful rule engine using json-logic-js
- ✅ **RESTful API** - Clean and intuitive API endpoints
- ✅ **Swagger Documentation** - Interactive API documentation with Swagger UI
- ✅ **Error Handling** - Comprehensive error handling and validation
- ✅ **Code Organization** - Well-structured codebase following best practices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.0 or higher) - [Install MongoDB](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud-hosted MongoDB

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajatguptaa/gorules-custom.git
   cd gorules-custom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your MongoDB connection:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/gorules
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Run the application**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## API Documentation (Swagger)

The API includes interactive Swagger documentation that provides a complete reference for all endpoints, request/response schemas, and allows you to test the API directly from your browser.

### Access Swagger UI

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

The Swagger UI provides:
- 📖 Complete API documentation
- 🔍 Request/response schemas
- 🧪 Interactive API testing
- 📝 Example requests and responses
- ✅ Validation rules

### Using Swagger UI

1. Navigate to `http://localhost:3000/api-docs`
2. Browse available endpoints organized by tags (Health, Rules, Evaluation)
3. Click on any endpoint to expand and see details
4. Click "Try it out" to test endpoints directly
5. Fill in request parameters and body
6. Click "Execute" to send the request
7. View the response with status code and body

## API Endpoints

### Health Check

```http
GET /health
```

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "uptime": 123.456
}
```

### Rules Management

#### Create a Rule

```http
POST /api/rules
Content-Type: application/json

{
  "name": "Delivery Eligibility Rule",
  "description": "Check if delivery is eligible based on distance and area",
  "rule": {
    "and": [
      { "<=": [{ "var": "distanceKm" }, 50] },
      { "!=": [{ "var": "areaType" }, "Rural"] }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Delivery Eligibility Rule",
    "description": "Check if delivery is eligible based on distance and area",
    "rule": { ... },
    "createdAt": "2025-01-27T10:00:00.000Z",
    "updatedAt": "2025-01-27T10:00:00.000Z"
  }
}
```

#### Get All Rules

```http
GET /api/rules
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Delivery Eligibility Rule",
      "description": "...",
      "createdAt": "2025-01-27T10:00:00.000Z",
      "updatedAt": "2025-01-27T10:00:00.000Z"
    }
  ]
}
```

#### Get Rule by ID

```http
GET /api/rules/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Delivery Eligibility Rule",
    "description": "...",
    "rule": { ... },
    "createdAt": "2025-01-27T10:00:00.000Z",
    "updatedAt": "2025-01-27T10:00:00.000Z"
  }
}
```

#### Update Rule

```http
PUT /api/rules/:id
Content-Type: application/json

{
  "name": "Updated Rule Name",
  "description": "Updated description",
  "rule": { ... }
}
```

#### Delete Rule

```http
DELETE /api/rules/:id
```

Returns `204 No Content` on success.

### Rule Evaluation

#### Evaluate Stored Rule

```http
POST /api/rules/:id/evaluate
Content-Type: application/json

{
  "data": {
    "distanceKm": 45,
    "areaType": "Urban"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ruleId": "507f1f77bcf86cd799439011",
    "ruleName": "Delivery Eligibility Rule",
    "result": true,
    "evaluatedAt": "2025-01-27T10:00:00.000Z"
  }
}
```

#### Evaluate Ad-Hoc Rule

```http
POST /api/evaluate
Content-Type: application/json

{
  "rule": {
    "and": [
      { "<=": [{ "var": "distanceKm" }, 50] },
      { "!=": [{ "var": "areaType" }, "Rural"] }
    ]
  },
  "data": {
    "distanceKm": 45,
    "areaType": "Urban"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": true,
    "evaluatedAt": "2025-01-27T10:00:00.000Z"
  }
}
```

## JSON Logic Rule Format

Rules use [JSON Logic](https://jsonlogic.com/) format, which supports:

- **Comparisons**: `==`, `!=`, `>`, `>=`, `<`, `<=`
- **Logical Operators**: `and`, `or`, `!` (not)
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **Variables**: `{"var": "variableName"}`
- **Conditionals**: `if`, `?:` (ternary)
- **String Operations**: `in`, `substr`, `cat`
- **Array Operations**: `in`, `map`, `filter`, `reduce`

### Example Rules

**Simple comparison:**
```json
{
  ">": [{ "var": "age" }, 18]
}
```

**Complex logic:**
```json
{
  "and": [
    { ">=": [{ "var": "score" }, 80] },
    { "in": [{ "var": "status" }, ["active", "premium"]] },
    { "!": { "var": "blocked" } }
  ]
}
```

**Conditional:**
```json
{
  "if": [
    { ">": [{ "var": "price" }, 100] },
    "expensive",
    "affordable"
  ]
}
```

## Project Structure

```
gorules-custom/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── swagger.js            # Swagger/OpenAPI configuration
├── controllers/
│   ├── ruleController.js    # Business logic for rules
│   └── questionController.js # Business logic for questions
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── logger.js            # Request logging middleware
├── models/
│   ├── Rule.js              # Mongoose schema for Rule
│   └── Question.js          # Mongoose schema for Question
├── routes/
│   ├── ruleRoutes.js        # Rule CRUD routes (with Swagger annotations)
│   ├── evaluateRoutes.js    # Rule evaluation routes (with Swagger annotations)
│   └── questionRoutes.js    # Question management routes (with Swagger annotations)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── README.md                # This file
├── server.js                # Application entry point
└── LICENSE                  # MIT License
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CORS_ORIGIN` | CORS allowed origin | `*` |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Code Style Guidelines

- Use **ES6+** syntax
- Follow **RESTful** API conventions
- Use **async/await** for asynchronous operations
- Implement proper **error handling**
- Add **JSDoc** comments for functions
- Use **meaningful variable names**
- Keep functions **small and focused**

### Adding New Features

1. Create model in `models/` if needed
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Update this README with new endpoints

## Questionnaire System

The API includes a comprehensive questionnaire system for hair care assessments with conditional question flow.

### Question Categories

- **hair-type** - Hair type questions (dry, oily, normal, combination)
- **scalp-condition** - Scalp condition questions (dandruff, dry scalp)
- **hair-problem** - Hair problem questions (hair loss, frizz, split ends)
- **hair-goal** - Hair goal questions (growth, volume, smoothness)
- **lifestyle** - Lifestyle questions (washing frequency, styling habits)
- **other** - Other questions

### Question Management Endpoints

#### Create a Question

```http
POST /api/questions
Content-Type: application/json

{
  "questionText": "What is your hair type?",
  "questionType": "single-choice",
  "category": "hair-type",
  "tags": ["hair-type", "initial"],
  "order": 1,
  "isFirstQuestion": true,
  "options": [
    {
      "id": "opt1",
      "text": "Dry Hair",
      "value": "dry",
      "tags": ["dry"]
    },
    {
      "id": "opt2",
      "text": "Oily Hair",
      "value": "oily",
      "tags": ["oily"]
    }
  ]
}
```

#### Get First Question

```http
GET /api/questions/first
```

Returns the first question in the questionnaire.

#### Get Next Question

```http
POST /api/questions/next
Content-Type: application/json

{
  "currentQuestionId": "507f1f77bcf86cd799439011",
  "selectedOptionId": "opt1",
  "answers": {
    "hairType": "dry",
    "hasDandruff": true
  }
}
```

Returns the next question based on the selected option or conditional logic.

#### Get All Questions

```http
GET /api/questions?category=hair-type&isActive=true&sortBy=order
```

Query parameters:
- `category` - Filter by category
- `isActive` - Filter by active status
- `tags` - Filter by tags (comma-separated)
- `sortBy` - Sort field (order, category, createdAt)

#### Update Question (Admin)

```http
PUT /api/questions/:id
Content-Type: application/json

{
  "questionText": "Updated question text",
  "category": "hair-problem",
  "order": 2
}
```

#### Reorder Questions (Admin)

```http
POST /api/questions/reorder
Content-Type: application/json

{
  "questionOrders": [
    { "questionId": "507f1f77bcf86cd799439011", "order": 1 },
    { "questionId": "507f1f77bcf86cd799439012", "order": 2 }
  ]
}
```

#### Get Questions by Category

```http
GET /api/questions/category/hair-type
```

### Conditional Question Flow

Questions can be linked using:
1. **Option-based linking** - Each option can have a `nextQuestionId` that points to the next question
2. **Tag-based linking** - Questions with matching tags can be shown sequentially
3. **Conditional logic** - JSON Logic can be used to determine which question to show next based on all previous answers

### Example Questionnaire Flow

1. **First Question**: "What is your hair type?" → User selects "Dry Hair"
2. **Next Question**: Based on the selected option's `nextQuestionId` or tags, show "Do you have dandruff or dry scalp?"
3. **Continue**: Based on answers, show relevant follow-up questions

### Example Files

- **[Usage Examples](./examples/questionnaire-usage.md)** - Complete examples with curl commands, JavaScript, and Python code
- **[Sequence Diagrams](./examples/sequence-diagram.md)** - Visual flow diagrams showing user flow, admin management, and API interactions
- **[Database Schema](./docs/database-schema.md)** - Complete database schema documentation with field descriptions, indexes, and examples
- **[Sample Questions](./examples/sample-questions.json)** - Sample question data for testing

## Testing

Example using `curl`:

```bash
# Create a rule
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rule",
    "rule": { ">": [{ "var": "x" }, 10] }
  }'

# Get all rules
curl http://localhost:3000/api/rules

# Evaluate a rule
curl -X POST http://localhost:3000/api/rules/{id}/evaluate \
  -H "Content-Type: application/json" \
  -d '{"data": {"x": 15}}'

# Create a question
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is your hair type?",
    "category": "hair-type",
    "isFirstQuestion": true,
    "options": [
      {"id": "opt1", "text": "Dry Hair", "value": "dry"},
      {"id": "opt2", "text": "Oily Hair", "value": "oily"}
    ]
  }'

# Get first question
curl http://localhost:3000/api/questions/first

# Get next question
curl -X POST http://localhost:3000/api/questions/next \
  -H "Content-Type: application/json" \
  -d '{
    "currentQuestionId": "507f1f77bcf86cd799439011",
    "selectedOptionId": "opt1"
  }'
```

## MongoDB Connection

### Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/gorules
```

### MongoDB Atlas (Cloud)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gorules?retryWrites=true&w=majority
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Rajat Gupta**

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## Acknowledgments

- [JSON Logic](https://jsonlogic.com/) - Rule format specification
- [json-logic-js](https://github.com/jwadhams/json-logic-js) - JavaScript implementation
- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
