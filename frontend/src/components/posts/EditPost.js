import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    category: 'General',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchPost();
    fetchAvailableTags();
  }, [fetchPost]);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      const post = response.data.data;
      
      // Check if user is the author
      if (post.author._id !== user._id) {
        navigate('/');
        return;
      }

      setFormData({
        title: post.title,
        body: post.body,
        tags: post.tags || [],
        category: post.category || 'General',
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user._id, navigate]);

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
    setSaving(true);
    setError('');

    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and body are required');
      setSaving(false);
      return;
    }

    try {
      await api.put(`/posts/${id}`, formData);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
      console.error('Error updating post:', err);
    } finally {
      setSaving(false);
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
          Edit Post
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
              onClick={() => navigate(`/posts/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Update Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditPost;
