import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit,
  PersonAdd,
  PersonRemove,
  LocationOn,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile ? '/profiles' : `/profiles/${id}`;
      const response = await api.get(endpoint);
      const profileData = response.data.data;
      
      setProfile(profileData);
      
      // Check if current user is following this profile
      if (!isOwnProfile && currentUser) {
        const isFollowing = profileData.followers?.some(
          follower => follower._id === currentUser._id
        );
        setFollowing(isFollowing);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, id, currentUser]);

  const handleFollow = async () => {
    if (!profile || !profile.user) return;

    setActionLoading(true);
    try {
      const endpoint = following ? `/profiles/unfollow/${profile.user._id}` : `/profiles/follow/${profile.user._id}`;
      const response = await api.post(endpoint);
      
      setProfile({
        ...profile,
        followers: response.data.toFollow.followers,
      });
      setFollowing(!following);
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Profile not found'}
        </Alert>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Info */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <Avatar
                src={profile.avatar}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {profile.user?.firstName?.[0]}{profile.user?.lastName?.[0]}
              </Avatar>
              
              <Typography variant="h4" gutterBottom>
                {profile.user?.firstName} {profile.user?.lastName}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {profile.user?.email}
              </Typography>

              {profile.location && (
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profile.location}
                  </Typography>
                </Box>
              )}

              {profile.bio && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profile.bio}
                </Typography>
              )}

              {isOwnProfile ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  component={Link}
                  to="/profile/edit"
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={following ? <PersonRemove /> : <PersonAdd />}
                  onClick={handleFollow}
                  disabled={actionLoading}
                  sx={{ mt: 2 }}
                >
                  {actionLoading ? <CircularProgress size={20} /> : following ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </Box>
          </Grid>

          {/* Stats and Followers/Following */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile.followers?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile.following?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Following
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Posts
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* Recent Followers */}
            {profile.followers && profile.followers.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Followers
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {profile.followers.slice(0, 6).map((follower) => (
                    <Chip
                      key={follower._id}
                      avatar={<Avatar src={follower.avatar}>{follower.firstName?.[0]}</Avatar>}
                      label={`${follower.firstName} ${follower.lastName}`}
                      variant="outlined"
                      component={Link}
                      to={`/profile/${follower._id}`}
                      clickable
                    />
                  ))}
                  {profile.followers.length > 6 && (
                    <Chip
                      label={`+${profile.followers.length - 6} more`}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Following */}
            {profile.following && profile.following.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Following
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {profile.following.slice(0, 6).map((following) => (
                    <Chip
                      key={following._id}
                      avatar={<Avatar src={following.avatar}>{following.firstName?.[0]}</Avatar>}
                      label={`${following.firstName} ${following.lastName}`}
                      variant="outlined"
                      component={Link}
                      to={`/profile/${following._id}`}
                      clickable
                    />
                  ))}
                  {profile.following.length > 6 && (
                    <Chip
                      label={`+${profile.following.length - 6} more`}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
