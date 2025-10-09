import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  Search,
  Add,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (tag) params.append('tag', tag);
      if (sort) params.append('sort', sort);

      const response = await api.get(`/posts?${params}`);
      setPosts(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, tag, sort]);

  const fetchMeta = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        api.get('/posts/meta/categories'),
        api.get('/posts/meta/tags'),
      ]);
      setCategories(categoriesRes.data.data);
      setTags(tagsRes.data.data);
    } catch (err) {
      console.error('Error fetching meta data:', err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleVote = async (postId, direction) => {
    try {
      const response = await api.post(`/posts/${postId}/vote`, { direction });
      // Update the post in the local state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, upvoters: response.data.data.upvoters, downvoters: response.data.data.downvoters }
          : post
      ));
    } catch (err) {
      console.error('Error voting on post:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScore = (post) => {
    const upvotes = post.upvoters?.length || 0;
    const downvotes = post.downvoters?.length || 0;
    return upvotes - downvotes;
  };

  if (loading && posts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1">
            Posts
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/posts/create"
          >
            Create Post
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Tag</InputLabel>
              <Select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                label="Tag"
              >
                <MenuItem value="">All</MenuItem>
                {tags.map((tagItem) => (
                  <MenuItem key={tagItem} value={tagItem}>
                    {tagItem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                label="Sort"
              >
                <MenuItem value="">Latest</MenuItem>
                <MenuItem value="most_upvoted">Most Upvoted</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {posts.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No posts found. Create the first post!
          </Typography>
        </Paper>
      ) : (
        <>
          {posts.map((post) => (
            <Card key={post._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      <Link 
                        to={`/posts/${post._id}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {post.title}
                      </Link>
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.body}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                      <Chip label={post.category} size="small" variant="outlined" />
                      {post.tags?.map((tagItem) => (
                        <Chip key={tagItem} label={tagItem} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      By {post.author?.firstName} {post.author?.lastName} • {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ ml: 2 }}>
                    <Typography variant="h6" color="primary">
                      {getScore(post)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      votes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions>
                <IconButton 
                  onClick={() => handleVote(post._id, 'up')}
                  color="primary"
                  size="small"
                >
                  <ThumbUp />
                </IconButton>
                <IconButton 
                  onClick={() => handleVote(post._id, 'down')}
                  color="error"
                  size="small"
                >
                  <ThumbDown />
                </IconButton>
                <IconButton size="small">
                  <Comment />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {post.comments?.length || 0}
                  </Typography>
                </IconButton>
                <Button
                  component={Link}
                  to={`/posts/${post._id}`}
                  size="small"
                  sx={{ ml: 'auto' }}
                >
                  Read More
                </Button>
              </CardActions>
            </Card>
          ))}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default PostList;
