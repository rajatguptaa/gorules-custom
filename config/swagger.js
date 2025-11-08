const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger configuration
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoRules Custom API',
      version: '1.0.0',
      description: 'A rules-as-a-service API built with Node.js, Express, and MongoDB. This API provides endpoints for creating, managing, and evaluating business rules using JSON Logic.',
      contact: {
        name: 'Rajat Gupta',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Rule: {
          type: 'object',
          required: ['name', 'rule'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the rule',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Name of the rule',
              maxLength: 200,
              example: 'Delivery Eligibility Rule',
            },
            description: {
              type: 'string',
              description: 'Description of the rule',
              maxLength: 1000,
              example: 'Check if delivery is eligible based on distance and area',
            },
            rule: {
              type: 'object',
              description: 'JSON Logic rule object',
              example: {
                and: [
                  { '<=': [{ var: 'distanceKm' }, 50] },
                  { '!=': [{ var: 'areaType' }, 'Rural'] },
                ],
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the rule was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the rule was last updated',
            },
          },
        },
        CreateRuleRequest: {
          type: 'object',
          required: ['name', 'rule'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the rule',
              maxLength: 200,
              example: 'Delivery Eligibility Rule',
            },
            description: {
              type: 'string',
              description: 'Description of the rule',
              maxLength: 1000,
              example: 'Check if delivery is eligible based on distance and area',
            },
            rule: {
              type: 'object',
              description: 'JSON Logic rule object',
              example: {
                and: [
                  { '<=': [{ var: 'distanceKm' }, 50] },
                  { '!=': [{ var: 'areaType' }, 'Rural'] },
                ],
              },
            },
          },
        },
        UpdateRuleRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the rule',
              maxLength: 200,
            },
            description: {
              type: 'string',
              description: 'Description of the rule',
              maxLength: 1000,
            },
            rule: {
              type: 'object',
              description: 'JSON Logic rule object',
            },
          },
        },
        EvaluateRequest: {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              description: 'JSON data to evaluate against the rule',
              example: {
                distanceKm: 45,
                areaType: 'Urban',
              },
            },
          },
        },
        AdHocEvaluateRequest: {
          type: 'object',
          required: ['rule'],
          properties: {
            rule: {
              type: 'object',
              description: 'JSON Logic rule object',
              example: {
                and: [
                  { '<=': [{ var: 'distanceKm' }, 50] },
                  { '!=': [{ var: 'areaType' }, 'Rural'] },
                ],
              },
            },
            data: {
              type: 'object',
              description: 'JSON data to evaluate against the rule',
              example: {
                distanceKm: 45,
                areaType: 'Urban',
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        ListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            count: {
              type: 'integer',
              example: 2,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Rule',
              },
            },
          },
        },
        EvaluateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                ruleId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011',
                },
                ruleName: {
                  type: 'string',
                  example: 'Delivery Eligibility Rule',
                },
                result: {
                  type: 'boolean',
                  example: true,
                },
                evaluatedAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        AdHocEvaluateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                result: {
                  type: 'boolean',
                  example: true,
                },
                evaluatedAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              example: 'name and rule are required',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              example: 123.456,
            },
          },
        },
        QuestionOption: {
          type: 'object',
          required: ['id', 'text', 'value'],
          properties: {
            id: {
              type: 'string',
              example: 'opt1',
            },
            text: {
              type: 'string',
              example: 'Dry Hair',
            },
            value: {
              type: 'string',
              example: 'dry',
            },
            nextQuestionId: {
              type: 'string',
              description: 'ID of next question to show',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Question: {
          type: 'object',
          required: ['questionText', 'category'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the question',
            },
            questionText: {
              type: 'string',
              maxLength: 500,
              example: 'What is your hair type?',
            },
            questionType: {
              type: 'string',
              enum: ['single-choice', 'multiple-choice', 'text', 'number'],
              example: 'single-choice',
            },
            options: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/QuestionOption',
              },
            },
            category: {
              type: 'string',
              enum: ['hair-type', 'scalp-condition', 'hair-problem', 'hair-goal', 'lifestyle', 'other'],
              example: 'hair-type',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['dry', 'oily', 'dandruff'],
            },
            order: {
              type: 'number',
              example: 1,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            isFirstQuestion: {
              type: 'boolean',
              example: false,
            },
            conditionalLogic: {
              type: 'object',
              description: 'JSON Logic for conditional question display',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateQuestionRequest: {
          type: 'object',
          required: ['questionText', 'category'],
          properties: {
            questionText: {
              type: 'string',
              example: 'What is your hair type?',
            },
            questionType: {
              type: 'string',
              enum: ['single-choice', 'multiple-choice', 'text', 'number'],
              example: 'single-choice',
            },
            options: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/QuestionOption',
              },
            },
            category: {
              type: 'string',
              enum: ['hair-type', 'scalp-condition', 'hair-problem', 'hair-goal', 'lifestyle', 'other'],
              example: 'hair-type',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            order: {
              type: 'number',
            },
            isActive: {
              type: 'boolean',
            },
            isFirstQuestion: {
              type: 'boolean',
            },
            conditionalLogic: {
              type: 'object',
            },
            metadata: {
              type: 'object',
            },
          },
        },
        UpdateQuestionRequest: {
          type: 'object',
          properties: {
            questionText: {
              type: 'string',
            },
            questionType: {
              type: 'string',
              enum: ['single-choice', 'multiple-choice', 'text', 'number'],
            },
            options: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/QuestionOption',
              },
            },
            category: {
              type: 'string',
              enum: ['hair-type', 'scalp-condition', 'hair-problem', 'hair-goal', 'lifestyle', 'other'],
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            order: {
              type: 'number',
            },
            isActive: {
              type: 'boolean',
            },
            isFirstQuestion: {
              type: 'boolean',
            },
            conditionalLogic: {
              type: 'object',
            },
            metadata: {
              type: 'object',
            },
          },
        },
        GetNextQuestionRequest: {
          type: 'object',
          required: ['currentQuestionId'],
          properties: {
            currentQuestionId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            selectedOptionId: {
              type: 'string',
              example: 'opt1',
            },
            answers: {
              type: 'object',
              description: 'All previous answers',
              example: {
                hairType: 'dry',
                hasDandruff: true,
              },
            },
          },
        },
        ReorderQuestionsRequest: {
          type: 'object',
          required: ['questionOrders'],
          properties: {
            questionOrders: {
              type: 'array',
              items: {
                type: 'object',
                required: ['questionId', 'order'],
                properties: {
                  questionId: {
                    type: 'string',
                  },
                  order: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        Answer: {
          type: 'object',
          properties: {
            questionId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            questionText: {
              type: 'string',
              example: 'What is your hair type?',
            },
            selectedOptionId: {
              type: 'string',
              example: 'opt1',
            },
            selectedOptionText: {
              type: 'string',
              example: 'Dry Hair',
            },
            answerValue: {
              type: 'string',
              example: 'dry',
            },
            answeredAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Response: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            sessionId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            userId: {
              type: 'string',
            },
            answers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Answer',
              },
            },
            allAnswers: {
              type: 'object',
              description: 'Flattened object of all answers',
            },
            completed: {
              type: 'boolean',
              example: false,
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
            },
            diagnosis: {
              type: 'object',
              description: 'Diagnosis object (populated)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        SaveAnswerRequest: {
          type: 'object',
          required: ['questionId'],
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID (auto-generated if not provided)',
            },
            userId: {
              type: 'string',
              description: 'User ID (optional)',
            },
            questionId: {
              type: 'string',
              required: true,
              example: '507f1f77bcf86cd799439011',
            },
            selectedOptionId: {
              type: 'string',
              example: 'opt1',
            },
            answerValue: {
              type: 'string',
              description: 'Answer value (for text/number questions)',
            },
            metadata: {
              type: 'object',
            },
          },
        },
        GetDiagnosisRequest: {
          type: 'object',
          required: ['answers'],
          properties: {
            answers: {
              type: 'object',
              description: 'Flattened object of all answers',
              example: {
                opt1: 'dry',
                opt2: 'dandruff',
                '507f1f77bcf86cd799439011': 'dry',
              },
            },
          },
        },
        Diagnosis: {
          type: 'object',
          required: ['name', 'conditions'],
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
              example: 'Dry Hair with Dandruff',
            },
            description: {
              type: 'string',
              example: 'Recommended treatment for dry hair with dandruff',
            },
            category: {
              type: 'string',
              enum: ['hair-care', 'scalp-treatment', 'product-recommendation', 'lifestyle', 'general'],
              example: 'hair-care',
            },
            conditions: {
              type: 'object',
              description: 'JSON Logic conditions',
              example: {
                and: [
                  { '==': [{ var: 'opt1' }, 'dry'] },
                  { '==': [{ var: 'opt2' }, 'dandruff'] },
                ],
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: [
                'Use anti-dandruff shampoo',
                'Apply moisturizing conditioner',
                'Avoid hot water',
              ],
            },
            products: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Shampoo A', 'Conditioner B'],
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              example: 'medium',
            },
            priority: {
              type: 'number',
              example: 1,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateDiagnosisRequest: {
          type: 'object',
          required: ['name', 'conditions'],
          properties: {
            name: {
              type: 'string',
              example: 'Dry Hair with Dandruff',
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
              enum: ['hair-care', 'scalp-treatment', 'product-recommendation', 'lifestyle', 'general'],
            },
            conditions: {
              type: 'object',
              description: 'JSON Logic conditions',
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            products: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            priority: {
              type: 'number',
            },
            isActive: {
              type: 'boolean',
            },
            metadata: {
              type: 'object',
            },
          },
        },
        UpdateDiagnosisRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
            },
            conditions: {
              type: 'object',
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            products: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            severity: {
              type: 'string',
            },
            priority: {
              type: 'number',
            },
            isActive: {
              type: 'boolean',
            },
            metadata: {
              type: 'object',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Rules',
        description: 'Rule management endpoints (CRUD operations)',
      },
      {
        name: 'Evaluation',
        description: 'Rule evaluation endpoints',
      },
      {
        name: 'Questions',
        description: 'Questionnaire management endpoints (CRUD operations)',
      },
      {
        name: 'Responses',
        description: 'User response and answer management endpoints',
      },
      {
        name: 'Diagnoses',
        description: 'Diagnosis and recommendation management endpoints',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

