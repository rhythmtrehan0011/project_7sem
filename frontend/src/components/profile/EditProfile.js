import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profiles');
      const profile = response.data.data;
      
      setFormData({
        bio: profile.bio || '',
        location: profile.location || '',
        avatar: profile.avatar || '',
      });
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/profiles', formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={formData.avatar}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.firstName} {user?.lastName}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            fullWidth
            id="bio"
            label="Bio"
            name="bio"
            multiline
            rows={4}
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            id="location"
            label="Location"
            name="location"
            placeholder="Where are you from?"
            value={formData.location}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            id="avatar"
            label="Avatar URL"
            name="avatar"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatar}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfile;
