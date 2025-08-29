# FastTracker - Fasting Tracker App

A React Native mobile application for tracking intermittent fasting sessions with real-time metabolic state monitoring and comprehensive statistics.

## Features

- **Real-time Fasting Timer**: Track your fasting progress with live countdown and elapsed time
- **Metabolic State Tracking**: Visual indicators for Fed State, Catabolic State, Ketosis, Deep Ketosis, Autophagy, and Deep Autophagy
- **Preset Fasting Plans**: Quick start with 16:8, 18:6, 20:4, OMAD, and extended fasting options
- **Custom Durations**: Set custom fasting periods from 16 hours to 1 week
- **Statistics Dashboard**: Track completion rates, streaks, and historical data
- **User Profiles**: Manage weight, height, and fasting goals
- **Session Management**: Pause, resume, and cancel fasting sessions
- **Dark Theme UI**: Modern, clean interface inspired by financial apps

## Technology Stack

- **Frontend**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for local data persistence
- **Authentication**: JWT-based with secure token storage
- **Backend Integration**: RESTful API with comprehensive error handling
- **State Management**: React hooks (useState, useEffect, useRef)
- **Animations**: React Native Animated API

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd Fasting-Front-End
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Configure environment variables:
   Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_URL=http://your-backend-url:8000
```

4. Start the development server:

```bash
npx expo start
```

## Project Structure

```
app/
├── (auth)/
│   ├── login.tsx        # JWT-based login with fallback user fetching
│   └── signup.tsx       # User registration
├── (tabs)/
│   ├── _layout.tsx      # Tab navigation layout
│   ├── dashboard/
│   │   └── index.jsx    # Main fasting tracker interface
│   ├── statistics.jsx   # Comprehensive stats and analytics
│   └── settings.jsx     # User profile and app settings
└── _layout.jsx          # Root layout

services/
└── api.js               # API service layer with all backend endpoints
```

## API Integration

The app integrates with a FastAPI backend providing:

### Authentication Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - JWT-based authentication
- `GET /auth/users/{user_id}` - User profile retrieval
- `GET /auth/users/by-username/{username}` - User lookup by username
- `POST /auth/users/{user_id}/additional-info` - Profile updates

### Fasting Session Endpoints

- `POST /fasting/start` - Start new fasting session
- `POST /fasting/{session_id}/end` - End fasting session
- `POST /fasting/{session_id}/pause` - Pause active session
- `POST /fasting/{session_id}/resume` - Resume paused session
- `GET /fasting/active/{user_id}` - Get current active session
- `GET /fasting/sessions/{user_id}` - Get user's session history

### Analytics Endpoints

- `GET /fasting/stats/{user_id}` - Detailed statistics
- `GET /fasting/streaks/{user_id}` - Streak information
- `GET /fasting/analytics/{user_id}` - Analytics data
- `GET /fasting/timeline/{user_id}` - Calendar timeline data

### Goals Endpoints

- `POST /goals?user_id={id}` - Create fasting goals
- `GET /goals/{user_id}` - Get user goals
- `PUT /goals/{goal_id}` - Update goals
- `GET /goals/progress/{user_id}` - Goal progress tracking

## Key Components

### FastingTracker (Dashboard)

- Real-time timer with metabolic state visualization
- Preset duration selection with quick-start buttons
- Custom duration input with validation
- Session control (start, pause, resume, stop)
- Progress tracking with visual indicators

### Statistics Screen

- Total fasts and completion rates
- Average duration and weekly activity
- Streak tracking (current and best)
- Personal bests and historical data
- Weekly analytics preview

### Settings Screen

- User profile management
- Weight and height tracking
- Goal setting and updates
- Account management and logout

## Authentication Flow

1. **Login**: JWT token received and stored securely
2. **Token Decoding**: Extract user email/ID from JWT payload
3. **User Profile Fetching**: Retrieve full user profile from backend
4. **Session Management**: Maintain authentication state across app restarts
5. **Fallback Mechanisms**: Handle various JWT payload formats and missing user data

## Data Format

### Fasting Session Payload

```javascript
{
  user_id: 1,                    // Numeric user ID
  target_duration: 16,           // Hours as number
  fast_type: "16:8",            // Fasting type identifier
  notes: "Starting morning fast" // Optional session notes
}
```

### User Data Storage

```javascript
{
  id: 1,                    // Numeric user ID from backend
  email: "user@example.com",
  username: "username",
  weight: 70.5,            // Optional weight in kg
  height: 175,             // Optional height in cm
  goal: "Lose weight"      // Optional fasting goal
}
```

## Development Notes

### Common Issues and Solutions

1. **Network Request Failed on iOS**: Use local IP address instead of localhost in API_URL
2. **JWT User ID Mismatch**: Ensure proper numeric user ID extraction from JWT or user profile
3. **Navigation Timing**: Use Redirect component instead of router.replace in useEffect
4. **SDK Compatibility**: Use `--legacy-peer-deps` flag for npm install with Expo SDK 53

### Testing

Run the app on different platforms:

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web Browser
npx expo start --web
```

### Debugging

Enable comprehensive logging for API requests:

- All API responses are logged to console
- JWT payload decoding is logged for debugging
- Validation errors are displayed with detailed field information
- User authentication flow is tracked throughout the app

## Security Features

- JWT token secure storage with AsyncStorage
- Environment variables for API endpoints
- Input validation on all forms
- Secure authentication state management
- No hardcoded sensitive data

## Contributing

When contributing to this project:

1. Follow the existing code style and patterns
2. Test on both iOS and Android platforms
3. Ensure all API integrations handle errors gracefully
4. Maintain the dark theme UI consistency
5. Add proper logging for debugging complex flows
