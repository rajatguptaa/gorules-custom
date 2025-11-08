# Hair Care Questionnaire UI

A simple, modern web interface for the Hair Care Questionnaire API.

## Features

- ✅ **Interactive Questionnaire** - Step-by-step question flow
- ✅ **Progress Tracking** - Visual progress bar
- ✅ **Answer Saving** - Automatically saves answers with session management
- ✅ **Diagnosis Display** - Shows personalized recommendations and products
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Error Handling** - Graceful error messages and retry functionality

## How to Use

1. **Start the server** (if not already running):
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Open in browser**:
   Navigate to `http://localhost:3000` in your web browser

3. **Answer questions**:
   - Click on options to select your answer
   - Click "Next" to proceed
   - Click "Previous" to go back

4. **View diagnosis**:
   - After completing all questions, you'll see your personalized diagnosis
   - View recommendations and product suggestions
   - Click "Start Over" to begin again

## File Structure

```
public/
├── index.html    # Main HTML structure
├── styles.css    # Styling and animations
├── app.js        # JavaScript logic and API integration
└── README.md     # This file
```

## API Integration

The UI integrates with the following API endpoints:

- `GET /api/questions/first` - Get the first question
- `POST /api/questions/next` - Get the next question
- `POST /api/responses` - Save user answers
- `POST /api/responses/:sessionId/complete` - Complete questionnaire and get diagnosis

## Customization

### Change API URL

Edit `app.js` and update the `API_BASE_URL` constant:

```javascript
const API_BASE_URL = 'http://your-api-url.com/api';
```

### Styling

All styles are in `styles.css`. You can customize:
- Colors (gradient background, buttons, etc.)
- Fonts
- Spacing and padding
- Animations

### Configuration

The UI automatically handles:
- Session management
- Answer tracking
- Question navigation
- Error handling

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure:
1. The API server is running
2. CORS is enabled in the server configuration
3. You're accessing the UI from the same origin or CORS is configured for your domain

### API Connection Issues

1. Check that the API server is running on the correct port
2. Verify the API_BASE_URL in app.js matches your server URL
3. Check browser console for detailed error messages

### Questions Not Loading

1. Ensure you have created questions in the database
2. Make sure at least one question has `isFirstQuestion: true`
3. Check that questions are active (`isActive: true`)

## Development

To modify the UI:

1. Edit the HTML structure in `index.html`
2. Update styles in `styles.css`
3. Modify JavaScript logic in `app.js`
4. Refresh the browser to see changes

No build process required - it's pure HTML/CSS/JavaScript!

