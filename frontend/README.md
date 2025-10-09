# BlogHub Frontend

A modern React frontend for the BlogHub social media/blog platform.

## Features

- **Authentication**: User registration, login, password reset
- **Onboarding**: Guided profile setup for new users
- **Posts**: Create, read, update, delete posts with comments and voting
- **Profiles**: User profiles with bio, location, avatar, followers/following
- **Search & Filter**: Search posts by content, filter by category/tags
- **Responsive Design**: Modern Material-UI design that works on all devices

## Tech Stack

- React 18
- Material-UI (MUI) v5
- React Router v6
- Axios for API calls
- Context API for state management

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:4000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   # Create .env file in frontend directory
   echo "REACT_APP_API_URL=http://localhost:4000/api" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── posts/          # Post management components
│   ├── profile/        # Profile management components
│   └── layout/         # Layout components (Navbar, etc.)
├── context/            # React Context providers
├── config/             # Configuration files
└── App.js             # Main application component
```

## API Integration

The frontend integrates with the backend API through:

- **Authentication**: JWT token-based authentication
- **Posts**: Full CRUD operations with comments and voting
- **Profiles**: Profile management and social features
- **Error Handling**: Comprehensive error handling and user feedback

## Key Components

### Authentication
- `Login.js` - User login form
- `Register.js` - User registration form
- `ForgotPassword.js` - Password reset request
- `ResetPassword.js` - Password reset form
- `Onboarding.js` - New user profile setup wizard

### Posts
- `PostList.js` - Display all posts with search/filter
- `PostDetail.js` - Individual post view with comments
- `CreatePost.js` - Create new posts
- `EditPost.js` - Edit existing posts

### Profiles
- `Profile.js` - User profile display
- `EditProfile.js` - Profile editing form

### Layout
- `Navbar.js` - Main navigation bar
- `ProtectedRoute.js` - Route protection for authenticated users

## Usage

1. **Register/Login**: Create an account or sign in
2. **Onboarding**: New users are guided through profile setup
3. **Browse Posts**: View all posts on the homepage
4. **Create Posts**: Click "Create Post" to add new content
5. **Interact**: Vote on posts, add comments, and reply to comments
6. **Manage Profile**: Edit your profile and follow other users
7. **Search**: Use the search bar to find specific posts

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:4000/api)

## Development

To run in development mode:
```bash
npm start
```

To build for production:
```bash
npm run build
```

To run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the 7th semester backend project.