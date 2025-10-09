import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingGuard from './components/OnboardingGuard';
import Navbar from './components/layout/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Onboarding from './components/auth/Onboarding';

// Post Components
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import CreatePost from './components/posts/CreatePost';
import EditPost from './components/posts/EditPost';

// Profile Components
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Onboarding Route */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <PostList />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/posts/create" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <CreatePost />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/posts/:id" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <PostDetail />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/posts/:id/edit" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <EditPost />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Profile />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <EditProfile />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/:id" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Profile />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;