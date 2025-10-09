import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const Onboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const steps = [
    'Welcome to BlogHub',
    'Tell us about yourself',
    'Complete your profile',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    completeOnboarding(); // Mark onboarding as complete even if skipped
    navigate('/');
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/profiles', formData);
      completeOnboarding(); // Mark onboarding as complete
      setCompleted(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar
        sx={{ width: 100, height: 100, mx: 'auto', mb: 3, bgcolor: 'primary.main' }}
      >
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </Avatar>
      
      <Typography variant="h4" gutterBottom>
        Welcome to BlogHub, {user?.firstName}! 🎉
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Let's set up your profile to get you started
      </Typography>

      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Typography variant="body1" paragraph>
          BlogHub is your space to share ideas, connect with others, and discover amazing content.
        </Typography>
        <Typography variant="body1" paragraph>
          In just a few steps, we'll help you create a profile that represents you and your interests.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleSkip}
          size="large"
        >
          Skip for now
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          size="large"
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );

  const renderBioStep = () => (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        Tell us about yourself
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Help others get to know you better
      </Typography>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          id="bio"
          label="Bio"
          name="bio"
          placeholder="Tell us about yourself, your interests, or what you like to write about..."
          value={formData.bio}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        <TextField
          fullWidth
          id="location"
          label="Location"
          name="location"
          placeholder="Where are you from? (optional)"
          value={formData.location}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderAvatarStep = () => (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Add a profile picture
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Make your profile more personal (optional)
      </Typography>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Avatar
          src={formData.avatar}
          sx={{ width: 120, height: 120, mx: 'auto', mb: 3 }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>

        <TextField
          fullWidth
          id="avatar"
          label="Avatar URL"
          name="avatar"
          placeholder="https://example.com/your-photo.jpg"
          value={formData.avatar}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 4 }}>
          You can always change this later in your profile settings
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Setup'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderCompletionStep = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h4" gutterBottom color="primary">
        🎉 Profile Setup Complete!
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        You're all set to start your BlogHub journey
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Redirecting you to the main page...
      </Typography>

      <CircularProgress />
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderBioStep();
      case 2:
        return renderAvatarStep();
      default:
        return null;
    }
  };

  if (completed) {
    return renderCompletionStep();
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </Paper>
    </Container>
  );
};

export default Onboarding;
