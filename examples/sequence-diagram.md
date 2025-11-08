# Hair Care Questionnaire - Sequence Diagram

This document contains sequence diagrams showing the flow of the Hair Care Questionnaire system.

## User Questionnaire Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    Note over User,Database: Starting the Questionnaire
    
    User->>Frontend: Start Questionnaire
    Frontend->>API: GET /api/questions/first
    API->>Database: Find first question (isFirstQuestion=true)
    Database-->>API: Return question data
    API-->>Frontend: Question with options
    Frontend-->>User: Display question and options
    
    Note over User,Database: User Answers Question
    
    User->>Frontend: Select option (e.g., "Dry Hair")
    Frontend->>API: POST /api/questions/next<br/>{currentQuestionId, selectedOptionId, answers}
    API->>Database: Find current question
    Database-->>API: Question with options
    
    alt Option has nextQuestionId
        API->>Database: Find question by nextQuestionId
        Database-->>API: Next question
    else Check conditional logic
        API->>API: Evaluate conditional logic with answers
        alt Logic matches
            API->>Database: Find question by tags/category
            Database-->>API: Next question
        end
    else Default flow
        API->>Database: Find next question by order
        Database-->>API: Next question
    end
    
    alt Question found
        API-->>Frontend: Next question
        Frontend-->>User: Display next question
    else No more questions
        API-->>Frontend: null (questionnaire complete)
        Frontend-->>User: Show completion message
    end
    
    Note over User,Database: Continue until complete
```

## Admin Management Flow

```mermaid
sequenceDiagram
    participant Admin
    participant AdminPanel
    participant API
    participant Database

    Note over Admin,Database: Creating a New Question
    
    Admin->>AdminPanel: Create new question
    AdminPanel->>API: POST /api/questions<br/>{questionText, category, options, ...}
    API->>API: Validate question data
    API->>Database: Save question
    Database-->>API: Question created
    API-->>AdminPanel: Question with ID
    AdminPanel-->>Admin: Success message
    
    Note over Admin,Database: Updating Question Options
    
    Admin->>AdminPanel: Update question options
    AdminPanel->>API: PUT /api/questions/:id<br/>{options: [{id, text, value, nextQuestionId}]}
    API->>Database: Update question
    Database-->>API: Updated question
    API-->>AdminPanel: Updated question data
    AdminPanel-->>Admin: Success message
    
    Note over Admin,Database: Linking Questions
    
    Admin->>AdminPanel: Link question to next question
    AdminPanel->>API: PUT /api/questions/:id<br/>{options: [{nextQuestionId: "..."}]}
    API->>Database: Update question with nextQuestionId
    Database-->>API: Question updated
    API-->>AdminPanel: Success
    AdminPanel-->>Admin: Questions linked
    
    Note over Admin,Database: Reordering Questions
    
    Admin->>AdminPanel: Reorder questions
    AdminPanel->>API: POST /api/questions/reorder<br/>{questionOrders: [{questionId, order}]}
    API->>Database: Update multiple questions (order)
    Database-->>API: Questions updated
    API-->>AdminPanel: Updated questions
    AdminPanel-->>Admin: Questions reordered
    
    Note over Admin,Database: Changing Question Category
    
    Admin->>AdminPanel: Change category
    AdminPanel->>API: PUT /api/questions/:id<br/>{category: "hair-problem"}
    API->>Database: Update question category
    Database-->>API: Question updated
    API-->>AdminPanel: Success
    AdminPanel-->>Admin: Category changed
```

## Complete Questionnaire Flow with Conditional Logic

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    Note over User,Database: Step 1: Get First Question
    
    User->>Frontend: Start
    Frontend->>API: GET /api/questions/first
    API->>Database: Query: {isFirstQuestion: true, isActive: true}
    Database-->>API: Question 1: "What is your hair type?"
    API-->>Frontend: Question 1 data
    Frontend-->>User: Display Question 1
    
    Note over User,Database: Step 2: User Answers - Dry Hair
    
    User->>Frontend: Select "Dry Hair" (opt1)
    Frontend->>API: POST /api/questions/next<br/>{currentQuestionId: "q1", selectedOptionId: "opt1"}
    API->>Database: Get Question 1
    Database-->>API: Question 1 with options
    API->>API: Find option with nextQuestionId
    API->>Database: Get Question 2 (nextQuestionId)
    Database-->>API: Question 2: "Do you have dandruff?"
    API-->>Frontend: Question 2 data
    Frontend-->>User: Display Question 2
    
    Note over User,Database: Step 3: User Answers - Has Dandruff
    
    User->>Frontend: Select "Yes, I have dandruff" (opt1)
    Frontend->>API: POST /api/questions/next<br/>{currentQuestionId: "q2", selectedOptionId: "opt1",<br/>answers: {hairType: "dry", scalpCondition: "dandruff"}}
    API->>Database: Get Question 2
    Database-->>API: Question 2 with options
    API->>API: Check conditional logic (if exists)
    API->>Database: Get Question 3 (by tags or order)
    Database-->>API: Question 3: "What is your main hair concern?"
    API-->>Frontend: Question 3 data
    Frontend-->>User: Display Question 3
    
    Note over User,Database: Step 4: User Answers - Hair Loss
    
    User->>Frontend: Select "Hair Loss" (opt1)
    Frontend->>API: POST /api/questions/next<br/>{currentQuestionId: "q3", selectedOptionId: "opt1",<br/>answers: {hairType: "dry", scalpCondition: "dandruff",<br/>hairConcern: "hair-loss"}}
    API->>Database: Get Question 3
    Database-->>API: Question 3 with options
    API->>Database: Get Question 4 (next by order)
    Database-->>API: Question 4: "What is your hair goal?"
    API-->>Frontend: Question 4 data
    Frontend-->>User: Display Question 4
    
    Note over User,Database: Step 5: Final Question
    
    User->>Frontend: Select "Grow longer hair" (opt1)
    Frontend->>API: POST /api/questions/next<br/>{currentQuestionId: "q4", selectedOptionId: "opt1"}
    API->>Database: Get Question 4
    Database-->>API: Question 4 with options
    API->>Database: Check for next question
    Database-->>API: No more questions (null)
    API-->>Frontend: {data: null, message: "No more questions"}
    Frontend->>Frontend: Process all answers
    Frontend-->>User: Show completion + recommendations
```

## Question Linking Strategies

```mermaid
graph TD
    A[Question 1: Hair Type] -->|Option: Dry Hair<br/>nextQuestionId: Q2| B[Question 2: Scalp Condition]
    A -->|Option: Oily Hair<br/>nextQuestionId: Q2| B
    A -->|Option: Normal Hair<br/>nextQuestionId: Q2| B
    A -->|Option: Combination<br/>nextQuestionId: Q2| B
    
    B -->|Option: Has Dandruff<br/>tags: scalp-problem| C[Question 3: Hair Problem]
    B -->|Option: Dry Scalp<br/>tags: scalp-problem| C
    B -->|Option: No Issues<br/>tags: healthy-scalp| D[Question 3: Hair Goal]
    
    C -->|Order: 4| E[Question 4: Hair Goal]
    D -->|Order: 4| E
    
    E -->|Order: 5| F[Question 5: Lifestyle]
    F -->|Order: 6| G[End of Questionnaire]
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#fff4e1
    style E fill:#e1ffe1
    style F fill:#ffe1f5
    style G fill:#f0f0f0
```

## API Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Controller
    participant Model
    participant MongoDB

    Note over Client,MongoDB: Create Question Flow
    
    Client->>API: POST /api/questions<br/>{questionText, category, options}
    API->>Controller: createQuestion(req, res)
    Controller->>Controller: Validate input
    Controller->>Model: new Question(data)
    Model->>Model: Validate schema
    Model->>MongoDB: Save document
    MongoDB-->>Model: Document saved
    Model-->>Controller: Question object
    Controller-->>API: JSON response
    API-->>Client: 201 Created + question data
    
    Note over Client,MongoDB: Get Next Question Flow
    
    Client->>API: POST /api/questions/next<br/>{currentQuestionId, selectedOptionId}
    API->>Controller: getNextQuestion(req, res)
    Controller->>Model: findById(currentQuestionId)
    Model->>MongoDB: Query by ID
    MongoDB-->>Model: Question document
    Model-->>Controller: Question object
    
    alt Option has nextQuestionId
        Controller->>Model: findById(nextQuestionId)
        Model->>MongoDB: Query by ID
        MongoDB-->>Model: Next question
        Model-->>Controller: Next question
    else Use conditional logic
        Controller->>Controller: Evaluate JSON Logic
        Controller->>Model: findOne({tags, isActive})
        Model->>MongoDB: Query with conditions
        MongoDB-->>Model: Matching question
        Model-->>Controller: Next question
    else Default order
        Controller->>Model: findOne({order > current})
        Model->>MongoDB: Query by order
        MongoDB-->>Model: Next question
        Model-->>Controller: Next question
    end
    
    Controller-->>API: JSON response
    API-->>Client: 200 OK + question data or null
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Controller
    participant ErrorHandler

    Note over Client,ErrorHandler: Successful Request
    
    Client->>API: Valid request
    API->>Controller: Process request
    Controller->>Controller: Success
    Controller-->>API: 200 OK + data
    API-->>Client: Success response
    
    Note over Client,ErrorHandler: Validation Error
    
    Client->>API: Invalid request (missing fields)
    API->>Controller: Process request
    Controller->>Controller: Validation fails
    Controller-->>API: 400 Bad Request + error
    API-->>Client: Error response
    
    Note over Client,ErrorHandler: Not Found Error
    
    Client->>API: Request with invalid ID
    API->>Controller: Process request
    Controller->>Controller: Resource not found
    Controller-->>API: 404 Not Found + error
    API-->>Client: Error response
    
    Note over Client,ErrorHandler: Server Error
    
    Client->>API: Request
    API->>Controller: Process request
    Controller->>Controller: Exception thrown
    Controller-->>ErrorHandler: Error object
    ErrorHandler->>ErrorHandler: Log error
    ErrorHandler-->>API: 500 Internal Server Error
    API-->>Client: Error response
```

---

## Diagram Legend

- **Solid arrows**: Request/Response flow
- **Dashed arrows**: Data flow or conditional paths
- **Notes**: Explanatory annotations
- **Alt blocks**: Conditional logic paths
- **Participants**: Different components in the system

---

## How to View These Diagrams

1. **Mermaid Support**: These diagrams use Mermaid syntax and can be viewed in:
   - GitHub (renders automatically in .md files)
   - VS Code with Mermaid extension
   - Online at [Mermaid Live Editor](https://mermaid.live/)
   - Documentation tools like GitBook, Notion, etc.

2. **Alternative Formats**: If you need these in other formats:
   - Export from Mermaid Live Editor as PNG/SVG
   - Use tools like PlantUML for different diagram styles
   - Use draw.io for manual editing

---

For more details, see the [Usage Examples](./questionnaire-usage.md) file.

