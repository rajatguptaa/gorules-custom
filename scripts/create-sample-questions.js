/**
 * Script to create sample questions for testing
 * Run with: node scripts/create-sample-questions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gorules';

async function createSampleQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing questions (optional - comment out if you want to keep existing)
    // await Question.deleteMany({});
    // console.log('Cleared existing questions');

    // Create sample questions
    const questions = [
      {
        questionText: 'What is your hair type?',
        questionType: 'single-choice',
        category: 'hair-type',
        tags: ['hair-type', 'initial'],
        order: 1,
        isFirstQuestion: true,
        isActive: true,
        options: [
          {
            id: 'opt1',
            text: 'Dry Hair',
            value: 'dry',
            tags: ['dry', 'hair-type'],
          },
          {
            id: 'opt2',
            text: 'Oily Hair',
            value: 'oily',
            tags: ['oily', 'hair-type'],
          },
          {
            id: 'opt3',
            text: 'Normal Hair',
            value: 'normal',
            tags: ['normal', 'hair-type'],
          },
          {
            id: 'opt4',
            text: 'Combination Hair',
            value: 'combination',
            tags: ['combination', 'hair-type'],
          },
        ],
      },
      {
        questionText: 'Do you have dandruff or dry scalp?',
        questionType: 'single-choice',
        category: 'scalp-condition',
        tags: ['scalp', 'dandruff', 'dry-scalp'],
        order: 2,
        isActive: true,
        options: [
          {
            id: 'opt1',
            text: 'Yes, I have dandruff',
            value: 'dandruff',
            tags: ['dandruff', 'scalp-problem'],
          },
          {
            id: 'opt2',
            text: 'Yes, I have dry scalp',
            value: 'dry-scalp',
            tags: ['dry-scalp', 'scalp-problem'],
          },
          {
            id: 'opt3',
            text: "No, I don't have any scalp issues",
            value: 'none',
            tags: ['healthy-scalp'],
          },
        ],
      },
      {
        questionText: 'What is your main hair concern?',
        questionType: 'single-choice',
        category: 'hair-problem',
        tags: ['hair-problem', 'concern'],
        order: 3,
        isActive: true,
        options: [
          {
            id: 'opt1',
            text: 'Hair Loss',
            value: 'hair-loss',
            tags: ['hair-loss', 'problem'],
          },
          {
            id: 'opt2',
            text: 'Frizz',
            value: 'frizz',
            tags: ['frizz', 'problem'],
          },
          {
            id: 'opt3',
            text: 'Split Ends',
            value: 'split-ends',
            tags: ['split-ends', 'problem'],
          },
          {
            id: 'opt4',
            text: 'Lack of Volume',
            value: 'no-volume',
            tags: ['volume', 'problem'],
          },
          {
            id: 'opt5',
            text: 'None of the above',
            value: 'none',
            tags: ['no-problem'],
          },
        ],
      },
      {
        questionText: 'What is your hair goal?',
        questionType: 'single-choice',
        category: 'hair-goal',
        tags: ['goal', 'objective'],
        order: 4,
        isActive: true,
        options: [
          {
            id: 'opt1',
            text: 'Grow longer hair',
            value: 'grow',
            tags: ['growth', 'length'],
          },
          {
            id: 'opt2',
            text: 'Add volume and thickness',
            value: 'volume',
            tags: ['volume', 'thickness'],
          },
          {
            id: 'opt3',
            text: 'Reduce frizz and improve texture',
            value: 'smooth',
            tags: ['smooth', 'texture'],
          },
          {
            id: 'opt4',
            text: 'Maintain healthy hair',
            value: 'maintain',
            tags: ['maintenance', 'health'],
          },
        ],
      },
    ];

    // Link questions together
    const savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // If not the last question, link options to next question
      if (i < questions.length - 1) {
        // We'll update this after creating the next question
      }
      
      const savedQuestion = await Question.create(question);
      savedQuestions.push(savedQuestion);
      console.log(`Created question: ${savedQuestion.questionText}`);
    }

    // Link questions: each option in question 1 points to question 2
    if (savedQuestions.length >= 2) {
      const firstQuestion = savedQuestions[0];
      const secondQuestion = savedQuestions[1];
      
      firstQuestion.options = firstQuestion.options.map(opt => ({
        ...opt.toObject(),
        nextQuestionId: secondQuestion._id,
      }));
      await firstQuestion.save();
      console.log('Linked question 1 to question 2');
    }

    // Link question 2 to question 3
    if (savedQuestions.length >= 3) {
      const secondQuestion = savedQuestions[1];
      const thirdQuestion = savedQuestions[2];
      
      secondQuestion.options = secondQuestion.options.map(opt => ({
        ...opt.toObject(),
        nextQuestionId: thirdQuestion._id,
      }));
      await secondQuestion.save();
      console.log('Linked question 2 to question 3');
    }

    // Link question 3 to question 4
    if (savedQuestions.length >= 4) {
      const thirdQuestion = savedQuestions[2];
      const fourthQuestion = savedQuestions[3];
      
      thirdQuestion.options = thirdQuestion.options.map(opt => ({
        ...opt.toObject(),
        nextQuestionId: fourthQuestion._id,
      }));
      await thirdQuestion.save();
      console.log('Linked question 3 to question 4');
    }

    console.log('\n✅ Sample questions created successfully!');
    console.log(`Total questions: ${savedQuestions.length}`);
    console.log('\nYou can now use the UI at http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample questions:', error);
    process.exit(1);
  }
}

// Run the script
createSampleQuestions();

