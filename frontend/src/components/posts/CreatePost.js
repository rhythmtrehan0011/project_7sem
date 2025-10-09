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
  Autocomplete,
  Chip,
} from '@mui/material';
import api from '../../config/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    category: 'General',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await api.get('/posts/meta/tags');
      setAvailableTags(response.data.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
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
    setLoading(true);
    setError('');

    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and body are required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/posts', formData);
      navigate(`/posts/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'General',
    'Technology',
    'Science',
    'Health',
    'Education',
    'Business',
    'Entertainment',
    'Sports',
    'Politics',
    'Other'
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Post Title"
            name="title"
            autoFocus
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={8}
            id="body"
            label="Post Content"
            name="body"
            value={formData.body}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={formData.tags}
            onChange={(event, newValue) => {
              setFormData({
                ...formData,
                tags: newValue,
              });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags..."
                sx={{ mb: 2 }}
              />
            )}
          />

          <Autocomplete
            options={categories}
            value={formData.category}
            onChange={(event, newValue) => {
              setFormData({
                ...formData,
                category: newValue || 'General',
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                sx={{ mb: 3 }}
              />
            )}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePost;
