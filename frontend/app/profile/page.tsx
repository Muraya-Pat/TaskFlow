'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Avatar,
  Divider, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { profileApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Update profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete account
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get() as User;
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const updated = await profileApi.update({ name, email }) as User;
      setProfile(updated);
      setProfileSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await profileApi.deleteAccount();
      logout();
      router.push('/login');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#a78bfa' }} />
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh' }}>

        {/* Navbar */}
        <Box
          sx={{
            px: 3, py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'rgba(10,15,30,0.8)',
          }}
        >
          <IconButton size="small" onClick={() => router.push('/')}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#a78bfa', fontWeight: 600 }}>
            Profile
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Avatar + name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 56, height: 56,
                bgcolor: 'rgba(167,139,250,0.15)',
                color: '#a78bfa',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{profile?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
            </Box>
          </Box>

          {/* Update profile */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Personal information
              </Typography>

              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess('')}>
                  {profileSuccess}
                </Alert>
              )}
              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileError('')}>
                  {profileError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={profileSaving}>
                    {profileSaving ? <CircularProgress size={18} sx={{ color: '#0a0f1e' }} /> : 'Save changes'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Change password
              </Typography>

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>
                  {passwordSuccess}
                </Alert>
              )}
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
                  {passwordError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={passwordSaving}>
                    {passwordSaving ? <CircularProgress size={18} sx={{ color: '#0a0f1e' }} /> : 'Change password'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account created date */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since{' '}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : '—'}
              </Typography>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card sx={{ border: '1px solid rgba(248,113,113,0.2) !important' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#f87171' }}>
                Danger zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Deleting your account is permanent. All your tasks will be removed.
              </Typography>

              {deleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {deleteError}
                </Alert>
              )}

              <Button
                variant="outlined"
                onClick={handleDeleteAccount}
                disabled={deleting}
                sx={{
                  borderColor: 'rgba(248,113,113,0.4)',
                  color: '#f87171',
                  '&:hover': {
                    borderColor: '#f87171',
                    backgroundColor: 'rgba(248,113,113,0.06)',
                  },
                }}
              >
                {deleting ? <CircularProgress size={18} sx={{ color: '#f87171' }} /> : 'Delete account'}
              </Button>
            </CardContent>
          </Card>

        </Box>
      </Box>
    </ProtectedRoute>
  );
}